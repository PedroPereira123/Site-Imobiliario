import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const cache=path.join(root,'.local/image-cache');await mkdir(cache,{recursive:true});
const urls=new Set();
const island=(html,name)=>{const re=new RegExp('<script type="__bundler/'+name+'">([\\s\\S]*?)<\\/script>');const m=html.match(re);if(!m)throw Error('Missing '+name);return JSON.parse(m[1]);};
const decode=a=>{const bytes=Buffer.from(a.data,'base64');return a.compressed?gunzipSync(bytes):bytes;};
function collect(html){const template=island(html,'template');for(const m of template.matchAll(/https:\/\/(?:thumb|upload)\.wikimedia\.org\/[^\s"'<>\\)]+/g))urls.add(m[0]);for(const a of Object.values(island(html,'manifest')))if(a.mime==='text/html')collect(decode(a).toString());}
const files=['home.html','imovel.html','prancha.html'];const inputs=await Promise.all(files.map(f=>readFile(path.join(root,'design-export',f),'utf8')));inputs.forEach(collect);
const assets=new Map();let cursor=0;const queue=[...urls];
await Promise.all(Array.from({length:3},async()=>{while(cursor<queue.length){const url=queue[cursor++];const key=createHash('sha256').update(url).digest('hex');const filename=path.join(cache,key+'.jpg');let bytes;try{bytes=await readFile(filename);}catch{const downloadUrl=url.startsWith("https://upload.wikimedia.org/wikipedia/commons/")?url.replace("upload.wikimedia.org/wikipedia/commons/","thumb.wikimedia.org/wikipedia/commons/thumb/")+"/1920px-"+url.split("/").at(-1):url;const res=await fetch(downloadUrl,{signal:AbortSignal.timeout(45000)});if(!res.ok||!res.headers.get('content-type')?.startsWith('image/'))throw Error(res.status+' '+url);bytes=Buffer.from(await res.arrayBuffer());if(bytes[0]!==255||bytes[1]!==216)throw Error('Not JPEG: '+url);await writeFile(filename,bytes);}assets.set(url,{key,bytes});console.log(assets.size+'/'+queue.length,bytes.length);}}));
function replaceIsland(html,name,value){const re=new RegExp('(<script type="__bundler/'+name+'">)[\\s\\S]*?(<\\/script>)');return html.replace(re,(_,open,close)=>open+'\n'+JSON.stringify(value).replaceAll('<','\\u003c')+'\n'+close);}
function embed(html){let template=island(html,'template');const manifest=island(html,'manifest');for(const [url,{key,bytes}] of assets){if(!template.includes(url))continue;const id='photo-'+key;manifest[id]={mime:'image/jpeg',compressed:true,data:gzipSync(bytes).toString('base64')};template=template.replaceAll(url,id);}for(const a of Object.values(manifest)){if(a.mime==='text/html'){a.data=gzipSync(Buffer.from(embed(decode(a).toString()))).toString('base64');a.compressed=true;}}return replaceIsland(replaceIsland(html,'template',template),'manifest',manifest);}
for(let i=0;i<files.length;i++){const output=embed(inputs[i]);await writeFile(path.join(root,'design-export',files[i]),output);console.log(files[i],Buffer.byteLength(output));}
console.log('Embedded '+assets.size+' verified JPEGs; original credits preserved.');
