import {featureGroups} from './registration-schema.js';
export function readRegistration(form){
  const data=new FormData(form),r={publication:{},features:{}};
  for(const [name,value] of data){if(name.startsWith('reg.web.'))r.publication[name.slice(8)]=value;else if(name.startsWith('reg.'))r[name.slice(4)]=value;}
  for(const key of Object.keys(featureGroups))r.features[key]=[...form.querySelectorAll(`[data-feature="${key}"]:checked`)].map(x=>x.value);
  r.intentions=[...form.querySelectorAll('[data-intention]:checked')].map(x=>x.value);
  r.stations=[...form.querySelectorAll('[data-station]:checked')].map(x=>x.value);
  r.publication.portals=[...form.querySelectorAll('[data-portal]:checked')].map(x=>x.value);
  r.ownerPhones=[...form.querySelectorAll('[data-row="phone"]')].map(row=>({kind:row.querySelector('[data-phone-kind]').value,countryCode:row.querySelector('[data-phone-prefix]').value,number:row.querySelector('[data-phone-number]').value}));
  r.ownerEmails=[...form.querySelectorAll('[data-owner-email]')].map(x=>x.value);
  r.captors=[...form.querySelectorAll('[data-row="captor"]')].map(row=>({name:row.querySelector('[data-captor-name]').value,commissionType:row.querySelector('[data-captor-type]').value}));
  return r;
}
export function revealErrors(form,fields){
  let first;
  for(const key of Object.keys(fields??{})){
    const target=[...form.querySelectorAll('[data-error]')].find(x=>x.dataset.error===key);
    if(target){openAncestors(target);first??=target;}
  }
  first?.scrollIntoView({behavior:'smooth',block:'center'});
}
export function openAncestors(element){
  for(let details=element?.closest('details');details;details=details.parentElement?.closest('details'))details.open=true;
}
