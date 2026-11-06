import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import {pageAssets} from './page-assets.mjs';
import {portalNavigationHTML,bindPortalMenu,portalSectionHTML} from '../lib/portal-navigation.js';
import {bindPortalMapLayout} from '../lib/portal-map-layout.js';
import {resolvePortalMapLink} from '../lib/portal-map-links.js';
import {portalFontFaceCSS,portalFontPreloadsHTML} from '../lib/portal-fonts.js';
import {portalLegalFooterHTML} from '../lib/portal-legal.js';
import {resolvePortalMapView,syncPortalMapNavigation,setPortalMapLoadState,setPortalMapUpdatedAt} from '../lib/portal-map-views.js';
import {formatRecordedDate} from '../lib/publication-dates.js';
import {portalMapPath,portalStrategyHref,resolvePortalStrategyLink} from '../lib/portal-map-paths.js';
import {mapExplorerEntries,filterMapExplorerEntries,renderPortalMapExplorer} from '../lib/portal-map-explorer.js';
import {classificationValues,classificationText} from '../lib/map-classification.js';
let page=(await readFile('modules/mapa/index.html','utf8')).replace(/\r\n/g,'\n');
page=page.replace('function tagEsfera(',classificationValues.toString()+'\n'+classificationText.toString()+'\nfunction tagEsfera(');
page=page.replace('function tagEsfera(',formatRecordedDate.toString()+'\n'+setPortalMapUpdatedAt.toString()+'\nfunction tagEsfera(');
page=page.replace(/<title>[^<]*<\/title>/,'<title>Mapas Programáticos e de Atuação | Portal do Ecossistema</title>');
page=page.replace('Conferir alterações:','Alterações:');
page=page.replace('function setView(v) {',"function setView(v) {\n  if(sharedReady&&portalMapPath(v)!==location.pathname.replace(/\\/$/,'')){location.assign(portalMapPath(v));return;}");
page=page.replace(/<h2>Mapa de Atuação \| (Alfabetização|Fund 2|Lideranças)<\/h2>/g,(_,name)=>'<h2>'+(name==='Fund 2'?'Fundamental 2':name)+'</h2>');
page=page.replaceAll('<div class="map-bar">','<p class="map-load-state" role="status">Carregando o mapa…</p><div class="map-bar">');
page=page.replace("function filterByEstrategia(key, view) {","function filterByEstrategia(key, view) {\n  if(location.pathname.startsWith('/mapa-de-atuacao')){location.assign(portalStrategyHref(key,view));return;}");
page=page.replace("function hideMapReturn() { document.getElementById('map-return').classList.remove('show'); }","function hideMapReturn() { document.getElementById('map-return').classList.remove('show');const url=new URL(location.href);url.searchParams.delete('estrategia');url.searchParams.delete('origem');history.replaceState(null,'',url.pathname+url.search); }");
page=page.replace("hideMapReturn(); setView(lastMapView || 'mapa-alfa');","hideMapReturn(); location.assign(portalMapPath(lastMapView || 'mapa-alfa'));");
page=page.replace("    dataLoadError='Não foi possível carregar os dados publicados.';","    dataLoadError='Não foi possível carregar os dados publicados.';setPortalMapLoadState('error');");
page=page.replace(/<div class="view-switch"[^>]*>[\s\S]*?<\/div>/,'')
 .replace(/function syncViewSwitch\(\) \{[\s\S]*?\n\}/,'')
 .replace('  syncViewSwitch();','')
 .replace(/^\s*document.querySelectorAll\('#view-switch button'\)[^\n]*\n/gm,'')
 .replace("'#view-switch button, .tab-btn'","'.tab-btn'");
if(page.includes('id="view-switch"')||page.includes('syncViewSwitch('))throw Error('O seletor interno não foi removido por completo.');
page=page.replace(/function renderMapList\(view,mk,counts\) \{[\s\S]*?\n\}/,
 mapExplorerEntries.toString()+'\n'+filterMapExplorerEntries.toString()+'\n'+renderPortalMapExplorer.toString())
 .replace('renderMapList(cv.closest(\'.l2-view-mapa\'),mk,counts);',"renderPortalMapExplorer(cv.closest('.l2-view-mapa'),mk,counts);");
