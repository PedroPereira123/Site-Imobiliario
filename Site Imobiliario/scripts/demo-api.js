// Incluído somente no build estático de apresentação.
const data=fetch('/demo-data.json').then(async response=>{if(!response.ok)throw new Error('Não foi possível carregar a apresentação.');return response.json();});
const settings={company:'Capital SP Imóveis',whatsapp:'5511976653830'};
const user={username:'Visitante · demonstração',role:'manager'};
function fail(status,message){const error=new Error(message);error.status=status;throw error;}
export async function demoApi(url,options={}){
 const method=(options.method??'GET').toUpperCase();
 if(method!=='GET')fail(409,'Modo apresentação: salvar, publicar e enviar arquivos não altera dados. Explore as telas livremente.');
 const {items,publicItems}=await data;
 const parsed=new URL(url,'https://demo.invalid');const route=parsed.pathname;
 if(route==='/api/settings'||route==='/api/admin/settings')return {...settings};
 if(route==='/api/me')return {...user};
 if(route==='/api/admin/properties')return {items:structuredClone(items)};
 if(route.startsWith('/api/admin/properties/')){const p=items.find(p=>p.id===decodeURIComponent(route.split('/').pop()));if(!p)fail(404,'Imóvel não encontrado.');return structuredClone(p);}
 if(route==='/api/catalog'){
 const params=parsed.searchParams;const operation=params.get('operation')??'';const max=params.get('max')?Number(params.get('max')):null;const beds=Number(params.get('beds')||0);const region=params.get('region');const query=(params.get('query')??'').toLocaleLowerCase('pt-BR');
 return {items:structuredClone(publicItems.filter(p=>(!region||p.region===region)&&(!beds||p.bedrooms>=beds)&&(!query||`${p.title} ${p.reference} ${p.region}`.toLocaleLowerCase('pt-BR').includes(query))&&p.offers.some(o=>(!operation||o.operation===operation)&&(max===null||o.price!==null&&o.price<=max))))};}
 if(route.startsWith('/api/properties/')){const p=publicItems.find(p=>p.id===decodeURIComponent(route.split('/').pop()));if(!p)fail(404,'Imóvel não encontrado.');return structuredClone(p);}
 fail(404,'Recurso indisponível na apresentação.');
}
document.addEventListener('click',event=>{const link=event.target.closest('a');if(link&&(/^(https?:)?\/\/wa\.me\//.test(link.getAttribute('href')??'')||link.getAttribute('href')?.startsWith('/api/'))){event.preventDefault();event.stopImmediatePropagation();const toast=document.querySelector('#toast');if(toast){toast.textContent='Demonstração: nenhum contato ou arquivo será enviado.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),4000);}}},true);
