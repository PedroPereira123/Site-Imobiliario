import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createApplication} from '../../Gestor de Imóveis/server.mjs';

const property = {reference:'AP-TESTE', title:'Apartamento de teste', region:'Penha', city:'São Paulo', type:'Apartamento', use:'residential', description:'Descrição conferida do imóvel.', area:58, bedrooms:2, bathrooms:1, parking:1, salePrice:350000, rentPrice:2500, condominium:400, tax:100, taxPeriod:'monthly', privateAddress:'Rua privada 123', ownerName:'Nome privado', internalNotes:'Nota privada', demo:false,registration:{totalArea:70,ownerSource:'Teste',publication:{portalTitle:'Apartamento de teste'}}};
async function fixture(t) {
  const dir=await mkdtemp(path.join(tmpdir(),'capital-mvp-'));
  const app=await createApplication({dataDir:dir, seed:false});
  await app.createUser('gestor','UmaSenhaSegura!2026','manager');
  await app.createUser('editor','OutraSenhaSegura!2026','editor');
  await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${app.server.address().port}`;
  t.after(async()=>{await new Promise(r=>app.server.close(r));app.close();await rm(dir,{recursive:true,force:true});});
  async function request(url,method='GET',data,cookie='') {
    const r=await fetch(base+url,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...(method!=='GET'?{Origin:base}: {})},body:data?JSON.stringify(data):undefined});
    return {status:r.status, data:await r.json(), cookie:r.headers.get('set-cookie')?.split(';')[0]};
  }
  const login=await request('/api/login','POST',{username:'gestor',password:'UmaSenhaSegura!2026'});
  assert.equal(login.status,200);
  return {app,dir,base,request,cookie:login.cookie};
}

test('cadastro exige login e publicação exige gestor, inclusive na API',async t=>{
  const f=await fixture(t);
  assert.equal((await f.request('/api/admin/properties','POST',property)).status,401);
  const login=await f.request('/api/login','POST',{username:'editor',password:'OutraSenhaSegura!2026'});
  const created=await f.request('/api/admin/properties','POST',property,login.cookie);
  assert.equal(created.status,201);
  assert.equal((await f.request(`/api/admin/properties/${created.data.id}/status`,'POST',{status:'published',revision:1},login.cookie)).status,403);
  assert.equal((await f.request('/api/admin/settings','PUT',{whatsapp:'5511976653830'},login.cookie)).status,403);
});

test('ciclo persistente: rascunho, revisão, publicação, edição concorrente e retirada',async t=>{
  const f=await fixture(t);
  const created=await f.request('/api/admin/properties','POST',property,f.cookie);
  assert.equal(created.status,201); const id=created.data.id;
  assert.equal((await f.request('/api/catalog')).data.items.length,0);
  assert.equal((await f.request(`/api/properties/${id}`)).status,404);
  let updated=await f.request(`/api/admin/properties/${id}/status`,'POST',{status:'in_review',revision:1},f.cookie);
  assert.equal(updated.data.revision,2);
  updated=await f.request(`/api/admin/properties/${id}/status`,'POST',{status:'published',revision:2},f.cookie);
  assert.equal(updated.status,200);
  const pub=(await f.request(`/api/properties/${id}`)).data;
  assert.equal(pub.offers.length,2); assert.equal(pub.offers[0].price,350000);
  for(const field of ['privateAddress','ownerName','internalNotes','history'])assert.equal(field in pub,false);
  const result=await f.request(`/api/admin/properties/${id}`,'PUT',{...property,rentPrice:2600,revision:3},f.cookie);
  assert.equal(result.status,200);
  assert.equal((await f.request(`/api/admin/properties/${id}`,'PUT',{...property,revision:3},f.cookie)).status,409);
  assert.equal((await f.request(`/api/properties/${id}`)).data.offers[1].price,2500,'edição só muda público após revisão/publicação');
  assert.equal((await f.request(`/api/admin/properties/${id}`,'GET',undefined,f.cookie)).data.rentPrice,2600);
  await f.request(`/api/admin/properties/${id}/status`,'POST',{status:'published',revision:4},f.cookie);
  assert.equal((await f.request(`/api/properties/${id}`)).data.offers[1].price,2600);
  await f.request(`/api/admin/properties/${id}/status`,'POST',{status:'withdrawn',revision:5},f.cookie);
  assert.equal((await f.request(`/api/properties/${id}`)).status,404);
  assert.equal((await f.request('/api/catalog')).data.items.length,0);
  assert.ok((await readFile(path.join(f.dir,'capital.sqlite'))).length>0);
});

test('banco recupera cadastro após fechar e reabrir a aplicação',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'capital-restart-'));
  let app=await createApplication({dataDir:dir});
  const p=app.store.create(property,'teste');app.store.status(p.id,{status:'published',revision:1},'teste','manager');app.close();
  app=await createApplication({dataDir:dir});
  t.after(async()=>{app.close();await rm(dir,{recursive:true,force:true});});
  assert.equal(app.store.get(p.id).privateAddress,'Rua privada 123');
  assert.equal(app.store.publicGet(p.id).offers[1].price,2500);
  assert.equal(app.store.publicGet(p.id).privateAddress,undefined);
});

test('validação rejeita números inválidos, referência duplicada e campos de autoridade injetados',async t=>{
  const f=await fixture(t);
  for(const values of [{rentPrice:-1},{area:0},{title:''},{bedrooms:1.5},{salePrice:null,rentPrice:null},{region:'<script>'}]){
    assert.equal((await f.request('/api/admin/properties','POST',{...property,...values},f.cookie)).status,422);
  }
  const created=await f.request('/api/admin/properties','POST',{...property,status:'published',revision:900,history:[{actor:'invasor'}]},f.cookie);
  assert.equal(created.data.status,'draft');assert.equal(created.data.revision,1);
  assert.equal((await f.request('/api/admin/properties','POST',property,f.cookie)).status,409);
});

test('sessão, origem e logout protegem as mutações',async t=>{
  const f=await fixture(t);
  const r=await fetch(f.base+'/api/admin/properties',{method:'POST',headers:{Cookie:f.cookie,Origin:'https://outro-site.invalid','Content-Type':'application/json'},body:JSON.stringify(property)});
  assert.equal(r.status,403);
  const bad=await f.request('/api/login','POST',{username:'gestor',password:'errada'});assert.equal(bad.status,401);
  assert.equal((await f.request('/api/logout','POST',{},f.cookie)).status,200);
  assert.equal((await f.request('/api/admin/properties','GET',undefined,f.cookie)).status,401);
});

test('mídia valida formato, fica privada no rascunho e backup restaura imóvel e arquivo',async t=>{
  const f=await fixture(t);
  const p=(await f.request('/api/admin/properties','POST',property,f.cookie)).data;
  const url=`/api/admin/properties/${p.id}/media`;
  assert.equal((await f.request(url,'POST',{name:'arquivo.svg',data:Buffer.from('<svg/>').toString('base64'),revision:1},f.cookie)).status,422);
  const img='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC';
  const uploaded=await f.request(url,'POST',{name:'foto.png',data:img,alt:'Sala',revision:1},f.cookie);
  assert.equal(uploaded.status,201); const mediaId=uploaded.data.media[0].id;
  assert.equal((await fetch(f.base+`/media/${mediaId}`)).status,404);
  await f.request(`/api/admin/properties/${p.id}/status`,'POST',{status:'published',revision:2},f.cookie);
  assert.equal((await fetch(f.base+`/media/${mediaId}`)).status,200);
  const backup=await f.app.backup();
  await f.request(`/api/admin/properties/${p.id}/status`,'POST',{status:'withdrawn',revision:3},f.cookie);
  await f.app.restore(backup);
  assert.equal((await f.request(`/api/properties/${p.id}`)).status,200);
  assert.equal((await fetch(f.base+`/media/${mediaId}`)).status,200);
});

test('busca combina oferta, bairro, teto e dormitórios sem incluir rascunhos',async t=>{
  const f=await fixture(t);
  const p=(await f.request('/api/admin/properties','POST',property,f.cookie)).data;
  await f.request(`/api/admin/properties/${p.id}/status`,'POST',{status:'published',revision:1},f.cookie);
  for(const [q,total] of [['?operation=rent&region=Penha&max=2500&beds=2',1],['?operation=rent&max=2499',0],['?operation=sale&max=350000',1],['?beds=3',0]])assert.equal((await f.request('/api/catalog'+q)).data.items.length,total);
  assert.equal((await f.request('/api/properties/inexistente')).status,404);
  assert.equal((await fetch(f.base+'/server.mjs')).status,404);
  assert.equal((await fetch(f.base+'/data/capital.sqlite')).status,404);
});

test('backup captura uma versão consistente antes de novas alterações e rejeita corrupção',async t=>{
  const f=await fixture(t);
  await f.request('/api/admin/properties','POST',property,f.cookie);
  const pending=f.app.backup();
  f.app.store.create({...property,reference:'SEGUNDO'},'teste');
  const backup=await pending;
  const envelope=JSON.parse(await readFile(backup,'utf8'));
  assert.equal(JSON.parse(envelope.body).properties.length,1,'Mudanças após iniciar backup não entram na fotografia dos dados.');
  await writeFile(backup,JSON.stringify({...envelope,sha256:'invalido'}));
  await assert.rejects(f.app.restore(backup),/corrompido/);
  assert.equal(f.app.store.list().length,2,'Backup inválido não altera o banco.');
});

test('upload concorrente não apaga edição nem retirada realizada enquanto o arquivo era salvo',async t=>{
  const f=await fixture(t);
  const p=f.app.store.create(property,'teste');
  const img='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC';
  const pending=f.app.store.upload(p.id,{data:img,revision:1},'upload');
  f.app.store.status(p.id,{status:'withdrawn',revision:1},'gestor','manager');
  await assert.rejects(pending,/mudou/);
  const saved=f.app.store.get(p.id);assert.equal(saved.status,'withdrawn');assert.equal(saved.revision,2);assert.equal(saved.media.length,0);
});

test('assinatura de imagem sem conteúdo decodificável é rejeitada',async t=>{
  const f=await fixture(t);const p=f.app.store.create(property,'teste');
  const fake=Buffer.alloc(33);Buffer.from([137,80,78,71,13,10,26,10]).copy(fake);fake.write('IHDR',12);
  await assert.rejects(f.app.store.upload(p.id,{data:fake.toString('base64'),revision:1},'teste'),/válid/);
  assert.equal(f.app.store.get(p.id).media.length,0);
});
