import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bindPortalMapLayout} from '../lib/portal-map-layout.js';
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
