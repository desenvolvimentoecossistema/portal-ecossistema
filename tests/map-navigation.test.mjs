import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import map from '../lib/generated-map.js';
import {resolvePortalMapView,syncPortalMapNavigation} from '../lib/portal-map-views.js';
import {portalNavigationHTML} from '../lib/portal-navigation.js';
import {portalMapPath,portalMapRequestTarget,portalStrategyHref,resolvePortalStrategyLink} from '../lib/portal-map-paths.js';
import {resolvePortalMapLink} from '../lib/portal-map-links.js';
test('as três subdivisões têm links próprios e recusam visões desconhecidas',()=>{
 const nav=portalNavigationHTML('mapa','');
 assert(nav.includes('>Mapa Programático</a>'));assert(nav.includes('<summary>Mapas de Atuação'));
 for(const view of ['mapa-alfa','mapa-fund2','mapa-lid']){assert(nav.includes('href="'+portalMapPath(view)+'"'));assert.equal(resolvePortalMapView('',portalMapPath(view)),view);}
 assert.equal(resolvePortalMapView('?visao=unknown'),'programas');
});
test('a abertura preserva a visão pedida enquanto os dados carregam',()=>{
 const urls=[],root={querySelectorAll:()=>[],querySelector:()=>null,defaultView:{location:{href:'https://example.test/mapa?visao=mapa-lid'},history:{replaceState:(state,title,url)=>urls.push(url)}}};
 syncPortalMapNavigation('programas',root,false);assert.equal(urls.length,0);
 syncPortalMapNavigation('mapa-lid',root,true);assert.equal(urls[0],'/mapa-de-atuacao/liderancas');
});
test('as páginas têm endereços distintos, sem transformar APIs e imagens em páginas',()=>{
 assert.equal(portalMapRequestTarget('/mapa-programatico').view,'programas');
 assert.equal(portalMapRequestTarget('/mapa-de-atuacao/liderancas').view,'mapa-lid');
 assert.equal(portalMapRequestTarget('/mapa-de-atuacao'),null);
 assert.equal(portalMapRequestTarget('/mapa','?visao=mapa-fund2&busca=teste').redirect,'/mapa-de-atuacao/fundamental-2?busca=teste');
 assert.equal(portalMapRequestTarget('/mapa/api/data').path,'/api/data');
 assert.equal(portalMapRequestTarget('/mapa-de-atuacao/constructor'),null);
 const key='Lideranças > Pipeline > Formação',href=portalStrategyHref(key,'mapa-lid');
 assert(href.startsWith('/mapa-programatico?'));
 assert.deepEqual(resolvePortalStrategyLink(href.split('?')[1],{[key]:{}}),{key,tab:'liderancas',origin:'mapa-lid'});
 assert.equal(resolvePortalStrategyLink('?estrategia=constructor',{}),null);
});
test('o mapa oferece as três subdivisões e o rodapé pertence ao conteúdo rolável',async()=>{
 const html=await(await map.fetch(new Request('https://example.test/'),{PORTAL_SIGN_OUT:'/login'},{userId:'u',email:'u@example.test'})).text();
 assert(!html.includes('id="view-switch"'));
 assert(!html.includes('<details class="map-view-menu">'));
 assert(!html.includes('Ver estratégias e organizações em lista'));
 assert(html.includes('renderPortalMapExplorer'));
 assert.match(html,/<div class="programs-grid" id="programs-grid"><\/div><footer/);
 assert.equal((html.match(/<footer class="portal-legal-footer"/g)||[]).length,4);
 const source=await readFile(new URL('../scripts/prepare-map.mjs',import.meta.url),'utf8');
 assert(source.includes('setView(portalRequestedView)'));
});

test('o carregamento mantém a estratégia recebida, inclusive ao mudar para Lideranças',async()=>{
 const html=await(await map.fetch(new Request('https://example.test/'),{PORTAL_SIGN_OUT:'/login'},{userId:'u',email:'u@example.test'})).text();
 const script=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match=>match[1]).find(code=>code.includes('function applyPortalSelection()'));
 const start=script.indexOf('let portalSelectionApplied=false;'),end=script.indexOf('async function loadSharedData()',start);
 for(const [key,origin,tab] of [['Alfabetização > Política Nacional > CNCA','mapa-alfa','educacao'],['Lideranças > Pipeline > Formação','mapa-lid','liderancas']]){
  const location=new URL('https://example.test/mapa-programatico'),calls=[];
  const context=vm.createContext({URL,portalRequestedSearch:portalStrategyHref(key,origin).split('?')[1],location,STRAT_CATALOG:{[key]:{}},activeTab:'educacao',resolvePortalStrategyLink,resolvePortalMapLink,DIMENSIONS:{},
   reloadProgramsData(){location.search='';},history:{replaceState(_state,_title,url){location.href=new URL(url,location).href;}},filterByEstrategia:(...args)=>calls.push(args)});
  vm.runInContext(script.slice(start,end)+';applyPortalSelection();applyPortalSelection();',context);
  assert.equal(context.activeTab,tab);assert.deepEqual(calls,[[key,origin]]);
  assert.equal(location.searchParams.get('estrategia'),key);assert.equal(location.searchParams.get('origem'),origin);
 }
});
