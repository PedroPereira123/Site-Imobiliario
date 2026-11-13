import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {validateProperty,publicProperty} from '../../Gestor de Imóveis/domain.mjs';
import {openStore} from '../../Gestor de Imóveis/store.mjs';
const base={reference:'CAD-01',title:'Casa de teste',region:'Penha',city:'São Paulo',type:'Casa',use:'residential',area:60,bedrooms:2,bathrooms:1,parking:1,salePrice:400000,rentPrice:2500,condominium:0,tax:null,taxPeriod:'unknown',ownerName:'Dona privada',registration:{totalArea:90,ownerSource:'Indicação',publication:{portalTitle:'Casa na Penha',advertise:'yes',site:'yes',priceVisibility:'both',useTitle:'yes'}}};
test('finalidade industrial aceita seus tipos e rejeita combinação residencial incompatível',()=>{
  assert.equal(validateProperty({...base,use:'industrial',type:'Galpão'}).type,'Galpão');
  assert.throws(()=>validateProperty({...base,use:'industrial',type:'Apartamento'}),/campos/);
});
test('dados detalhados são tipados e persistidos sem aceitar características desconhecidas',()=>{
  const value=validateProperty({...base,registration:{...base.registration,commonArea:10,rooms:2,features:{infrastructure:['Elevador','Interfone'],flooring:['Porcelanato']},stations:['Penha','Vila Matilde'],ownerPhones:[{kind:'Celular',countryCode:'+55',number:'11999990000'}],ownerEmails:['dona@example.com'],captors:[{name:'Captador interno',commissionType:'Captador'}],keysLocation:'agency',keyBranch:'Matriz',keyCode:'123',assessedSalePrice:390000}});
  assert.equal(value.registration.totalArea,90);assert.equal(value.registration.assessedSalePrice,390000);
  assert.deepEqual(value.registration.features.infrastructure,['Elevador','Interfone']);
  assert.throws(()=>validateProperty({...base,registration:{...base.registration,features:{leisure:['Inexistente']}}}),/campos/);
  assert.throws(()=>validateProperty({...base,registration:{...base.registration,ownerEmails:['não-é-email']}}),/campos/);
  assert.throws(()=>validateProperty({...base,registration:{...base.registration,videoUrl:'javascript:alert(1)'}}),/campos/);
});
test('edição antiga preserva dados adicionais e atualização nova substitui somente dados permitidos',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'capital-expanded-'));const store=await openStore(dir);t.after(async()=>{store.close();await rm(dir,{recursive:true,force:true});});
  const p=store.create(base,'gestor');const updated=store.update(p.id,{...base,registration:undefined,title:'Novo título',revision:1},'editor');
  assert.equal(updated.registration.totalArea,90);assert.equal(updated.createdBy,'gestor');
  const forged=store.update(p.id,{...base,createdBy:'intruso',revision:2},'editor');assert.equal(forged.createdBy,'gestor');
});
test('publicação respeita visibilidade de preços sem vazar dados privados nem avaliações',()=>{
  const p={...validateProperty({...base,registration:{...base.registration,assessedSalePrice:399000,keyCode:'segredo',ownerEmails:['privado@example.com'],publication:{...base.registration.publication,priceVisibility:'none'}}}),id:'teste',revision:1,media:[]};
  const pub=publicProperty(p);assert.equal(pub.offers[0].price,null);assert.equal(pub.offers[1].price,null);
  for(const field of ['registration','ownerName','assessedSalePrice','keyCode','ownerEmails'])assert.equal(field in pub,false);
});
test('dados obrigatórios adicionais impedem publicação, mas permitem rascunho e mídia',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'capital-publish-'));const store=await openStore(dir);t.after(async()=>{store.close();await rm(dir,{recursive:true,force:true});});
  const p=store.create({...base,ownerName:'',registration:{publication:{}}},'gestor');
  assert.throws(()=>store.status(p.id,{status:'published',revision:1},'gestor','manager'),/publicar/);
  assert.equal(store.get(p.id).status,'draft');
});
test('anunciar no site desativado não expõe registro nem fotos após publicação',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'capital-hidden-'));const store=await openStore(dir);t.after(async()=>{store.close();await rm(dir,{recursive:true,force:true});});
  const p=store.create({...base,registration:{...base.registration,publication:{...base.registration.publication,site:'no'}}},'gestor');
  store.status(p.id,{status:'published',revision:1},'gestor','manager');assert.equal(store.catalog().length,0);
});
test('tipo legado pode ser preservado sem impedir edição nem restauração de backup',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'capital-legacy-'));const store=await openStore(dir);t.after(async()=>{store.close();await rm(dir,{recursive:true,force:true});});
  const old={...base,id:'legacy-id',use:'commercial',type:'Comercial',registration:undefined,revision:1,status:'draft',media:[],history:[]};
  store.db.prepare('INSERT INTO properties VALUES(?,?,?,?)').run(old.id,old.reference,JSON.stringify(old),null);
  const updated=store.update(old.id,{...old,title:'Título corrigido',revision:1},'editor');
  assert.equal(updated.type,'Comercial');assert.equal(updated.title,'Título corrigido');
  const backup=await store.backup();await store.restore(backup);assert.equal(store.get(old.id).type,'Comercial');
  assert.throws(()=>store.create({...base,use:'industrial',type:'Apartamento'},'editor'),/campos/);
});
