import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {openStore} from './store.mjs';
import {authService} from './auth.mjs';
import {AppError,fail,filterCatalog} from './domain.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const site=path.resolve(here,'../Site Imobiliario');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.pdf':'application/pdf'};
async function jsonBody(req){if(!String(req.headers['content-type']??'').startsWith('application/json'))fail(415,'Use JSON.');let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>9_000_000)fail(413,'Arquivo maior que o limite permitido.');chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString());}catch{fail(400,'JSON inválido.');}}
export async function createApplication({dataDir=path.join(here,'data'),seed=false}={}) {
  const store=await openStore(dataDir);const auth=authService(store.db);const attempts=new Map();
  if(seed&&!store.list().length){const {properties}=await import('../Site Imobiliario/dist/data.js');for(const p of properties){let item=store.create({reference:p.id,title:p.name,region:p.region,city:'São Paulo',type:p.id.startsWith('CA')?'Casa':'Apartamento',use:'residential',description:'Imóvel fictício para testar a navegação. Fotos ilustrativas; não corresponde a uma oferta real.',area:p.area,bedrooms:p.beds,bathrooms:1,parking:p.parking,salePrice:p.mode==='Comprar'?p.price:null,rentPrice:p.mode==='Alugar'?p.price:null,condominium:p.fee,tax:p.tax,taxPeriod:'monthly',ownerName:'Proprietário fictício',registration:{totalArea:p.area,ownerSource:'Demonstração',publication:{portalTitle:p.name}},demo:true,demoPhoto:p.photo},'seed');if(p.status==='Publicado')store.status(item.id,{status:'published',revision:1},'seed','manager');}}
  const server=http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
    try {
      const host=req.headers.host;const port=server.address()?.port;const allowed=[`127.0.0.1:${port}`,`localhost:${port}`];
      if(!allowed.includes(host))fail(403,'Host não autorizado.');
      const url=new URL(req.url,`http://${host}`);const route=decodeURIComponent(url.pathname);
      if(!['GET','HEAD'].includes(req.method)&&req.headers.origin!==`http://${host}`)fail(403,'Origem não autorizada.');
      const user=auth.session(req.headers.cookie);
      if(route.startsWith('/api/admin/')||route==='/api/me'){if(!user)fail(401,'Entre para acessar o cadastro.');}
      if(route==='/api/login'&&req.method==='POST'){
        const key=req.socket.remoteAddress;const now=Date.now();const previous=attempts.get(key);const entry=previous&&now-previous.start<900000?previous:{start:now,count:0};if(entry.count>=15)fail(429,'Muitas tentativas. Aguarde 15 minutos.');entry.count++;attempts.set(key,entry);
        const body=await jsonBody(req);const session=await auth.login(body.username,body.password);attempts.delete(key);res.setHeader('Set-Cookie',`capital_session=${session.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);return send(200,session.user);
      }
      if(route==='/api/logout'&&req.method==='POST'){auth.logout(req.headers.cookie);res.setHeader('Set-Cookie','capital_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return send(200,{ok:true});}
      if(route==='/api/me'&&req.method==='GET')return send(200,user);
      if(route==='/api/settings'&&req.method==='GET')return send(200,store.settings());
      if(route==='/api/catalog'&&req.method==='GET')return send(200,{schemaVersion:1,items:filterCatalog(store.catalog(),url.searchParams)});
      const pub=route.match(/^\/api\/properties\/([^/]+)$/);if(pub&&req.method==='GET')return send(200,store.publicGet(pub[1]));
      if(route==='/api/admin/settings'){
        if(user.role!=='manager')fail(403,'Somente a gerência pode alterar configurações.');
        if(req.method==='GET')return send(200,store.settings());if(req.method==='PUT')return send(200,store.updateSettings(await jsonBody(req)));
      }
      if(route==='/api/admin/backup'&&req.method==='GET'){if(user.role!=='manager')fail(403,'Somente a gerência pode exportar backup.');const file=await store.backup();res.writeHead(200,{'Content-Type':'application/json','Content-Disposition':`attachment; filename="capital-sp-backup.json"`});return res.end(await readFile(file));}
      if(route==='/api/admin/properties'){
        if(req.method==='GET')return send(200,{items:store.list()});
        if(req.method==='POST')return send(201,store.create(await jsonBody(req),user.username));
      }
      const admin=route.match(/^\/api\/admin\/properties\/([^/]+)(?:\/(status|media))?$/);
      if(admin){const [,id,action]=admin;
        if(!action&&req.method==='GET')return send(200,store.get(id));
        if(!action&&req.method==='PUT')return send(200,store.update(id,await jsonBody(req),user.username));
        if(action==='status'&&req.method==='POST')return send(200,store.status(id,await jsonBody(req),user.username,user.role));
        if(action==='media'&&req.method==='POST')return send(201,await store.upload(id,await jsonBody(req),user.username));
      }
      const media=route.match(/^\/(media|api\/admin\/media)\/([a-f0-9-]{36})$/);
      if(media&&req.method==='GET'){const img=await store.media(media[2],media[1]!=='media'&&!!user);res.writeHead(200,{'Content-Type':img.type});return res.end(img.bytes);}
      if(route.startsWith('/api/')||!['GET','HEAD'].includes(req.method))fail(404,'Recurso não encontrado.');
      let file;
      if(route==='/'||route==='/index.html')file=path.join(site,'src/index.html');
      else if(/^\/[a-z-]+\.(js|css)$/.test(route)&&route!=='/server.mjs')file=path.join(site,'src',route.slice(1));
      else if(/^\/assets\/[a-z0-9-]+\.(png|pdf)$/.test(route))file=path.join(site,'dist',route.slice(1));
      else fail(404,'Página não encontrada.');
      let body;try {body=await readFile(file);}catch{fail(404,'Página não encontrada.');}res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream'});res.end(req.method==='HEAD'?undefined:body);
    } catch(e){if(res.headersSent){res.destroy();return;}if(!(e instanceof AppError))console.error('Falha interna:',e.message);send(e instanceof AppError?e.status:500,{message:e instanceof AppError?e.message:'Não foi possível concluir a operação.',fields:e.fields??{}});}
  });
  return {server,createUser:auth.createUser,backup:()=>store.backup(),restore:file=>store.restore(file),close:()=>store.close(),store};
}
