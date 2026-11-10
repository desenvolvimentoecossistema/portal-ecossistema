import {ecosystemOrbitColors} from './ecosystem-brand.js';
import {portalMapPath} from './portal-map-paths.js';
import {functionalAreasEnabled} from './portal-features.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const orbitHTML=(className="portal-hero-orbit")=>`<svg aria-hidden="true" viewBox="0 0 400 400" class="${className}" pointer-events="none"><g fill="none" stroke-width="28" stroke-linecap="round">${ecosystemOrbitColors.map((color,index)=>`<circle cx="200" cy="200" r="150" pathLength="100" stroke="${color}" stroke-dasharray="8 92" stroke-dashoffset="${index*-12.5}"/>`).join('')}</g><circle cx="200" cy="200" r="112" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.55"/></svg>`;
export function portalSectionHTML(title,description){return `<header class="portal-page-hero portal-map-hero">${orbitHTML()}<div class="hub-wrap portal-hero-inner"><div class="portal-map-heading"><h1>${escape(title)}</h1><p class="hub-intro">${escape(description)}</p></div>__PORTAL_MAP_TABS__</div></header>`;}
export function portalNavigationHTML(active,signOutPath){
 const links=[['inicio','/','Início'],['organizacoes','/organizacoes','Organizações Core'],...(functionalAreasEnabled?[['funcionais','/funcionais','Áreas Funcionais FL']]:[]),['mapa','/mapa-programatico','Mapa Programático'],['atuacao','','Mapas de Atuação'],['imersoes','/imersoes','Imersões em Eventos']];
 const renderLink=([id,url,label])=>id==='atuacao'?'<details class="portal-map-menu" data-portal-map-menu><summary'+(active==='atuacao'?' class="is-active" aria-current="page"':'')+'>Mapas de Atuação<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m6 8 4 4 4-4"/></svg></summary><div class="portal-map-submenu">'+[['mapa-alfa','Alfabetização'],['mapa-fund2','Fundamental 2'],['mapa-lid','Lideranças']].map(([view,name])=>'<a data-map-view="'+view+'" href="'+portalMapPath(view)+'">'+name+'</a>').join('')+'</div></details>':`<a href="${url}"${id==='mapa'?' data-portal-programmatic':''}${active===id?' aria-current="page"':''}>${label}</a>`;
 return `<header class="portal-nav"><div class="portal-nav-inner"><div class="portal-brand"><a class="portal-foundation-link" href="https://fundacaolemann.org.br/" target="_blank" rel="noopener noreferrer" aria-label="Site da Fundação Lemann (abre em outra aba)"><img src="/fundacao-lemann-logo.svg" alt="Fundação Lemann" width="100" height="34"></a><a class="portal-brand-title" href="/" aria-label="Portal do Ecossistema — início"><img class="portal-brand-orbit" src="/favicon-ecosystem.png?v=43a189506a6c" alt="" aria-hidden="true" width="34" height="34"><span>Portal do<br><strong>Ecossistema</strong></span></a></div><button class="portal-menu-toggle" type="button" aria-expanded="false" aria-controls="portal-links" data-portal-menu-toggle>Menu <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button><nav id="portal-links" aria-label="Áreas do portal">${links.map(renderLink).join('')}</nav></div></header>`;
}
export function bindPortalMenu(root=document){
 const button=root.querySelector('[data-portal-menu-toggle]'),nav=root.querySelector('#portal-links');
 if(!button||!nav)return ()=>{};
 const doc=root.ownerDocument||root,menus=[...(root.querySelectorAll?.('[data-portal-map-menu]')||[])];
 const closeDropdowns=()=>menus.forEach(menu=>{menu.open=false;});
 const close=()=>{button.setAttribute('aria-expanded','false');nav.classList.remove('is-open');};
 const toggle=()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);};
 const select=event=>{if(event.target?.closest?.('a')){close();closeDropdowns();}};
 const outside=event=>{if(!nav.contains?.(event.target))closeDropdowns();};
 const key=event=>{if(event.key!=='Escape')return;const opened=menus.find(menu=>menu.open);if(opened){closeDropdowns();opened.querySelector('summary')?.focus();return;}if(button.getAttribute('aria-expanded')==='true'){close();button.focus();}};
 button.addEventListener('click',toggle);nav.addEventListener('click',select);root.addEventListener('keydown',key);doc.addEventListener('click',outside);
 return ()=>{button.removeEventListener('click',toggle);nav.removeEventListener('click',select);root.removeEventListener('keydown',key);doc.removeEventListener('click',outside);};
}
