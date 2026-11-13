import {uses,typesByUse,featureGroups,stations,commissionTypes,portals} from '../Site Imobiliario/src/registration-schema.js';
export {uses,typesByUse};
export function normalizeRegistration(raw,fields){
  const r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  if(raw!==undefined&&r!==raw)fields.registration='Dados adicionais inválidos.';
  const out={};
  const txt=(name,max=200)=>{const value=r[name];if(value!==undefined&&value!==null&&typeof value!=='string'){fields['registration.'+name]='Informe um texto.';return '';}return String(value??'').trim().slice(0,max);};
  for(const name of ['solarFace','position','alternativeReference','standard','locationStandard','propertyCondition','zoning','ownerSource','keyAgent','keyBranch','keyCode','keyOther','street'])out[name]=txt(name,300);
  out.administrativeStatus=txt('administrativeStatus')||'Provisório';
  out.country=txt('country')||'Brasil';out.state=txt('state')||'São Paulo';out.addressSearchBy=txt('addressSearchBy')||'Logradouro';
  out.ownerActivities=txt('ownerActivities')||'Não enviar';
  for(const name of ['totalArea','commonArea','privateArea','ceilingHeight','floors','floorNumber','coveredParking','uncoveredParking','rooms','guarantorInsurance','fireInsurance','assessedSalePrice','assessedRentPrice','constructionYear','renovationYear']){
    const value=r[name];if(value===null||value===undefined||value===''){out[name]=null;continue;}
    const n=typeof value==='number'?value:typeof value==='string'?Number(value):NaN;
    const integer=['floors','floorNumber','coveredParking','uncoveredParking','rooms','constructionYear','renovationYear'].includes(name);
    if(!Number.isFinite(n)||n<0||n>1e12||(integer&&!Number.isInteger(n))||(name.endsWith('Year')&&(n<1000||n>new Date().getFullYear()+10)))fields['registration.'+name]='Valor inválido.';
    out[name]=n;
  }
  const choices=(name,list,defaultValue='unknown')=>{const v=r[name]??defaultValue;if(!list.includes(v))fields['registration.'+name]='Opção inválida.';return list.includes(v)?v:defaultValue;};
  for(const name of ['leased','authorized','exclusive','fgts','financing'])out[name]=choices(name,['unknown','yes','no']);
  out.keysLocation=choices('keysLocation',['unknown','agent','agency','owner','other']);
  const selected=(value,allowed,key)=>{if(value===undefined)return [];if(!Array.isArray(value)||value.length>300||value.some(v=>typeof v!=='string'||!allowed.includes(v))){fields[key]='Seleção inválida.';return [];}return [...new Set(value)];};
  out.intentions=selected(r.intentions,['sale','rent'],'registration.intentions');
  out.features={};for(const [key,group] of Object.entries(featureGroups))out.features[key]=selected(r.features?.[key],group.options,'registration.features.'+key);
  out.stations=selected(r.stations,stations,'registration.stations');
  out.tags=Array.isArray(r.tags)?[...new Set(r.tags.map(x=>String(x).trim()).filter(Boolean))].slice(0,30):txt('tags',1500).split(',').map(s=>s.trim()).filter(Boolean).slice(0,30);
  out.ownerPhones=[];
  if(r.ownerPhones!==undefined&&!Array.isArray(r.ownerPhones))fields['registration.ownerPhones']='Lista inválida.';
  for(const phone of Array.isArray(r.ownerPhones)?r.ownerPhones.slice(0,20):[]){
    if(!phone||typeof phone!=='object'){fields['registration.ownerPhones']='Telefone inválido.';continue;}
    const number=String(phone.number??'').trim();if(!number)continue;
    const prefix=String(phone.countryCode??'+55').trim();const kind=String(phone.kind??'Celular');
    if(!['Residencial','Comercial','Celular'].includes(kind)||!/^\+\d{1,4}$/.test(prefix)||!/^[\d\s()+.-]{5,30}$/.test(number))fields['registration.ownerPhones']='Confira tipo, prefixo e número do telefone.';
    out.ownerPhones.push({kind,countryCode:prefix,number});
  }
  out.ownerEmails=[];
  if(r.ownerEmails!==undefined&&!Array.isArray(r.ownerEmails))fields['registration.ownerEmails']='Lista inválida.';
  for(const email of Array.isArray(r.ownerEmails)?r.ownerEmails.slice(0,20):[]){const v=String(email).trim();if(!v)continue;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)||v.length>254)fields['registration.ownerEmails']='Confira os e-mails.';out.ownerEmails.push(v);}
  out.commissionType=choices('commissionType',['',...commissionTypes],'');out.captors=[];
  if(r.captors!==undefined&&!Array.isArray(r.captors))fields['registration.captors']='Lista inválida.';
  for(const c of Array.isArray(r.captors)?r.captors.slice(0,30):[]){if(!c||typeof c!=='object'){fields['registration.captors']='Participação inválida.';continue;}const name=String(c.name??'').trim().slice(0,200);if(!name)continue;const type=String(c.commissionType??'');if(type&&!commissionTypes.includes(type))fields['registration.captors']='Tipo de comissão inválido.';out.captors.push({name,commissionType:type});}
  const publication=r.publication&&typeof r.publication==='object'&&!Array.isArray(r.publication)?r.publication:{};
  out.publication={};
  for(const name of ['advertise','notifyOwner','featured','superFeatured','site','useTitle']){
    const value=publication[name]??(['advertise','site','useTitle'].includes(name)?'yes':'no');
    if(!['yes','no','unknown'].includes(value))fields['registration.publication.'+name]='Opção inválida.';out.publication[name]=['yes','no','unknown'].includes(value)?value:'unknown';
  }
  out.publication.priceVisibility=publication.priceVisibility??'both';if(!['both','sale','rent','none'].includes(out.publication.priceVisibility))fields['registration.publication.priceVisibility']='Opção inválida.';
  out.publication.portalTitle=String(publication.portalTitle??'').trim().slice(0,150);
  out.publication.siteDescription=String(publication.siteDescription??'').trim().slice(0,10000);
  out.publication.portals=selected(publication.portals,portals,'registration.publication.portals');
  for(const name of ['videoUrl','tourUrl']){
    const v=String(r[name]??'').trim();out[name]=v;
    if(v){try{const u=new URL(v);if(u.protocol!=='https:'||u.username||u.password||(name==='videoUrl'&&!['youtube.com','www.youtube.com','youtu.be','m.youtube.com'].includes(u.hostname)))throw new Error();}catch{fields['registration.'+name]='Informe um endereço HTTPS válido'+(name==='videoUrl'?' do YouTube.':'.');}}
  }
  return out;
}
export function publicationMissing(p){const r=p.registration??{};const fields={};
  if(!(r.totalArea>0))fields['registration.totalArea']='Informe a área total para publicar.';
  if(p.bedrooms===null||p.bedrooms===undefined)fields.bedrooms='Informe dormitórios (zero quando não se aplica).';
  if(!p.ownerName?.trim())fields.ownerName='Informe o proprietário para publicar.';
  if(!r.ownerSource?.trim())fields['registration.ownerSource']='Informe a mídia de origem.';
  if(!r.publication?.portalTitle?.trim())fields['registration.publication.portalTitle']='Informe o título para portais.';
  return fields;
}
export const canAppearOnSite=p=>!p.registration||(p.registration.publication?.advertise==='yes'&&p.registration.publication?.site==='yes');
export const suggestedTitle=p=>`${p.type}${p.bedrooms>0?' com '+p.bedrooms+' dormitório'+(p.bedrooms===1?'':'s'):''} em ${p.region}`;
