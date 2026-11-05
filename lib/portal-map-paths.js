export function portalMapPath(view='programas'){
 const paths={'mapa-alfa':'/mapa-de-atuacao/alfabetizacao','mapa-fund2':'/mapa-de-atuacao/fundamental-2','mapa-lid':'/mapa-de-atuacao/liderancas'};
 return Object.hasOwn(paths,view)?paths[view]:'/mapa-programatico';
}
export function portalMapRequestTarget(pathname,search=''){
 const params=new URLSearchParams(search);
 if(/^\/mapa\/?$/.test(pathname)){const path=portalMapPath(params.get('visao'));params.delete('visao');return {redirect:path+(params.size?'?'+params:'')};}
 if(/^\/mapa-programatico\/?$/.test(pathname))return {page:true,view:'programas',path:'/'};
 if(/^\/mapa-de-atuacao\/?$/.test(pathname))return {redirect:portalMapPath('mapa-alfa')};
 const area=pathname.match(/^\/mapa-de-atuacao\/([^/]+)\/?$/)?.[1];
 const areas={'alfabetizacao':'mapa-alfa','fundamental-2':'mapa-fund2','liderancas':'mapa-lid'},view=Object.hasOwn(areas,area)?areas[area]:null;
 if(view)return {page:true,view,path:'/'};
 if(/^\/mapa\/(api|assets)(\/|$)/.test(pathname))return {page:false,path:pathname.slice('/mapa'.length)};
 return null;
}
export function portalStrategyHref(key,view){
 return '/mapa-programatico?'+new URLSearchParams({estrategia:key,origem:['mapa-alfa','mapa-fund2','mapa-lid'].includes(view)?view:'mapa-alfa'});
}
export function resolvePortalStrategyLink(search,catalog){
 const params=new URLSearchParams(search),key=params.get('estrategia')||'';
 if(!Object.hasOwn(catalog,key))return null;
 const origin=params.get('origem');
 return {key,tab:key.startsWith('Lideranças >')?'liderancas':'educacao',origin:['mapa-alfa','mapa-fund2','mapa-lid'].includes(origin)?origin:key.startsWith('Lideranças >')?'mapa-lid':key.startsWith('Fundamental 2 >')?'mapa-fund2':'mapa-alfa'};
}
