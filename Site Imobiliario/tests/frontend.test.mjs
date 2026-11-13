import test from 'node:test';
import assert from 'node:assert/strict';
import {contactHref} from '../src/catalog.js';
import {home,propertyPage,search} from '../src/public.js';
const settings={company:'Capital SP',whatsapp:'5511976653830'};
const p={id:'id-1',reference:'AP-1',title:'Apartamento <img src=x onerror=alert(1)>',region:'Penha',city:'São Paulo',type:'Apartamento',use:'residential',description:'<script>alert(1)</script>',area:58,bedrooms:2,bathrooms:1,parking:1,offers:[{operation:'sale',price:350000},{operation:'rent',price:2500}],condominium:null,tax:1200,taxPeriod:'annual',media:[],demo:false,publishedAt:'2026-11-13T12:00:00Z'};
test('contato mantém oferta, referência e WhatsApp confirmado, sem enviar mensagem',()=>{
  const href=new URL(contactHref(settings,p,'sale'));assert.equal(href.hostname,'wa.me');assert.equal(href.pathname,'/5511976653830');assert.ok(href.searchParams.get('text').includes('AP-1'));assert.ok(href.searchParams.get('text').includes('compra'));assert.equal(contactHref({whatsapp:'javascript:alert(1)'},p),null);
});
test('páginas escapam textos do cadastro e diferenciam encargos desconhecidos e IPTU anual',()=>{
  const html=propertyPage(p,settings,'rent');assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img src=x'));assert.ok(html.includes('Não informado'));assert.ok(html.includes('IPTU / ano'));assert.ok(!html.includes('Total mensal estimado'));
  const result=search([p],[p],new URLSearchParams({query:'"><script>alert(1)</script>'}),settings);assert.ok(!result.includes('<script>'));
});
test('site vazio explica ausência sem afirmar que existem exemplos disponíveis',()=>{
  const html=home([],settings);assert.ok(html.includes('Estamos preparando nossa seleção'));assert.ok(!html.includes('Explore a experiência com os imóveis de exemplo identificados.'));
});
test('preço oculto aparece sob consulta sem total que permita reconstruí-lo',()=>{
  const html=propertyPage({...p,offers:[{operation:'rent',price:null}],condominium:400,tax:100,taxPeriod:'monthly'},settings,'rent');
  assert.ok(html.includes('Sob consulta'));assert.ok(!html.includes('Total mensal estimado'));
});
