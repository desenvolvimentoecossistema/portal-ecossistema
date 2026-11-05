import {portalMapPath} from './portal-map-paths.js';
import {formatRecordedDate} from './publication-dates.js';
export function resolvePortalMapView(search,pathname=''){
 const area=pathname.match(/^\/mapa-de-atuacao\/([^/]+)\/?$/)?.[1];
 const areas={'alfabetizacao':'mapa-alfa','fundamental-2':'mapa-fund2','liderancas':'mapa-lid'},routeView=Object.hasOwn(areas,area)?areas[area]:null;
 if(routeView)return routeView;
 const view=new URLSearchParams(search).get('visao');
 return ['mapa-alfa','mapa-fund2','mapa-lid'].includes(view)?view:'programas';
}
export function syncPortalMapNavigation(view,root=document,updateAddress=true){
 if(root.body?.dataset.portalMapView&&root.body.dataset.portalMapView!=='programas')view=root.body.dataset.portalMapView;
 const acting=view!=='programas',labels={'mapa-alfa':'Alfabetização','mapa-fund2':'Fundamental 2','mapa-lid':'Lideranças'};
 const descriptions={'mapa-alfa':'Conheça as estratégias de atuação das organizações do Ecossistema em alfabetização.','mapa-fund2':'Conheça as estratégias de atuação das organizações do Ecossistema nos anos finais do Ensino Fundamental.','mapa-lid':'Conheça as estratégias de atuação das organizações do Ecossistema para o desenvolvimento de lideranças.'};
 root.querySelectorAll('[data-portal-programmatic]').forEach(link=>acting?link.removeAttribute('aria-current'):link.setAttribute('aria-current','page'));
 root.querySelectorAll('[data-portal-map-menu]').forEach(menu=>{
  const summary=menu.querySelector('summary');
  summary?.classList.toggle('is-active',acting);
  menu.querySelectorAll('[data-map-view]').forEach(link=>link.dataset.mapView===view?link.setAttribute('aria-current','page'):link.removeAttribute('aria-current'));
 });
 const heading=root.querySelector('.portal-map-heading h1'),description=root.querySelector('.portal-map-heading .hub-intro');
 if(heading)heading.textContent=acting?'Mapas de Atuação':'Mapa Programático';
 if(description)description.textContent=acting?descriptions[view]:'Consulte os programas das organizações do Ecossistema.';
 root.querySelectorAll('.portal-map-hero .l2-tabs').forEach(tabs=>{tabs.hidden=acting;});
 root.querySelectorAll('.l2-view-mapa').forEach(section=>{const footer=section.querySelector(':scope>.portal-legal-footer');if(footer)section.append(footer);});
 if(root.defaultView){
  root.title=(acting?'Mapas de Atuação · '+labels[view]:'Mapa Programático')+' | Portal do Ecossistema';
  if(!updateAddress)return;
  const url=new URL(root.defaultView.location.href);
  url.pathname=portalMapPath(view);url.searchParams.delete('visao');
  root.defaultView.history.replaceState(null,'',url.pathname+url.search+url.hash);
 }
}
export function setPortalMapLoadState(state){
 document.body.dataset.mapLoading=state==='ready'?'false':state;
 document.querySelectorAll('.map-load-state').forEach(element=>{element.textContent=state==='error'?'Não foi possível carregar os dados publicados. Recarregue a página para tentar novamente.':'Carregando o mapa…';});
 if(state==='error')document.querySelectorAll('[data-map-updated]').forEach(element=>{element.textContent='Última atualização: indisponível';});
}
export function setPortalMapUpdatedAt(value){
 const date=formatRecordedDate(value);
 document.querySelectorAll('[data-map-updated]').forEach(element=>{element.textContent='Última atualização: '+(date||'data não registrada');});
}
