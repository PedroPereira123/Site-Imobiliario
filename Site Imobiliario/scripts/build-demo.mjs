import {mkdir,readFile,writeFile,copyFile,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const source=path.join(root,'Site Imobiliario/design');
const output=path.join(root,'presentation-dist');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
// Fonte única do site público: design/*.dc.html (sincronizado com o Claude Design).
// O build só ajusta destinos internos e injeta o runtime React exigido por support.js.
const runtime='<script src="./react.production.min.js"></script><script src="./react-dom.production.min.js"></script><script src="./support.js"></script>';
for(const [input,target] of [['home.dc.html','index.html'],['imovel.dc.html','imovel.html']]) {
  let html=await readFile(path.join(source,input),'utf8');
  if(!html.includes('<script src="./support.js"></script>')) throw new Error(`${input}: tag de support.js não encontrada`);
  html=html.replace('<script src="./support.js"></script>',runtime)
    .replaceAll('Capital%20SP%20Home%20v3.dc.html','index.html')
    .replaceAll('Capital%20SP%20Imovel.dc.html','imovel.html');
  await writeFile(path.join(output,target),html);
}
for(const f of ['support.js','image-slot.js','react.production.min.js','react-dom.production.min.js']) await copyFile(path.join(source,f),path.join(output,f));
await writeFile(path.join(output,'mapa.html'),'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Localização</title><body style="font:16px/1.5 sans-serif;background:#dcd1ba;color:#292d29;padding:24px"><p>Mapa não incluído no protótipo.</p><p>Consulte a descrição da região na página do imóvel.</p></body></html>');
console.log('Capital SP: index.html e imovel.html gerados em presentation-dist.');
