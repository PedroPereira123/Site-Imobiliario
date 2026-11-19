import {mkdir,readFile,writeFile,cp} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const source=path.join(root,'Site Imobiliario/design-export');
const output=path.join(root,'presentation-dist');
await mkdir(output,{recursive:true});
for(const [input,target] of [['home.html','index.html'],['imovel.html','imovel.html'],['prancha.html','design.html']]) {
  let html=await readFile(path.join(source,input),'utf8');
  html=html.replaceAll('Capital%20SP%20Home%20v3.dc.html','index.html').replaceAll('Capital%20SP%20Imovel.dc.html','imovel.html');
  // Validate export islands without executing the supplied JavaScript.
  for(const match of html.matchAll(/<script type="__bundler\/(?:manifest|template|ext_resources|page_order)">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  await writeFile(path.join(output,target),html);
}
// Keep original filenames working for links embedded in compressed nested previews.
await cp(path.join(output,'index.html'),path.join(output,'Capital SP Home v3.dc.html'));
await cp(path.join(output,'imovel.html'),path.join(output,'Capital SP Imovel.dc.html'));
await writeFile(path.join(output,'mapa.html'),'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Localização</title><body style="font:16px/1.5 sans-serif;background:#dcd1ba;color:#292d29;padding:24px"><p>Mapa não incluído no protótipo exportado.</p><p>Consulte a descrição da região na página do imóvel.</p></body></html>');
console.log('Capital SP: home, imóvel e prancha gerados em presentation-dist.');
