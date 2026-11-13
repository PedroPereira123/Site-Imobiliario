export const neighborhoods=['Penha','Vila Matilde','Vila Formosa','Tatuapé','Vila Ré','Ponte Rasa','São Miguel Paulista'];
export const properties=[
 {id:'AP-11876',name:'Apartamento na Penha',region:'Penha',price:2800,mode:'Alugar',beds:2,area:58,parking:1,photo:'living',noise:'Baixo',status:'Publicado',match:96,fee:480,tax:85,position:[40,29]},
 {id:'AP-11873',name:'Apartamento Vila Matilde',region:'Vila Matilde',price:3200,mode:'Alugar',beds:2,area:72,parking:2,photo:'dining',noise:'Moderado',status:'Publicado',match:92,fee:560,tax:110,position:[75,48]},
 {id:'AP-11869',name:'Residencial Neo Carrão',region:'Vila Formosa',price:2450,mode:'Alugar',beds:2,area:54,parking:1,photo:'bedroom',noise:'Baixo',status:'Em revisão',match:94,fee:430,tax:75,position:[49,74]},
 {id:'AP-11860',name:'Horizonte Tatuapé',region:'Tatuapé',price:780000,mode:'Comprar',beds:3,area:92,parking:2,photo:'balcony',noise:'Baixo',status:'Publicado',match:88,fee:850,tax:220,position:[20,54]},
 {id:'AP-11855',name:'Jardim Vila Ré',region:'Vila Ré',price:2100,mode:'Alugar',beds:2,area:51,parking:1,photo:'kitchen',noise:'Não disponível',status:'Publicado',match:85,fee:350,tax:65,position:[81,25]},
 {id:'CA-11842',name:'Casa Pátio Ponte Rasa',region:'Ponte Rasa',price:560000,mode:'Comprar',beds:3,area:118,parking:2,photo:'facade',noise:'Moderado',status:'Publicado',match:82,fee:0,tax:160,position:[65,14]},
 {id:'AP-11831',name:'Estação São Miguel',region:'São Miguel Paulista',price:1750,mode:'Alugar',beds:1,area:43,parking:0,photo:'living2',noise:'Moderado',status:'Publicado',match:80,fee:290,tax:50,position:[89,11]}
];
export const money=n=>'R$ '+Number(n).toLocaleString('pt-BR');
export function filterProperties(items,f={}){return items.filter(p=>(!f.mode||p.mode===f.mode)&&(!f.region||p.region===f.region)&&(!f.beds||p.beds>=Number(f.beds))&&(!f.max||p.price<=Number(f.max))&&(!f.parking||p.parking>=Number(f.parking))&&(!f.quiet||p.noise==='Baixo')&&(!f.query||`${p.name} ${p.region} ${p.id}`.toLocaleLowerCase('pt-BR').includes(f.query.toLocaleLowerCase('pt-BR'))));}
export const getProperty=id=>properties.find(p=>p.id===id)||properties[0];
export function readState(){try{return {...defaultState,...JSON.parse(localStorage.getItem('pm-demo-v1')||'{}')};}catch{return {...defaultState};}}
const defaultState={favorites:[],likes:[],rejected:[],appointments:[],preferences:{region:'',max:3500,beds:2,mode:'Alugar'}};
export const state=readState();
export function persist(){try{localStorage.setItem('pm-demo-v1',JSON.stringify(state));}catch{}}
export function toggleFavorite(id){state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];persist();}
export function decide(id,like){state.likes=state.likes.filter(x=>x!==id);state.rejected=state.rejected.filter(x=>x!==id);state[like?'likes':'rejected'].push(id);persist();}
