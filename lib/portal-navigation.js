import {ecosystemOrbitColors} from './ecosystem-brand.js';
import {functionalAreasEnabled} from './portal-features.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const orbitHTML=(className="portal-hero-orbit")=>`<svg aria-hidden="true" viewBox="0 0 400 400" class="${className}" pointer-events="none"><g fill="none" stroke-width="28" stroke-linecap="round">${ecosystemOrbitColors.map((color,index)=>`<circle cx="200" cy="200" r="150" pathLength="100" stroke="${color}" stroke-dasharray="8 92" stroke-dashoffset="${index*-12.5}"/>`).join('')}</g><circle cx="200" cy="200" r="112" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.55"/></svg>`;
export function portalSectionHTML(title,description){return `<header class="portal-page-hero portal-map-hero">${orbitHTML()}<div class="hub-wrap portal-hero-inner"><div class="portal-map-heading"><h1>${escape(title)}</h1><p class="hub-intro">${escape(description)}</p></div>__PORTAL_MAP_TABS__</div></header>`;}
export function portalNavigationHTML(active,signOutPath){
 const links=[['inicio','/','Início'],['organizacoes','/organizacoes','Organizações Core'],...(functionalAreasEnabled?[['funcionais','/funcionais','Áreas Funcionais FL']]:[]),['mapa','/mapa','Mapas Programáticos e de Atuação'],['imersoes','/imersoes','Imersões em Eventos']];
 return `<header class="portal-nav"><div class="portal-nav-inner"><a class="portal-brand" href="/" aria-label="Portal do Ecossistema — início"><img src="/fundacao-lemann-logo.svg" alt="Fundação Lemann" width="100" height="34"><div class="portal-brand-title"><img class="portal-brand-orbit" src="/favicon-ecosystem.png" alt="" aria-hidden="true" width="34" height="34"><span>Portal do<br><strong>Ecossistema</strong></span></div></a><button class="portal-menu-toggle" type="button" aria-expanded="false" aria-controls="portal-links" data-portal-menu-toggle>Menu <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button><nav id="portal-links" aria-label="Áreas do portal">${links.map(([id,url,label])=>`<a href="${url}"${active===id?' aria-current="page"':''}>${label}</a>`).join('')}</nav></div></header>`;
}
export function bindPortalMenu(root=document){
 const button=root.querySelector('[data-portal-menu-toggle]'),nav=root.querySelector('#portal-links');
 if(!button||!nav)return ()=>{};
 const close=()=>{button.setAttribute('aria-expanded','false');nav.classList.remove('is-open');};
 const toggle=()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);};
 const key=event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){close();button.focus();}};
 button.addEventListener('click',toggle);nav.addEventListener('click',close);root.addEventListener('keydown',key);
 return ()=>{button.removeEventListener('click',toggle);nav.removeEventListener('click',close);root.removeEventListener('keydown',key);};
}
