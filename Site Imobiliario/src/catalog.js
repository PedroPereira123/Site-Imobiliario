export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money=value=>value===null||value===undefined?'Não informado':Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export const offerFor=(p,operation)=>p.offers.find(o=>o.operation===operation)||p.offers.find(o=>o.operation==='rent')||p.offers[0];
export const propertyHref=(p,operation)=>`#/imovel/${encodeURIComponent(p.id)}${operation?`?operation=${operation}`:''}`;
export function contactHref(settings,p,operation) {
  if(!/^55\d{10,11}$/.test(settings.whatsapp??''))return null;
  const offer=p?offerFor(p,operation):null;
  const message=p?`Olá! Tenho interesse no imóvel ${p.reference} — ${p.title}, em ${p.region}, para ${offer.operation==='rent'?'locação':'compra'}. ${locationOrigin()}${propertyHref(p,offer.operation)}`:'Olá! Gostaria de conversar sobre os imóveis da Capital SP.';
  return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`;
}
function locationOrigin(){return typeof location!=='undefined'?location.origin+'/':'';}
export async function api(url,options={}) {
  const response=await fetch(url,{...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...options.headers},signal:AbortSignal.timeout(15000)});
  const data=await response.json();
  if(!response.ok){const e=new Error(data.message??'Não foi possível concluir.');e.status=response.status;e.fields=data.fields??{};throw e;}
  return data;
}
export const mutate=(url,method,data)=>api(url,{method,body:JSON.stringify(data)});
export function favorites(){try{const v=JSON.parse(localStorage.getItem('capital-favorites')??'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[];}catch{return [];}}
export function toggleFavorite(id){const value=favorites();const next=value.includes(id)?value.filter(x=>x!==id):[...value,id];try{localStorage.setItem('capital-favorites',JSON.stringify(next));}catch{}return next;}