page=page.replace("  if (v !== 'programas' && (!Object.hasOwn(VIEW_TAB, v) || VIEW_TAB[v] !== activeTab)) v = 'programas';",
 "  if(v!=='programas'&&!Object.hasOwn(VIEW_TAB,v))v='programas';\n  if(VIEW_TAB[v]&&VIEW_TAB[v]!==activeTab){activeTab=VIEW_TAB[v];clearKw();reloadProgramsData();}");
page=page.replace("  activeView = v;","  activeView = v;\n  syncPortalMapNavigation(v,document,sharedReady||!IS_HOSTED);");
page=page.replaceAll('Clique numa estratégia com número para ver, em Programas, os programas ligados a ela.','Clique numa estratégia enumerada para ver os programas que correspondem a ela.');
// Capture the requested view before the initial render updates the address.
page=page.replace("let activeView = 'programas';",`${portalMapPath.toString()}\n${portalStrategyHref.toString()}\n${resolvePortalStrategyLink.toString()}\nconst portalRequestedSearch=location.search;\nconst portalRequestedView=(${resolvePortalMapView.toString()})(portalRequestedSearch,location.pathname);\n${syncPortalMapNavigation.toString()}\n${setPortalMapLoadState.toString()}\nlet activeView = 'programas';`);
page=page.replace('"label": "Centro Lemann de Sobral"','"label": "Centro Lemann"');
page=page.replace("Object.keys(ORGS).forEach(k => { ORG_LABEL_TO_KEY[ORGS[k].label] = k; });","Object.keys(ORGS).forEach(k => { ORG_LABEL_TO_KEY[ORGS[k].label] = k; });\nORG_LABEL_TO_KEY['Centro Lemann de Sobral']='cls';");
page=page.replace("const orgByName = Object.fromEntries(Object.entries(ORGS).map(([k,v]) => [normTxt(v.label),k]));","const orgByName = Object.fromEntries(Object.entries(ORGS).map(([k,v]) => [normTxt(v.label),k]));\n  orgByName[normTxt('Centro Lemann de Sobral')]='cls';");
page=page.replace(/@font-face\s*\{[^}]*\}/g,'');
page=page.replace('</head>',`${portalFontPreloadsHTML}<style>${portalFontFaceCSS}</style></head>`);
page=page.replace('<span class="data-toolbar-label" id="data-management-label" hidden>Dados do mapa:</span>','').replace("document.getElementById('data-management-label').hidden = IS_HOSTED && !adminUnlocked;",'');
page=page.replace(/<div class="title-block">[\s\S]*?<\/div>/,'');
page=page.replace(/    <button[^>]*id="data-export-btn"[^>]*>[\s\S]*?<\/button>\n/,'')
 .replace(/^\s*document\.getElementById\('data-export-btn'\)\.hidden[^\n]*\n/m,'')
 .replace(/document\.getElementById\('data-export-btn'\)\.addEventListener\('click',\(\)=>\{[\s\S]*?\n\}\);/,'');
if(page.includes('data-export-btn'))throw Error('A retirada do botão de cópia da prévia ficou incompleta.');
page=page.replace(/    const warning=parsed\.invalidPub\.length\?[^\n]+\n/,'')
 .replace("showDataStatus('Prévia de '+count+' programas de “'+sheetsPreviewSource.title+'”. Confira o mapa e clique em Publicar atualização para disponibilizar esta versão.'+warning,false);","showDataStatus('Prévia de '+count+' programas obtidos da planilha. Confira o mapa e clique em Publicar atualização para disponibilizar esta versão.',false);");
