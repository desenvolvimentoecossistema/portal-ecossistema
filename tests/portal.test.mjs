import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import map from '../lib/generated-map.js';
import {portalNavigationHTML,bindPortalMenu} from '../lib/portal-navigation.js';
import {areas,offers,offerTypes,filterOffers,organizations,contacts} from '../lib/hub-data.ts';
import {resolvePortalMapLink} from '../lib/portal-map-links.js';
import {validateImport,IMPORT_COLUMNS} from '../lib/portal-import.ts';
class Bucket{
 constructor(){this.rows=new Map();}
 async get(key){const r=this.rows.get(key);return r?{etag:r.etag,json:async()=>JSON.parse(r.body)}:null;}
 async put(key,body,{onlyIf}={}){const old=this.rows.get(key);if(onlyIf instanceof Headers&&onlyIf.get('if-none-match')==='*'&&old||onlyIf?.etagMatches&&old?.etag!==onlyIf.etagMatches)return null;const etag=crypto.randomUUID();this.rows.set(key,{body,etag});return{etag};}
}
const origin='https://portal.example.test',admin={userId:'site:owner',email:'owner@example.test',displayName:'Owner'},visitor={...admin,email:'viewer@example.test'};
const config=()=>({BUCKET:new Bucket(),MAP_ORIGIN:origin,MAP_ADMIN_EMAILS:admin.email,PORTAL_SIGN_OUT:'/auth/logout',GOOGLE_SHEETS_ID:'1lzSTCKlcUU7BdzsQeseQ1AFVDCihXesEcINLM6S99bQ'});
test('o mapa usa o acesso do portal e mantém API e recursos no seu caminho',async()=>{
 const env=config(),response=await map.fetch(new Request(origin+'/'),env,admin),page=await response.text();
 assert.equal(response.status,200);assert(page.includes('aria-label="Áreas do portal"'));assert(page.includes('href="/imersoes"'));assert(page.includes('href="/mapa"'));assert(page.includes("fetch('/mapa/api/data'"));assert(!page.includes("fetch('/api/data'"));assert(!page.includes('class="portal-signout"'));assert(page.includes('<script nonce="'));
 assert(page.includes('rel="preload" href="/fonts/Cabin/'));const asset=page.match(/\/mapa\/assets\/[a-f0-9]+\.(?:png|webp)/)[0];const resource=await map.fetch(new Request(origin+asset.slice('/mapa'.length)),env,admin);assert.equal(resource.status,200);assert((await resource.arrayBuffer()).byteLength>0);
});
test('os dados atuais e complementares estão completos e a gravação respeita o administrador',async()=>{
 const env=config(),get=()=>map.fetch(new Request(origin+'/api/data'),env,admin),initial=await(await get()).json();
 assert.equal(Object.values(initial.snapshot.dims).reduce((n,org)=>n+Object.keys(org).length,0),38);assert(Object.keys(initial.snapshot.ext).length>0);assert(Object.keys(initial.snapshot.colors).length>0);assert(initial.snapshot.dims.motriz['Motriz Educação Comunidade'].cliente);
 const request=()=>new Request(origin+'/api/data',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify({snapshot:initial.snapshot,revision:null})});
 assert.equal((await map.fetch(request(),env,visitor)).status,403);assert.equal((await map.fetch(request(),env,admin)).status,200);assert.equal((await map.fetch(request(),env,admin)).status,409);assert((await(await get()).json()).revision);
 assert.equal((await(await map.fetch(new Request(origin+'/api/session'),env,visitor)).json()).canEdit,false);
});
test('a migração recusa sessões antigas, colunas extras e inscrições sem evento',()=>{
 const empty=Object.fromEntries(Object.keys(IMPORT_COLUMNS).map(k=>[k,[]]));assert.deepEqual(validateImport(empty),empty);assert.throws(()=>validateImport({...empty,oauth_sessions:[]}));assert.throws(()=>validateImport({...empty,registrations:[Object.fromEntries(IMPORT_COLUMNS.registrations.map(k=>[k,'x']))]}));assert.throws(()=>validateImport({...empty,events:[{id:'x',unexpected:'x'}]}));
});
test('a navegação destaca uma área e não exibe botão de saída',()=>{
 const html=portalNavigationHTML('mapa','/signout?q="');assert.equal((html.match(/aria-current="page"/g)||[]).length,1);assert(!html.includes('class="portal-signout"'));assert(!html.includes('Sair do portal'));assert(!html.includes('iframe'));
});
test('o catálogo mantém referências válidas e combina busca, área e tipo',()=>{
 assert.equal(areas.length,8);assert.equal(offerTypes.length,5);assert.equal(offers.length,38);
 assert.equal(new Set(offers.map(o=>o.id)).size,offers.length);
 assert(offers.every(o=>areas.some(a=>a.id===o.area)&&offerTypes.some(t=>t.id===o.type)&&(o.source||/^g3c975735ede_0_\d+$/.test(o.slide||''))));
 assert.equal(offers.filter(o=>o.planned).length,1);
 assert.equal(filterOffers({area:'equidade',type:'oportunidades'}).length,2);
 assert(filterOffers({query:'AVALIACAO'}).some(o=>o.area==='cdp'));
 assert.equal(filterOffers({query:'termo inexistente 123'}).length,0);
});
test('os perfis têm logos completas, descrições e os novos apoios preservam o estado da fonte',async()=>{
 for(const org of organizations){const bytes=await readFile(new URL('../public'+org.logo,import.meta.url));assert.equal(bytes.subarray(-8,-4).toString('ascii'),'IEND');assert(org.description.length>100);assert(org.logoBounds[4]>0&&org.logoBounds[5]>0);}
 assert.equal(organizations.find(o=>o.id==='traj').color,'#004CA2');assert.equal(contacts.filter(c=>c.area==='coinvest').length,6);
 assert(offers.some(o=>o.name==='Pipeline de posições estratégicas'&&o.status==='Em construção'));
 assert(offers.some(o=>o.name==='Rubrica de Evidências de Impacto'));assert(offers.some(o=>o.name.includes('Guideline de Custeio')));
 assert(!offers.some(o=>/indique o nome|como funciona\?|xxxxx/i.test(o.name+' '+o.description)));
});
test('os links da organização escolhem a aba certa e recusam chaves desconhecidas',()=>{
 const dims={motriz:{Edu:{segmento_categoria:'Educação'},Lid:{segmento_categoria:'Liderança'}},traj:{Bolsas:{segmento_categoria:'Liderança'}}};
 assert.deepEqual(resolvePortalMapLink('?organizacao=motriz&busca=Lid',dims),{org:'motriz',query:'Lid',tab:'liderancas'});
 assert.equal(resolvePortalMapLink('?organizacao=motriz',dims).tab,'educacao');assert.equal(resolvePortalMapLink('?organizacao=traj',dims).tab,'liderancas');
 assert.equal(resolvePortalMapLink('?organizacao=toString',dims).org,'');assert.equal(resolvePortalMapLink('?busca='+('x'.repeat(500)),dims).query.length,300);
});
test('o menu móvel abre, fecha por Escape e limpa seus ouvintes',()=>{
 const listeners=new Map(),attrs=new Map([['aria-expanded','false']]),classes=new Set();let focused=false;
 const button={getAttribute:k=>attrs.get(k),setAttribute:(k,v)=>attrs.set(k,v),addEventListener:(k,f)=>listeners.set('button:'+k,f),removeEventListener:k=>listeners.delete('button:'+k),focus:()=>focused=true};
 const nav={classList:{remove:k=>classes.delete(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)},addEventListener:(k,f)=>listeners.set('nav:'+k,f),removeEventListener:k=>listeners.delete('nav:'+k)};
 const root={querySelector:s=>s==='#portal-links'?nav:button,addEventListener:(k,f)=>listeners.set('root:'+k,f),removeEventListener:k=>listeners.delete('root:'+k)};
 const cleanup=bindPortalMenu(root);listeners.get('button:click')();assert.equal(attrs.get('aria-expanded'),'true');assert(classes.has('is-open'));listeners.get('root:keydown')({key:'Escape'});assert.equal(attrs.get('aria-expanded'),'false');assert(focused);cleanup();assert.equal(listeners.size,0);
});
