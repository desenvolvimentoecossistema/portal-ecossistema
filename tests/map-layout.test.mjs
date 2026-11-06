import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bindPortalMapLayout} from '../lib/portal-map-layout.js';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

test('selecionar e desmarcar mantém os campos existentes e o foco do painel',async()=>{
 const source=await readFile(new URL('../modules/mapa/index.html',import.meta.url),'utf8');
 const input={dataset:{focusKey:JSON.stringify(['niveis','Alfabetização'])},checked:false};
 const container={querySelectorAll:()=>[input]};
 const groups=[{key:'niveis',label:'Nível',options:[{value:'Alfabetização',count:12}],state:new Set(['Alfabetização'])}],entries=[];
 const cache=new WeakMap([[container,{entries,signature:JSON.stringify(['',groups.map(g=>[g.key,g.label,g.hidden,g.options])])}]]);
 const document={activeElement:input,createElement:()=>{throw Error('Não deve recriar o campo durante uma seleção.');}};
 const context=vm.createContext({document,stratSearch:'',filterUICache:cache,updateFilterCount:()=>{}});
 vm.runInContext(source.slice(source.indexOf('function buildFilterUI('),source.indexOf('function updateFilterCount(')),context);
 context.buildFilterUI(container,groups,entries,()=>{});assert.equal(input.checked,true);assert.equal(document.activeElement,input);
 groups[0].state.clear();context.buildFilterUI(container,groups,entries,()=>{});assert.equal(input.checked,false);assert.equal(document.activeElement,input);
});

test('a atualização dos resultados preserva rolagem após o navegador recalcular o layout',async()=>{
 const source=await readFile(new URL('../modules/mapa/index.html',import.meta.url),'utf8'),frames=[];
 const root={documentElement:{dataset:{}},defaultView:{requestAnimationFrame:cb=>frames.push(cb)}};
 const sidebar={scrollTop:480,scrollLeft:0,parentElement:null};
 const container={ownerDocument:root,scrollTop:0,scrollLeft:0,parentElement:sidebar};
 const context=vm.createContext({});vm.runInContext(source.slice(source.indexOf('function preservePortalFilterViewport('),source.indexOf('const filterUICache')),context);
 context.preservePortalFilterViewport(container,()=>{sidebar.scrollTop=0;});assert.equal(sidebar.scrollTop,480);
 sidebar.scrollTop=15;frames.shift()();assert.equal(sidebar.scrollTop,480);
 sidebar.scrollTop=25;frames.shift()();assert.equal(sidebar.scrollTop,480);assert.equal(root.documentElement.dataset.portalFilterUpdating,undefined);
});

test('o resumo de filtros ativos pode crescer sem deslocar a opção selecionada',async()=>{
 const source=await readFile(new URL('../modules/mapa/index.html',import.meta.url),'utf8'),frames=[];let extraHeight=0;
 const sidebar={scrollTop:480,scrollLeft:0,parentElement:null};
 const input={dataset:{focusKey:'nivel-alfa'},getBoundingClientRect:()=>({top:800+extraHeight-sidebar.scrollTop})};
 const root={activeElement:input,documentElement:{dataset:{}},defaultView:{requestAnimationFrame:cb=>frames.push(cb),getComputedStyle:element=>({overflowY:element===sidebar?'auto':'visible'})}};
 const container={ownerDocument:root,scrollTop:0,scrollLeft:0,parentElement:sidebar,contains:element=>element===input,querySelectorAll:()=>[input]};
 const context=vm.createContext({});vm.runInContext(source.slice(source.indexOf('function preservePortalFilterViewport('),source.indexOf('const filterUICache')),context);
 const initialTop=input.getBoundingClientRect().top;
 context.preservePortalFilterViewport(container,()=>{extraHeight=72;});
 assert.equal(sidebar.scrollTop,552);assert.equal(input.getBoundingClientRect().top,initialTop);
 frames.shift()();frames.shift()();assert.equal(input.getBoundingClientRect().top,initialTop);
 context.preservePortalFilterViewport(container,()=>{extraHeight=0;});
 frames.shift()();frames.shift()();assert.equal(sidebar.scrollTop,480);assert.equal(input.getBoundingClientRect().top,initialTop);
});
test('mostrar filtros preserva a rolagem mesmo quando o navegador reajusta o conteúdo',()=>{
 const main={scrollTop:360,scrollLeft:0},page={scrollTop:0,scrollLeft:0},frames=[];
 let click,hidden=true;
 const button={addEventListener:(_,handler)=>{click=handler;},setAttribute(){},querySelector:()=>({textContent:''})};
 const app={classList:{toggle(){hidden=!hidden;main.scrollTop=740;page.scrollTop=90;return hidden;}}};
 const root={defaultView:{requestAnimationFrame:handler=>frames.push(handler)},scrollingElement:page,getElementById:id=>id==='programs-app'?app:button,querySelector:()=>null,querySelectorAll:()=>[main]};
 bindPortalMapLayout(root);click();
 assert.equal(hidden,false);assert.equal(main.scrollTop,360);assert.equal(page.scrollTop,0);
 main.scrollTop=620;page.scrollTop=60;frames.shift()();frames.shift()();
 assert.equal(main.scrollTop,360);assert.equal(page.scrollTop,0);
});
test('o painel pode ser ocultado sem alterar os filtros e a faixa verde acompanha a direção da rolagem',()=>{
 const classes=()=>{const values=new Set();return{add:k=>values.add(k),remove:k=>values.delete(k),contains:k=>values.has(k),toggle:k=>{if(values.has(k)){values.delete(k);return false;}values.add(k);return true;}};};
 const app={classList:classes()},events=new Map(),attrs=new Map(),label={textContent:'Ocultar filtros'};
 const button={addEventListener:(k,f)=>events.set('toggle:'+k,f),setAttribute:(k,v)=>attrs.set(k,v),querySelector:()=>label};
 const nav={classList:classes(),style:{setProperty(){}},getBoundingClientRect:()=>({height:81}),addEventListener:(k,f)=>events.set('nav:'+k,f),contains:()=>false};
 const toolbar={...nav,classList:classes(),addEventListener:(k,f)=>events.set('toolbar:'+k,f)};const mainNav={classList:classes()};
 const main={scrollTop:0,addEventListener:(k,f)=>events.set('main:'+k,f)};
 const root={activeElement:null,getElementById:id=>id==='programs-app'?app:button,querySelector:s=>s==='.portal-map-hero'?nav:s==='.data-toolbar'?toolbar:mainNav,querySelectorAll:()=>[main]};
 bindPortalMapLayout(root);
 events.get('toggle:click')();assert(app.classList.contains('desktop-filters-hidden'));assert.equal(attrs.get('aria-expanded'),'false');assert.equal(label.textContent,'Mostrar filtros');
 events.get('toggle:click')();assert(!app.classList.contains('desktop-filters-hidden'));assert.equal(attrs.get('aria-expanded'),'true');
 main.scrollTop=160;events.get('main:scroll')();assert(nav.classList.contains('map-hero-hidden'));assert(toolbar.classList.contains('map-toolbar-hidden'));assert(!mainNav.classList.contains('map-hero-hidden'));
 main.scrollTop=100;events.get('main:scroll')();assert(!nav.classList.contains('map-hero-hidden'));assert(!toolbar.classList.contains('map-toolbar-hidden'));
 main.scrollTop=200;events.get('main:scroll')();events.get('nav:focusin')();assert(!nav.classList.contains('map-hero-hidden'));
});
