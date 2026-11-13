import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import path from 'node:path';
import {fail} from './domain.mjs';
let sharp;
for(const from of [import.meta.url,path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json')]){
  try{sharp=createRequire(from)('sharp');break;}catch{}
}
if(!sharp)throw new Error('Instale as dependências do cadastro: npm install na pasta Gestor de Imóveis.');
const options={limitInputPixels:40_000_000,failOn:'warning'};
export async function normalizeImage(bytes){
  try {
    const metadata=await sharp(bytes,options).metadata();
    if((metadata.pages??1)>1)fail(422,'Use uma imagem estática válida.');
    // Re-encoding decodes the image, bounds output size and strips EXIF/GPS metadata.
    return await sharp(bytes,options).rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).flatten({background:'#fff'}).jpeg({quality:88}).toBuffer();
  }catch{fail(422,'Imagem inválida ou dimensões acima do limite permitido.');}
}
export async function verifyImage(bytes){try{await sharp(bytes,options).raw().toBuffer();}catch{fail(422,'Imagem inválida no backup.');}}
