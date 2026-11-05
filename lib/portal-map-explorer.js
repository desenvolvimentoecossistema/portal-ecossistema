export function mapExplorerEntries({hotspots,catalog,organizations,extra,external,orgs,counts}){
 const seen=new Set();
 return hotspots.filter(item=>catalog[item.k]&&!seen.has(item.k)&&seen.add(item.k)).map(({k})=>{
  const strategy=catalog[k];
  const core=[...new Set([...(organizations[k]||[]),...(extra[k]||[])])].filter(key=>Object.hasOwn(orgs,key)).map(key=>({name:orgs[key].label,color:orgs[key].color}));
  const tags=[...core,...(external[k]||[]).filter(name=>!core.some(org=>org.name===name)).map(name=>({name,color:null}))];
  return {key:k,name:strategy.nome,stage:strategy.etapa,type:strategy.tipo||'',count:counts[k]||0,organizations:tags};
 });
}
export function filterMapExplorerEntries(entries,query,withProgramsOnly=false){
 const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
 const words=normalize(query).trim().split(/\s+/).filter(Boolean);
 return entries.filter(entry=>(!withProgramsOnly||entry.count>0)&&words.every(word=>normalize([entry.name,entry.stage,entry.type,...entry.organizations.map(org=>org.name)].join(' ')).includes(word)));
}
export function renderPortalMapExplorer(view,mk,counts){
 let panel=view.querySelector('.map-strategy-explorer');
 const make=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
 if(!panel){
  panel=make('section','map-strategy-explorer');panel.id='map-explorer-'+mk;
  panel.setAttribute('aria-labelledby',panel.id+'-title');
  const heading=make('h2','','Explore as estratégias');heading.id=panel.id+'-title';
  panel.append(heading);
  const controls=make('div','map-explorer-controls'),searchLabel=make('label','map-explorer-search');
  const search=make('input');search.type='search';search.placeholder='Digite uma estratégia ou organização';search.maxLength=180;
  search.setAttribute('aria-label','Buscar estratégia ou organização');
  searchLabel.append(search);
  controls.append(searchLabel);panel.append(controls);
  const results=make('div','map-explorer-results');panel.append(results);
  const update=()=>{
   const entries=filterMapExplorerEntries(panel.explorerEntries||[],search.value);
   results.replaceChildren();
   if(!entries.length){results.append(make('p','map-explorer-empty','Nenhuma estratégia encontrada. Tente outro termo.'));return;}
   const groups=new Map();
   entries.forEach(entry=>{const key=entry.stage+(entry.type?' · '+entry.type:'');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(entry);});
   groups.forEach((groupEntries,label)=>{
    const group=make('section','map-explorer-group'),groupList=make('div','map-explorer-group-list');
    group.append(make('h3','',label),groupList);results.append(group);
   groupEntries.forEach(entry=>{
    const article=make('article','map-explorer-card');
    article.append(make('p','map-explorer-stage',entry.stage+(entry.type?' · '+entry.type:'')),make('h3','',entry.name));
    const tags=make('div','map-explorer-organizations');
    entry.organizations.forEach(org=>{const tag=make('span','map-explorer-org',org.name);if(org.color){tag.style.background=org.color;tag.style.color=badgeTextColor(org.color);}tags.append(tag);});
    if(!entry.organizations.length)tags.append(make('span','map-explorer-no-org','Nenhuma organização mapeada.'));
    article.append(tags);
    if(entry.count){
     const action=make('button','map-explorer-open','Ver programas');
     action.type='button';action.setAttribute('aria-label','Ver programas de '+entry.name);
     action.addEventListener('click',()=>filterByEstrategia(entry.key,'mapa-'+mk));article.append(action);
    }else article.append(make('p','map-explorer-no-programs','Nenhum programa vinculado nesta base.'));
    groupList.append(article);
   });
   });
  };
  search.addEventListener('input',update);panel.refreshExplorer=update;
  view.insertBefore(panel,view.querySelector(':scope>.portal-legal-footer'));
 }
 panel.explorerEntries=mapExplorerEntries({hotspots:MAP_HOTSPOTS[mk]||[],catalog:STRAT_CATALOG,organizations:orgsPerEstrategia(),extra:MAP_ORGS_EXTRA,external:MAP_EXT,orgs:ORGS,counts});
 panel.refreshExplorer();
}
