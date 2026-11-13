import {normalizeRegistration,typesByUse,uses,suggestedTitle} from './registration.mjs';
export class AppError extends Error {
  constructor(status,message,fields={}) {super(message);this.status=status;this.fields=fields;}
}
export const fail=(status,message,fields)=>{throw new AppError(status,message,fields);};
const text=(value,max=200)=>typeof value==='string'?value.trim().slice(0,max):'';
export function validateProperty(input,{allowLegacyType=false}={}) {
  const fields={};
  const required=(key,max=200)=>{const v=text(input[key],max);if(!v||/[<>\x00-\x08]/.test(v))fields[key]='Preencha sem marcação HTML.';return v;};
  const num=(key,{min=0,integer=false,required=false}={})=>{
    const value=input[key]; if(value===null||value===undefined||value===''){if(required)fields[key]='Informe um valor.';return null;}
    const n=typeof value==='number'?value:Number(value);
    if(!Number.isFinite(n)||n<min||n>1e12||(integer&&!Number.isInteger(n)))fields[key]='Valor inválido.';
    return n;
  };
  const p={reference:required('reference',40).toUpperCase(),title:required('title',150),region:required('region',100),city:required('city',100),type:required('type',60),use:input.use,
    description:text(input.description,10000),area:num('area',{min:0.01,required:true}),bedrooms:num('bedrooms',{integer:true}),bathrooms:num('bathrooms',{integer:true}),parking:num('parking',{integer:true}),
    salePrice:num('salePrice',{min:0.01}),rentPrice:num('rentPrice',{min:0.01}),condominium:num('condominium'),tax:num('tax'),taxPeriod:input.taxPeriod,
    privateAddress:text(input.privateAddress,300),ownerName:text(input.ownerName,200),internalNotes:text(input.internalNotes,5000),demo:input.demo===true};
  if(!/^[\p{L}\p{N}_.\/-]+$/u.test(p.reference))fields.reference='Use letras, números, ponto, barra, hífen ou sublinhado.';
  if(![...Object.keys(uses),'other'].includes(p.use))fields.use='Selecione a finalidade.';
  if(!allowLegacyType&&typesByUse[p.use]&&!typesByUse[p.use].includes(p.type))fields.type='Selecione um tipo compatível com a finalidade.';
  if(input.registration!==undefined){
    p.registration=normalizeRegistration(input.registration,fields);
    if(input.registration?.intentions!==undefined){
      if(!p.registration.intentions.includes('sale'))p.salePrice=null;
      if(!p.registration.intentions.includes('rent'))p.rentPrice=null;
      if(p.registration.intentions.includes('sale')&&p.salePrice===null)fields.salePrice='Informe o preço de venda.';
      if(p.registration.intentions.includes('rent')&&p.rentPrice===null)fields.rentPrice='Informe o preço de locação.';
    }else p.registration.intentions=[...(p.salePrice!==null?['sale']:[]),...(p.rentPrice!==null?['rent']:[])];
  }
  if(!['monthly','annual','unknown'].includes(p.taxPeriod))fields.taxPeriod='Informe o período do IPTU.';
  if(p.salePrice===null&&p.rentPrice===null)fields.rentPrice='Informe pelo menos um preço de venda ou locação.';
  if(Object.keys(fields).length)fail(422,'Confira os campos destacados.',fields);
  return p;
}
export function publicProperty(p) {
  const web=p.registration?.publication;const price=(kind,value)=>!web||web.priceVisibility==='both'||web.priceVisibility===kind?value:null;
  return {schemaVersion:1,id:p.id,revision:p.revision,reference:p.reference,title:web?.useTitle==='no'?suggestedTitle(p):(web?.portalTitle||p.title),region:p.region,city:p.city,type:p.type,use:p.use,description:web?.siteDescription||p.description,area:p.area,bedrooms:p.bedrooms,bathrooms:p.bathrooms,parking:p.parking,
    condominium:p.condominium,tax:p.tax,taxPeriod:p.taxPeriod,demo:p.demo,publishedAt:p.publishedAt,updatedAt:p.updatedAt,
    offers:[...(p.salePrice!==null?[{operation:'sale',price:price('sale',p.salePrice)}]:[]),...(p.rentPrice!==null?[{operation:'rent',price:price('rent',p.rentPrice)}]:[])],
    media:(p.media??[]).map(m=>({id:m.id,url:`/media/${m.id}`,alt:m.alt})),demoPhoto:p.demo?p.demoPhoto??'living':null};
}
export function filterCatalog(items,params) {
  const operation=params.get('operation')??'';
  const max=params.get('max')?Number(params.get('max')):null;
  const beds=params.get('beds')?Number(params.get('beds')):null;
  const query=(params.get('query')??'').toLocaleLowerCase('pt-BR');
  return items.filter(p=>(!params.get('type')||p.type===params.get('type'))&&(!params.get('region')||p.region===params.get('region'))&&(!query||`${p.title} ${p.reference} ${p.region}`.toLocaleLowerCase('pt-BR').includes(query))&&(!beds||p.bedrooms!==null&&p.bedrooms>=beds)&&p.offers.some(o=>(!operation||o.operation===operation)&&(max===null||o.price!==null&&o.price<=max)));
}
export function decodeImage(data) {
  if(typeof data!=='string'||data.length>8_000_000||!/^[A-Za-z0-9+/]*={0,2}$/.test(data))fail(422,'Imagem inválida ou maior que 5 MB.');
  const bytes=Buffer.from(data,'base64');
  if(bytes.length>5*1024*1024||bytes.length<12)fail(422,'Imagem inválida ou maior que 5 MB.');
  let type;
  if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.subarray(12,16).toString()==='IHDR'&&bytes.length>=33)type='image/png';
  if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255&&bytes.at(-2)===255&&bytes.at(-1)===217)type='image/jpeg';
  if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP')type='image/webp';
  if(!type)fail(422,'Use uma imagem PNG, JPEG ou WebP válida.');
  return {bytes,type};
}
