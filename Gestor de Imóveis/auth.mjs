import {scrypt,randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {fail} from './domain.mjs';
const derive=promisify(scrypt);
const hash=s=>createHash('sha256').update(s).digest('hex');
export function authService(db) {
  return {
    async createUser(username,password,role='editor'){
      if(!/^[a-z0-9_.-]{3,40}$/i.test(username)||typeof password!=='string'||password.length<12||password.length>200||!['manager','editor'].includes(role))fail(422,'Usuário inválido ou senha com menos de 12 caracteres.');
      const salt=randomBytes(16).toString('hex');const key=Buffer.from(await derive(password,salt,64)).toString('hex');
      db.prepare('INSERT INTO users VALUES(?,?,?)').run(username,`${salt}:${key}`,role);
    },
    async login(username,password){
      if(typeof username!=='string'||typeof password!=='string'||password.length>200)fail(401,'Usuário ou senha inválidos.');
      const u=db.prepare('SELECT * FROM users WHERE username=?').get(username);
      const [salt,key]=(u?.password??`${'0'.repeat(32)}:${'0'.repeat(128)}`).split(':');
      const derived=Buffer.from(await derive(password,salt,64));
      if(!u||!timingSafeEqual(derived,Buffer.from(key,'hex')))fail(401,'Usuário ou senha inválidos.');
      const token=randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),u.username,Date.now()+8*60*60*1000);
      return {token,user:{username:u.username,role:u.role}};
    },
    session(cookie=''){const token=cookie.match(/(?:^|;\s*)capital_session=([a-f0-9]{64})(?:;|$)/)?.[1];if(!token)return null;const u=db.prepare('SELECT users.username,users.role FROM sessions JOIN users USING(username) WHERE sessions.token=? AND expires>?').get(hash(token),Date.now());return u??null;},
    logout(cookie=''){const token=cookie.match(/capital_session=([a-f0-9]{64})/)?.[1];if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));}
  };
}