const keywordSearch=page.match(/<div class="kw-search">[\s\S]*?<\/div>/)?.[0];
if(!keywordSearch)throw Error('A busca por palavra-chave não foi localizada.');
page=page.replace(keywordSearch,'').replace('<div class="filters-heading">',keywordSearch+'\n<div class="filters-heading">');
page=page.replace("key: 'publico', label: 'Público Atendido'","key: 'publico', label: 'Público atendido'");
const application=[...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
const ctx=vm.createContext({});vm.runInContext(application.slice(0,application.indexOf('let activeTab'))+';globalThis.model={ORGS,STRAT_CATALOG};',ctx);
const validator=application.slice(application.indexOf('function validateSnapshot('),application.indexOf('function applySnapshot('));
page=page.replace(/<img class="top-header-logo"[^>]*>/,'').replace('<div class="top-header-divider"></div>','').replace(/<a\b[^>]*id="session-logout"[\s\S]*?<\/a>/,'<a id="session-logout" hidden></a>');
page=page.replace('<body>','<body class="hub portal-map-shell" data-portal-map-view="__PORTAL_PAGE_VIEW__" data-map-loading="true">').replace(/<div class="top-header-title">[\s\S]*?<\/div>/,'');
const tabs=page.match(/<div class="l2-tabs"[^>]*>[\s\S]*?<\/div>/)?.[0];
const headerStart=page.indexOf('<div class="top-header">'),headerEnd=page.indexOf('<div class="data-toolbar">');
if(!tabs||headerStart<0||headerEnd<headerStart)throw Error('As abas do mapa não foram localizadas.');
page=page.slice(0,headerStart)+page.slice(headerEnd);
page=page.replace('<div class="top-accent"></div>',portalNavigationHTML('mapa','__PORTAL_SIGN_OUT__')+portalSectionHTML('Mapas Programáticos e de Atuação','Consulte os programas das organizações do Ecossistema.').replace('__PORTAL_MAP_TABS__',tabs));
const deepLinkCode=`\n${resolvePortalMapLink.toString()}\nlet portalSelectionApplied=false;\nfunction applyPortalSelection(){if(portalSelectionApplied)return;portalSelectionApplied=true;const selection=resolvePortalMapLink(location.search,DIMENSIONS);if(!selection.org&&!selection.query)return;if(selection.org&&selection.tab!==activeTab){activeTab=selection.tab;reloadProgramsData();}if(selection.org){const group=progGroup('org');group.state=new Set([ORGS[selection.org].label]);group.touched=true;autoFillUntouched(progFilterGroups,progEntries);syncStrategyGroup();buildFilterUI(document.getElementById('programs-filters'),progFilterGroups,progEntries,renderProgramsGrid);}portalSelectedProgram=selection.program||'';kwQuery=selection.query;document.getElementById('kw-input').value=kwQuery;renderProgramsGrid();}\n`;
const strategySelection="const strategy=resolvePortalStrategyLink(portalRequestedSearch,STRAT_CATALOG);if(strategy){if(activeTab!==strategy.tab){activeTab=strategy.tab;reloadProgramsData();}const url=new URL(location.href);url.searchParams.set('estrategia',strategy.key);url.searchParams.set('origem',strategy.origin);history.replaceState(null,'',url.pathname+url.search);filterByEstrategia(strategy.key,strategy.origin);return;}";
page=page.replace('async function loadSharedData() {',deepLinkCode.replace('resolvePortalMapLink(location.search,DIMENSIONS)','resolvePortalMapLink(portalRequestedSearch,DIMENSIONS)').replace('const selection=resolvePortalMapLink',strategySelection+'const selection=resolvePortalMapLink')+'async function loadSharedData() {');
const loaded='    reloadProgramsData(); refreshAdminUI();\n    showDataStatus(\'\',false);';
if(!page.includes(loaded))throw Error('O carregamento compartilhado do mapa não foi localizado.');
page=page.replace(loaded,"    reloadProgramsData(); refreshAdminUI(); applyPortalSelection(); setView(portalRequestedView);setPortalMapLoadState('ready');setPortalMapUpdatedAt(data.updatedAt);\n    showDataStatus('',false);");
page=page.replace('applySnapshot(saved); sharedSnapshot=saved; sharedRevision=data.revision; usingLocalData=false; localDataWhen=null;','applySnapshot(saved); sharedSnapshot=saved; sharedRevision=data.revision; usingLocalData=false; localDataWhen=null;setPortalMapUpdatedAt(data.updatedAt);');
page=page.replace('<span class="org-badge" style="background:${ORGS[o].color};color:${badgeTextColor(ORGS[o].color)}">${ORGS[o].label}</span>','<a class="org-badge" href="/organizacoes/${o}" style="--org-color:${ORGS[o].color};--org-text:${badgeTextColor(ORGS[o].color)}">${ORGS[o].label}</a>');
page=page.replace('<div class="data-toolbar">','<div class="data-toolbar"><button type="button" id="desktop-filter-toggle" class="desktop-filter-toggle" aria-expanded="true" aria-controls="programs-sidebar"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M7 12h10M10 18h4"/></svg><span>Ocultar filtros</span></button>');
page=page.replace('<aside class="sidebar">','<aside class="sidebar" id="programs-sidebar">');
const mapUpdated='<span class="map-updated" data-map-updated>Última atualização: carregando…</span>';
page=page.replace('<div class="data-toolbar-actions">','<div class="data-toolbar-actions">'+mapUpdated).replaceAll('<div class="map-actions">','<div class="map-actions">'+mapUpdated);
const mapFooter=portalLegalFooterHTML();
page=page.replace('<div class="programs-grid" id="programs-grid"></div>','<div class="programs-grid" id="programs-grid"></div>'+mapFooter);
page=page.replace(/(<div class="l2-view l2-view-mapa"[^>]*>[\s\S]*?)(\n<\/div>)/g,'$1'+mapFooter+'$2');
page=page.replace('</body>',`<script src="/portal-legal.js" defer></script><script>(${bindPortalMenu.toString()})();(${bindPortalMapLayout.toString()})();</script></body>`);
const css=(await readFile('public/portal.css','utf8'))+'\n'+(await readFile('public/hub.css','utf8'))+'\n'+(await readFile('public/map-portal.css','utf8'))+'\n'+(await readFile('public/portal-legal.css','utf8'))+'\n'+(await readFile('public/portal-map-menu.css','utf8'))+'\n'+(await readFile('public/portal-map-explorer.css','utf8'));
page=page.replace('</head>',`<style>${css}\n.top-header{padding:10px 24px}.top-header-right{display:block}.top-header-title h1{font-size:17px}.top-header-title p{display:none}.session-logout{display:none!important}@media(max-width:760px){.top-header{padding:6px 12px}.top-header-title{display:none}}</style></head>`);
page=page.replace(/(["'])\/api\//g,'$1/mapa/api/');
page=page.replace('</head>',`<style>${await readFile('public/portal-independent-maps.css','utf8')}</style></head>`);
const resources=pageAssets(page);resources.page=resources.page.replaceAll('/assets/','/mapa/assets/');
let handler=(await readFile('modules/mapa/handler.js','utf8')).replace(/\r\n/g,'\n');
handler=handler.replace('async fetch(request,env){','async fetch(request,env,authenticatedUser){').replace(/    let authentication;[\s\S]*?    if\(authentication\)return authentication;\n/,'').replace(/    let user;\n    try\{user=await sessionUser\(request,env\);\}catch\{return json\([\s\S]*?\);\}\n/,'    const user=authenticatedUser;\n').replace('page=PAGE.replace(/<script\\b/g,','page=PAGE.replaceAll("__PORTAL_SIGN_OUT__",env.PORTAL_SIGN_OUT).replace(/<script\\b/g,');
if(handler.includes('authRoute(')||handler.includes('sessionUser(')||handler.includes('mapSSO('))throw Error('A autenticação do mapa não foi centralizada.');
handler=handler.replace('.replaceAll("__PORTAL_SIGN_OUT__",env.PORTAL_SIGN_OUT)','.replaceAll("__PORTAL_SIGN_OUT__",env.PORTAL_SIGN_OUT).replaceAll("__PORTAL_PAGE_VIEW__",env.PORTAL_PAGE_VIEW||"programas")');
const snapshot=JSON.parse(await readFile('modules/mapa/initial-snapshot.json','utf8'));
const sheets=await readFile('modules/mapa/google-sheets.js','utf8');
await writeFile('lib/generated-map.js',[
 '// Generated by scripts/prepare-map.mjs. Authentication belongs to the portal.',
 'const PAGE='+JSON.stringify(resources.page)+';',
 'const STATIC_ASSETS='+JSON.stringify(resources.assets)+';',
 'const ORGS='+JSON.stringify(ctx.model.ORGS)+';',
 'const STRAT_CATALOG='+JSON.stringify(ctx.model.STRAT_CATALOG)+';',
 "const segList=d=>String(d.segmento_categoria||'').split(';').map(x=>x.trim()).filter(Boolean);",
 'const INITIAL_SNAPSHOT='+JSON.stringify(snapshot)+';',
 'const MAP_EXT=INITIAL_SNAPSHOT.ext, EXT_COLORS=INITIAL_SNAPSHOT.colors, MAP_ORGS_EXTRA=INITIAL_SNAPSHOT.extra;',
 'const random=()=>crypto.randomUUID().replaceAll("-","");',
 'const redirect=path=>new Response(null,{status:302,headers:{location:path}});',
 validator,sheets,handler
].join('\n'));
console.log('Mapa integrado: acesso centralizado, recursos e API sob /mapa.');
