import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import {pageAssets} from './page-assets.mjs';
import {portalNavigationHTML,bindPortalMenu,portalSectionHTML} from '../lib/portal-navigation.js';
import {bindPortalMapLayout} from '../lib/portal-map-layout.js';
import {resolvePortalMapLink} from '../lib/portal-map-links.js';
import {portalFontFaceCSS,portalFontPreloadsHTML} from '../lib/portal-fonts.js';
let page=(await readFile('modules/mapa/index.html','utf8')).replace(/\r\n/g,'\n');
page=page.replace(/<title>[^<]*<\/title>/,'<title>Mapas Programáticos e de Atuação | Portal do Ecossistema</title>');
page=page.replace('Conferir alterações:','Alterações:');
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
page=page.replace('<body>','<body class="hub portal-map-shell">').replace(/<div class="top-header-title">[\s\S]*?<\/div>/,'');
const tabs=page.match(/<div class="l2-tabs"[^>]*>[\s\S]*?<\/div>/)?.[0];
const headerStart=page.indexOf('<div class="top-header">'),headerEnd=page.indexOf('<div class="data-toolbar">');
if(!tabs||headerStart<0||headerEnd<headerStart)throw Error('As abas do mapa não foram localizadas.');
page=page.slice(0,headerStart)+page.slice(headerEnd);
page=page.replace('<div class="top-accent"></div>',portalNavigationHTML('mapa','__PORTAL_SIGN_OUT__')+portalSectionHTML('Mapas Programáticos e de Atuação','Consulte os programas e entenda a atuação das organizações do Ecossistema.').replace('__PORTAL_MAP_TABS__',tabs));
const deepLinkCode=`\n${resolvePortalMapLink.toString()}\nlet portalSelectionApplied=false;\nfunction applyPortalSelection(){if(portalSelectionApplied)return;portalSelectionApplied=true;const selection=resolvePortalMapLink(location.search,DIMENSIONS);if(!selection.org&&!selection.query)return;if(selection.org&&selection.tab!==activeTab){activeTab=selection.tab;reloadProgramsData();}if(selection.org){const group=progGroup('org');group.state=new Set([ORGS[selection.org].label]);group.touched=true;autoFillUntouched(progFilterGroups,progEntries);syncStrategyGroup();buildFilterUI(document.getElementById('programs-filters'),progFilterGroups,progEntries,renderProgramsGrid);}kwQuery=selection.query;document.getElementById('kw-input').value=kwQuery;renderProgramsGrid();}\n`;
page=page.replace('async function loadSharedData() {',deepLinkCode+'async function loadSharedData() {');
const loaded='    reloadProgramsData(); refreshAdminUI();\n    showDataStatus(\'\',false);';
if(!page.includes(loaded))throw Error('O carregamento compartilhado do mapa não foi localizado.');
page=page.replace(loaded,'    reloadProgramsData(); refreshAdminUI(); applyPortalSelection();\n    showDataStatus(\'\',false);');
page=page.replace('<span class="org-badge" style="background:${ORGS[o].color};color:${badgeTextColor(ORGS[o].color)}">${ORGS[o].label}</span>','<a class="org-badge" href="/organizacoes/${o}" style="--org-color:${ORGS[o].color};--org-text:${badgeTextColor(ORGS[o].color)}">${ORGS[o].label}</a>');
page=page.replace('<div class="data-toolbar">','<div class="data-toolbar"><button type="button" id="desktop-filter-toggle" class="desktop-filter-toggle" aria-expanded="true" aria-controls="programs-sidebar"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M7 12h10M10 18h4"/></svg><span>Ocultar filtros</span></button>');
page=page.replace('<aside class="sidebar">','<aside class="sidebar" id="programs-sidebar">');
page=page.replace('</body>',`<script>(${bindPortalMenu.toString()})();(${bindPortalMapLayout.toString()})();</script></body>`);
const css=(await readFile('public/portal.css','utf8'))+'\n'+(await readFile('public/hub.css','utf8'))+'\n'+(await readFile('public/map-portal.css','utf8'));
page=page.replace('</head>',`<style>${css}\n.top-header{padding:10px 24px}.top-header-right{display:block}.top-header-title h1{font-size:17px}.top-header-title p{display:none}.session-logout{display:none!important}@media(max-width:760px){.top-header{padding:6px 12px}.top-header-title{display:none}}</style></head>`);
page=page.replace(/(["'])\/api\//g,'$1/mapa/api/');
const resources=pageAssets(page);resources.page=resources.page.replaceAll('/assets/','/mapa/assets/');
let handler=(await readFile('modules/mapa/handler.js','utf8')).replace(/\r\n/g,'\n');
handler=handler.replace('async fetch(request,env){','async fetch(request,env,authenticatedUser){').replace(/    let authentication;[\s\S]*?    if\(authentication\)return authentication;\n/,'').replace(/    let user;\n    try\{user=await sessionUser\(request,env\);\}catch\{return json\([\s\S]*?\);\}\n/,'    const user=authenticatedUser;\n').replace('page=PAGE.replace(/<script\\b/g,','page=PAGE.replaceAll("__PORTAL_SIGN_OUT__",env.PORTAL_SIGN_OUT).replace(/<script\\b/g,');
if(handler.includes('authRoute(')||handler.includes('sessionUser(')||handler.includes('mapSSO('))throw Error('A autenticação do mapa não foi centralizada.');
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
