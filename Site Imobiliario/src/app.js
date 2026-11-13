import {readRegistration,revealErrors,openAncestors} from './registration-form.js';
import {phoneRow,emailRow,captorRow} from './registration-editor.js';
import {typesByUse,uses} from './registration-schema.js';
import {api,mutate,escapeHTML as e,toggleFavorite,favorites} from './catalog.js';
import {home,search,propertyPage,savedPage,privacy} from './public.js';
import {login,listPage,editorPage,settingsPage,rows} from './manager.js';
import {header,footer,empty,toast,image,icon} from './ui.js';
const root=document.querySelector('#app'),modal=document.querySelector('#modal');
let settings={company:'Capital SP Imóveis',whatsapp:'5511976653830'},user=null,current=null,adminItems=[],renderVersion=0,busy=false;
async function render(){const version=++renderVersion;modal.close();const [path,query='']=(location.hash.slice(1)||'/').split('?');const parts=path.split('/').filter(Boolean),params=new URLSearchParams(query);
  root.setAttribute('aria-busy','true');
  try {
    const loadedSettings=await api('/api/settings');if(version!==renderVersion)return;settings=loadedSettings;let html;
    if(parts[0]==='admin'){
      try{const loadedUser=await api('/api/me');if(version!==renderVersion)return;user=loadedUser;}catch(err){if(err.status!==401)throw err;user=null;}
      if(!user)html=login();
      else if(parts[1]==='novo'){current=null;html=editorPage(user,null);}
      else if(parts[1]==='editar'){const loadedItem=await api('/api/admin/properties/'+encodeURIComponent(parts[2]??''));if(version!==renderVersion)return;current=loadedItem;html=editorPage(user,current);}
      else if(parts[1]==='configuracoes')html=settingsPage(user,await api('/api/admin/settings'));
      else{const loadedItems=(await api('/api/admin/properties')).items;if(version!==renderVersion)return;adminItems=loadedItems;html=listPage(user,adminItems);}
    }else if(parts[0]==='imovel'||parts[0]==='signature')html=propertyPage(await api('/api/properties/'+encodeURIComponent(parts[1]??'')),settings,params.get('operation'),parts[0]==='signature');
    else if(parts[0]==='privacidade')html=privacy(settings);
    else {const all=(await api('/api/catalog')).items;
      if(parts[0]==='busca')html=search((await api('/api/catalog?'+params)).items,all,params,settings);
      else if(parts[0]==='favoritos')html=savedPage(all.filter(p=>favorites().includes(p.id)),settings);
      else html=home(all,settings);
    }
    if(version!==renderVersion)return;
    root.innerHTML=html;
    try{const phaseState=JSON.parse(localStorage.getItem('capital-registration-phases')??'null');if(phaseState)document.querySelectorAll('[data-phase],[data-phase-group]').forEach(d=>{const key=d.dataset.phaseGroup?'group:'+d.dataset.phaseGroup:d.dataset.phase;if(key in phaseState)d.open=phaseState[key];});}catch{}
    document.title=`${parts[0]==='admin'?'Cadastro de imóveis':parts[0]==='busca'?'Encontre seu imóvel':'Seu lugar na Zona Leste'} · Capital SP`;
    document.querySelectorAll('[data-favorite]').forEach(b=>b.setAttribute('aria-pressed',favorites().includes(b.dataset.favorite)));
    document.querySelector('main')?.setAttribute('tabindex','-1');
    window.scrollTo({top:0,behavior:'instant'});
  } catch(err){if(version!==renderVersion)return;root.innerHTML=`${header()}<main class="section" id="main">${empty(err.status===404?'Este imóvel não está disponível':'Não foi possível carregar',err.status===404?'Ele pode ter sido retirado ou o endereço pode estar incorreto.':err.message)}<button class="btn outline" data-action="retry">Tentar novamente</button></main>${footer(settings)}`;}
  finally{if(version===renderVersion)root.removeAttribute('aria-busy');}
}
function error(form,err){form.querySelectorAll('[data-error]').forEach(x=>x.textContent=err.fields?.[x.dataset.error]??'');revealErrors(form,err.fields);const box=form.querySelector('.form-error');if(box)box.textContent=err.message;if(err.status===401){toast('Sua sessão expirou. Entre novamente.');render();}}
function readEditor(){const form=document.querySelector('#property-form');if(!form?.reportValidity())return null;const values=Object.fromEntries(new FormData(form));values.registration=readRegistration(form);values.demo=form.elements.demo.checked;values.mediaIds=[...form.querySelectorAll('[data-media]')].map(x=>x.dataset.media);return values;}
async function saveEditor(){const values=readEditor();if(!values)return null;
  current=current?await mutate('/api/admin/properties/'+current.id,'PUT',{...values,revision:current.revision}):await mutate('/api/admin/properties','POST',values);
  return current;
}
async function guarded(form,fn){if(busy)return;busy=true;const buttons=[...document.querySelectorAll('button,input[type=file]')];buttons.forEach(b=>b.disabled=true);form?.querySelectorAll('.form-error,[data-error]').forEach(el=>el.textContent='');try{await fn();}catch(err){if(form)error(form,err);else toast(err.message);}finally{busy=false;buttons.forEach(b=>b.disabled=false);}}
function go(hash){if(location.hash===hash)render();else location.hash=hash;}
document.addEventListener('submit',event=>{const form=event.target;event.preventDefault();
  if(form.id==='home-search'||form.id==='filters'){const data=new URLSearchParams([...new FormData(form)].filter(([,v])=>v!==''));return go('#/busca?'+data);}
  if(form.id==='admin-filter'){const data=Object.fromEntries(new FormData(form));const q=data.query.toLocaleLowerCase('pt-BR');document.querySelector('#property-rows').innerHTML=rows(adminItems.filter(p=>(!data.status||p.status===data.status)&&`${p.title} ${p.reference} ${p.region}`.toLocaleLowerCase('pt-BR').includes(q)));return;}
  guarded(form,async()=>{
    if(form.id==='login-form'){await mutate('/api/login','POST',Object.fromEntries(new FormData(form)));go('#/admin');}
    if(form.id==='property-form'){const p=await saveEditor();if(p){toast('Cadastro salvo. Publique após conferir as informações.');go('#/admin/editar/'+p.id);}}
    if(form.id==='settings-form'){settings=await mutate('/api/admin/settings','PUT',Object.fromEntries(new FormData(form)));toast('Contato atualizado.');}
  });
});
document.addEventListener('click',event=>{const el=event.target.closest('button,a');if(!el)return;
  if(el.dataset.phases){document.querySelectorAll('details[data-phase],details[data-phase-group]').forEach(d=>d.open=el.dataset.phases==='expand');}
  if(el.hasAttribute('data-remove-row'))el.closest('[data-row]').remove();
  if(el.dataset.addRow){const kind=el.dataset.addRow;const selector={phone:'#owner-phones',email:'#owner-emails',captor:'#captors'}[kind];const target=document.querySelector(selector);const limit=kind==='captor'?30:20;if(target.children.length>=limit){toast('Limite de registros atingido.');return;}target.insertAdjacentHTML('beforeend',kind==='phone'?phoneRow():kind==='email'?emailRow():captorRow());}
  if(el.dataset.action==='suggest-title'){const f=document.querySelector('#property-form');const beds=Number(f.elements.bedrooms.value);f.elements['reg.web.portalTitle'].value=`${f.elements.type.value}${beds>0?' com '+beds+' dormitório'+(beds===1?'':'s'):''} em ${f.elements.region.value}`.slice(0,150);toast('Sugestão gerada. Revise antes de publicar.');}
  if(el.dataset.action==='search-street')guarded(document.querySelector('#property-form'),async()=>{const input=document.querySelector('[name="reg.street"]');const query=input.value.trim().toLocaleLowerCase('pt-BR');const matches=(await api('/api/admin/properties')).items.map(p=>p.registration?.street).filter(Boolean).filter(street=>street.toLocaleLowerCase('pt-BR').includes(query));const unique=[...new Set(matches)].slice(0,20);document.querySelector('#street-suggestions').innerHTML=unique.map(street=>`<option value="${e(street)}">`).join('');document.querySelector('#street-result').textContent=unique.length?unique.length+' logradouros encontrados. Selecione uma sugestão ou preencha manualmente.':'Nenhum logradouro encontrado no cadastro local. Preencha manualmente.';});
  if(el.classList.contains('skip')){event.preventDefault();document.querySelector('main')?.focus();return;}
  if(el.dataset.action==='menu'){const header=document.querySelector('.site-header');header.classList.toggle('menu-open');el.setAttribute('aria-expanded',header.classList.contains('menu-open'));}
  if(el.dataset.action==='retry')render();
  if(el.dataset.action==='logout')guarded(null,async()=>{await mutate('/api/logout','POST',{});current=null;await render();});
  if(el.dataset.action==='clear-favorites'){try{localStorage.removeItem('capital-favorites');toast('Favoritos apagados.');}catch{toast('O navegador bloqueou o armazenamento local.');}}
  if(el.dataset.favorite){event.preventDefault();const next=toggleFavorite(el.dataset.favorite);document.querySelectorAll('[data-favorite]').forEach(b=>{const saved=next.includes(b.dataset.favorite);b.classList.toggle('active',saved);b.setAttribute('aria-pressed',saved);});toast(next.includes(el.dataset.favorite)?'Imóvel salvo.':'Imóvel removido dos favoritos.');if(location.hash==='#/favoritos')render();}
  if(el.dataset.status){const form=document.querySelector('#property-form');const status=el.dataset.status;if(['published','withdrawn'].includes(status)&&!confirm(status==='published'?'Conferiu as informações? Publicar esta versão no site?':'Retirar o imóvel do site?'))return;guarded(form,async()=>{const p=await saveEditor();if(!p)return;current=await mutate(`/api/admin/properties/${p.id}/status`,'POST',{status,revision:p.revision});toast(status==='published'?'Imóvel publicado no site.':status==='withdrawn'?'Imóvel retirado do site.':'Cadastro enviado para revisão.');go('#/admin/editar/'+p.id);});}
  if(el.dataset.photo){const card=el.closest('[data-media]');if(el.dataset.photo==='remove')card.remove();else if(el.dataset.photo==='up'&&card.previousElementSibling)card.parentNode.insertBefore(card,card.previousElementSibling);else if(el.dataset.photo==='down'&&card.nextElementSibling)card.nextElementSibling.after(card);document.querySelectorAll('[data-media]>span').forEach((s,i)=>s.textContent=i===0?'Capa':'Foto '+(i+1));}
  if(el.dataset.gallery)guarded(null,async()=>{const p=await api('/api/properties/'+encodeURIComponent(el.dataset.gallery));const index=Number(el.dataset.index);modal.innerHTML=`<button class="modal-close round" data-action="close-modal" aria-label="Fechar galeria">${icon('close')}</button><h2>${e(p.title)}</h2><div class="expanded-photo">${image(p,'',index)}</div><p>Foto ${index+1} de ${p.media.length}</p>`;modal.showModal();});
  if(el.dataset.action==='close-modal')modal.close();
});
document.addEventListener('change',event=>{
  if(event.target.name==='use'){const select=document.querySelector('[name="type"]');select.innerHTML='<option value="">Selecione</option>'+(typesByUse[event.target.value]??[]).map(t=>`<option>${e(t)}</option>`).join('');}
  if(event.target.name==='reg.keysLocation')document.querySelectorAll('[data-key-for]').forEach(x=>x.hidden=x.dataset.keyFor!==event.target.value);
  if(event.target.hasAttribute('data-all-portals'))document.querySelectorAll('[data-portal]').forEach(x=>x.checked=event.target.checked);
  if(event.target.hasAttribute('data-portal'))document.querySelector('[data-all-portals]').checked=[...document.querySelectorAll('[data-portal]')].every(x=>x.checked);
  if(event.target.id!=='photos')return;const files=[...event.target.files];const form=document.querySelector('#property-form');guarded(form,async()=>{
  if(files.some(f=>f.size>5*1024*1024))throw new Error('Cada foto deve ter no máximo 5 MB.');if((current?.media.length??0)+files.length>20)throw new Error('Use no máximo 20 fotos por imóvel.');
  let p=await saveEditor();if(!p)return;let failure=null;
  for(const file of files){try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(new Error('Não foi possível ler a imagem.'));reader.readAsDataURL(file);});p=await mutate(`/api/admin/properties/${p.id}/media`,'POST',{name:file.name,data,alt:p.title+' — '+file.name,revision:p.revision});current=p;}catch(err){failure=err;break;}}
  go('#/admin/editar/'+p.id);toast(failure?'Cadastro salvo. '+failure.message:'Fotos adicionadas. Confira a capa antes de publicar.');
});});
modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}});
window.addEventListener('hashchange',render);
render();

document.addEventListener('input',event=>{if(!event.target.hasAttribute('data-station-search'))return;const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');const query=normalize(event.target.value);document.querySelectorAll('#station-list>label').forEach(label=>label.hidden=!normalize(label.textContent).includes(query));});
document.addEventListener('invalid',event=>{openAncestors(event.target);},true);
document.addEventListener('toggle',event=>{if(!event.target.matches('details[data-phase],details[data-phase-group]'))return;try{localStorage.setItem('capital-registration-phases',JSON.stringify(Object.fromEntries([...document.querySelectorAll('details[data-phase],details[data-phase-group]')].map(d=>[d.dataset.phaseGroup?'group:'+d.dataset.phaseGroup:d.dataset.phase,d.open]))));}catch{}},true);
