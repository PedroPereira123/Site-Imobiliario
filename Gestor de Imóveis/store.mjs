import {DatabaseSync} from 'node:sqlite';
import {mkdir,writeFile,readFile,rename,unlink} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {fail,validateProperty,publicProperty,decodeImage} from './domain.mjs';
import {normalizeImage,verifyImage} from './images.mjs';
import {publicationMissing,canAppearOnSite} from './registration.mjs';

export async function openStore(dir) {
  await mkdir(path.join(dir,'media'),{recursive:true});
  const db=new DatabaseSync(path.join(dir,'capital.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users(username TEXT PRIMARY KEY,password TEXT NOT NULL,role TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,username TEXT NOT NULL,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS properties(id TEXT PRIMARY KEY,reference TEXT UNIQUE NOT NULL,payload TEXT NOT NULL,published TEXT);
    CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,type TEXT NOT NULL,hash TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1),payload TEXT NOT NULL);`);
  db.prepare('INSERT OR IGNORE INTO settings VALUES(1,?)').run(JSON.stringify({company:'Capital SP Imóveis',whatsapp:'5511976653830'}));
  const settings=()=>JSON.parse(db.prepare('SELECT payload FROM settings WHERE id=1').get().payload);
  const list=()=>db.prepare('SELECT payload FROM properties ORDER BY rowid DESC').all().map(r=>JSON.parse(r.payload));
  const get=id=>{const row=db.prepare('SELECT payload FROM properties WHERE id=?').get(id);if(!row)fail(404,'Imóvel não encontrado.');return JSON.parse(row.payload);};
  const save=(p,published)=>{
    try {
      if(published===undefined)db.prepare('INSERT INTO properties(id,reference,payload) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET reference=excluded.reference,payload=excluded.payload').run(p.id,p.reference,JSON.stringify(p));
      else db.prepare('UPDATE properties SET reference=?,payload=?,published=? WHERE id=?').run(p.reference,JSON.stringify(p),published===null?null:JSON.stringify(published),p.id);
    } catch(e){if(e.message.includes('UNIQUE'))fail(409,'Já existe um imóvel com essa referência.');throw e;}
    return p;
  };
  const stamp=(p,actor,event)=>{p.revision++;p.updatedAt=new Date().toISOString();p.history.push({at:p.updatedAt,actor,event,revision:p.revision});return p;};
  const revision=(p,value)=>{if(!Number.isInteger(value)||p.revision!==value)fail(409,'Este imóvel mudou. Recarregue a versão atual antes de salvar.');};
  return {db,dir,settings,list,get,
    catalog:()=>db.prepare('SELECT published FROM properties WHERE published IS NOT NULL ORDER BY rowid DESC').all().map(r=>JSON.parse(r.published)),
    publicGet(id){const row=db.prepare('SELECT published FROM properties WHERE id=?').get(id);if(!row?.published)fail(404,'Imóvel não encontrado ou indisponível.');return JSON.parse(row.published);},
    create(input,actor){const p={...validateProperty(input),id:randomUUID(),createdBy:actor,revision:1,status:'draft',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),publishedAt:null,media:[],history:[],demoPhoto:input.demo===true?String(input.demoPhoto??'living'):null};p.history.push({at:p.createdAt,actor,event:'created',revision:1});return save(p);},
    update(id,input,actor){const p=get(id);revision(p,input.revision);const next={...p,...validateProperty(input,{allowLegacyType:p.type===input.type&&p.use===input.use})};
      if(input.mediaIds!==undefined){if(!Array.isArray(input.mediaIds)||new Set(input.mediaIds).size!==input.mediaIds.length||input.mediaIds.some(id=>!p.media.some(m=>m.id===id)))fail(422,'Seleção de fotos inválida.');next.media=input.mediaIds.map(id=>p.media.find(m=>m.id===id));}
      if(p.status==='published')next.status='in_review';return save(stamp(next,actor,'edited'));},
    status(id,input,actor,role){if(role!=='manager'&&input.status!=='in_review')fail(403,'Somente a gerência pode publicar ou retirar imóveis.');if(!['draft','in_review','published','withdrawn'].includes(input.status))fail(422,'Estado inválido.');const p=get(id);revision(p,input.revision);p.status=input.status;stamp(p,actor,input.status);
      if(input.status==='published'){validateProperty(p);const fields=publicationMissing(p);if(Object.keys(fields).length)fail(422,'Complete os campos obrigatórios para publicar.',fields);p.publishedAt=new Date().toISOString();return save(p,canAppearOnSite(p)?publicProperty(p):null);}
      if(input.status==='withdrawn')return save(p,null);return save(p);},
    async upload(id,input,actor){let p=get(id);revision(p,input.revision);if(p.media.length>=20)fail(422,'Limite de 20 fotos por imóvel.');const decoded=decodeImage(input.data);const bytes=await normalizeImage(decoded.bytes);const mediaId=randomUUID(),file=path.join(dir,'media',mediaId);await writeFile(file,bytes,{mode:0o600});
      try{p=get(id);revision(p,input.revision);}catch(e){await unlink(file).catch(()=>{});throw e;}
      db.prepare('INSERT INTO media VALUES(?,?,?)').run(mediaId,'image/jpeg',createHash('sha256').update(bytes).digest('hex'));p.media.push({id:mediaId,alt:String(input.alt??'Foto do imóvel').trim().slice(0,180)});if(p.status==='published')p.status='in_review';return save(stamp(p,actor,'photo_added'));},
    async media(id,privateAccess=false){const row=db.prepare('SELECT * FROM media WHERE id=?').get(id);if(!row)fail(404,'Foto não encontrada.');if(!privateAccess&&!this.catalog().some(p=>p.media.some(m=>m.id===id)))fail(404,'Foto indisponível.');return {bytes:await readFile(path.join(dir,'media',row.id)),type:row.type};},
    updateSettings(input){const phone=String(input.whatsapp??'').replace(/\D/g,'');if(!/^55\d{10,11}$/.test(phone))fail(422,'Informe WhatsApp com país 55, DDD e número.');const value={company:String(input.company??'Capital SP Imóveis').trim().slice(0,100)||'Capital SP Imóveis',whatsapp:phone};db.prepare('UPDATE settings SET payload=? WHERE id=1').run(JSON.stringify(value));return value;},
    async backup(){
      // Capture all relational state before yielding; media files are immutable.
      let snapshot;db.exec('BEGIN');try {snapshot={properties:db.prepare('SELECT * FROM properties').all(),users:db.prepare('SELECT * FROM users').all(),settings:settings(),media:db.prepare('SELECT * FROM media').all()};db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
      const directory=path.join(dir,'backups');await mkdir(directory,{recursive:true});const media=[];for(const row of snapshot.media)media.push({...row,data:(await readFile(path.join(dir,'media',row.id))).toString('base64')});
      const data={format:'capital-sp-backup-v1',createdAt:new Date().toISOString(),...snapshot,media};const body=JSON.stringify(data);const envelope=JSON.stringify({sha256:createHash('sha256').update(body).digest('hex'),body});const file=path.join(directory,`${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID()}.json`);await writeFile(file+'.tmp',envelope,{mode:0o600});await rename(file+'.tmp',file);return file;},
    async restore(file){const envelope=JSON.parse(await readFile(file,'utf8'));if(typeof envelope.body!=='string'||createHash('sha256').update(envelope.body).digest('hex')!==envelope.sha256)fail(422,'Backup corrompido.');const data=JSON.parse(envelope.body);if(data.format!=='capital-sp-backup-v1'||!Array.isArray(data.users)||!Array.isArray(data.properties)||!Array.isArray(data.media))fail(422,'Formato de backup inválido.');
      for(const m of data.media){if(!/^[a-f0-9-]{36}$/.test(m.id))fail(422,'Identificador de mídia inválido.');const decoded=decodeImage(m.data);if(decoded.type!==m.type||createHash('sha256').update(decoded.bytes).digest('hex')!==m.hash)fail(422,'Imagem corrompida no backup.');await verifyImage(decoded.bytes);}
      for(const p of data.properties){const value=JSON.parse(p.payload);validateProperty(value,{allowLegacyType:true});if(value.id!==p.id||value.reference!==p.reference)fail(422,'Registro de backup inválido.');}
      for(const m of data.media)await writeFile(path.join(dir,'media',m.id),Buffer.from(m.data,'base64'),{mode:0o600});
      db.exec('BEGIN IMMEDIATE');try {db.exec('DELETE FROM sessions;DELETE FROM properties;DELETE FROM media;DELETE FROM users;');for(const u of data.users)db.prepare('INSERT INTO users VALUES(?,?,?)').run(u.username,u.password,u.role);for(const p of data.properties)db.prepare('INSERT INTO properties VALUES(?,?,?,?)').run(p.id,p.reference,p.payload,p.published);for(const m of data.media)db.prepare('INSERT INTO media VALUES(?,?,?)').run(m.id,m.type,m.hash);db.prepare('UPDATE settings SET payload=? WHERE id=1').run(JSON.stringify(data.settings));db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}},
    close:()=>db.close()};
}
