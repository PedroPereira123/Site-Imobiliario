import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile,readFile,access} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
import {createApplication} from './server.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
export async function run(args=[]) {
  const dataDir=path.resolve(process.env.CAPITAL_DATA_DIR??path.join(here,'data'));
  const command=args[0]??'start';
  if(command==='restore'&&!args[1])throw new Error('Informe o arquivo: node server.mjs restore "caminho/backup.json". Pare o servidor primeiro.');
  const app=await createApplication({dataDir,seed:command==='start'&&process.env.CAPITAL_DEMO==='1'});
  if(command==='backup'){try{console.log('Backup criado:',await app.backup());}finally{app.close();}return;}
  if(command==='restore'){try{await app.backup();await app.restore(path.resolve(args[1]));console.log('Restauração concluída. As sessões anteriores foram invalidadas.');}finally{app.close();}return;}
  if(command==='user'){
    const input=createInterface({input:process.stdin,output:process.stdout});
    try{const username=await input.question('Usuário: ');const role=await input.question('Perfil (manager/editor): ');const password=process.env.CAPITAL_NEW_PASSWORD??await input.question('Senha (mínimo 12 caracteres; entrada visível neste terminal): ');await app.createUser(username,password,role);console.log('Usuário criado.');}finally{input.close();app.close();}return;
  }
  if(command!=='start'){app.close();throw new Error('Comando inválido. Use start, user, backup ou restore.');}
  if(!app.store.db.prepare('SELECT username FROM users LIMIT 1').get()){
    const password=randomBytes(18).toString('base64url');await app.createUser('admin',password,'manager');
    const local=path.resolve(here,'../Site Imobiliario/.local');await mkdir(local,{recursive:true});
    await writeFile(path.join(local,'acesso-inicial.txt'),`Capital SP — acesso local\nEndereço: http://127.0.0.1:${process.env.PORT??4173}/#/admin\nUsuário: admin\nSenha: ${password}\n\nArquivo privado, fora do versionamento. Não compartilhe nem publique.\n`,{mode:0o600});
    console.log('Primeiro acesso: consulte Site Imobiliario/.local/acesso-inicial.txt.');
  }
  const port=Number(process.env.PORT??4173);
  await new Promise((resolve,reject)=>{app.server.once('error',reject);app.server.listen(port,'127.0.0.1',resolve);});
  console.log(`Capital SP: http://127.0.0.1:${port}/\nCadastro: http://127.0.0.1:${port}/#/admin\nDados locais em: ${dataDir}`);
  const stop=()=>app.server.close(()=>{app.close();process.exit(0);});process.once('SIGINT',stop);process.once('SIGTERM',stop);
}
