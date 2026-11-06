import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {classificationValues,classificationText} from '../lib/map-classification.js';

test('abrir um programa pela organização não mistura nomes parecidos e a busca continua disponível',async()=>{
 const source=await readFile(new URL('../modules/mapa/index.html',import.meta.url),'utf8');
 const context=vm.createContext({portalSelectedProgram:'Jornada 1',kwQuery:'Jornada 1',normTxt:t=>String(t).toLowerCase()});
 vm.runInContext(source.slice(source.indexOf('function kwMatch('),source.indexOf('function groupMatch(')),context);
 const matches=entry=>context.kwMatch(entry);
 assert.equal(matches({name:'Jornada 1',searchText:'jornada 1'}),true);
 assert.equal(matches({name:'Jornada 10',searchText:'jornada 10'}),false);
 context.portalSelectedProgram='';context.kwQuery='jornada';
 assert.equal(matches({name:'Jornada 10',searchText:'jornada 10'}),true);
});

test('campo vazio não se confunde com não aplicável nem com Geral declarado',()=>{
 assert.deepEqual(classificationValues([],'Sem nível especificado'),['Sem nível especificado']);
 assert.deepEqual(classificationValues(['  '],'Sem especialidade especificada'),['Sem especialidade especificada']);
 const values=['N/A','Não aplicável','Alfabetização','Geral'];
 assert.deepEqual(classificationValues(values,'Ausente'),['Não se aplica','Alfabetização','Geral']);
 assert.equal(values[0],'N/A');
 assert.equal(classificationText('N/A','Sem esfera especificada'),'Não se aplica');
 assert.equal(classificationText('','Sem esfera especificada'),'Sem esfera especificada');
});

test('sem estratégia continua selecionável quando a etapa está marcada como não aplicável',async()=>{
 const source=await readFile(new URL('../modules/mapa/index.html',import.meta.url),'utf8');
 const missing='Sem estratégia vinculada';
 const strategy={key:'estrategia',touched:false},stage={key:'etapa',touched:true,state:new Set(['Não se aplica']),values:e=>e.etapaTags},type={key:'tipo',touched:false,values:e=>e.tipoTags};
 const groups=[strategy,stage,type];
 const context=vm.createContext({SEM_MAPA:missing,STRAT_CATALOG:{},progEntries:[{estrKeys:[missing],etapaTags:['Não se aplica'],tipoTags:['Não se aplica']}],progFilterGroups:groups,progGroup:key=>groups.find(g=>g.key===key)});
 const count=source.slice(source.indexOf('function countByValue('),source.indexOf('const NIVEL_ORDER'));
 const match=source.slice(source.indexOf('function groupMatch('),source.indexOf('function autoFillUntouched('));
 const sync=source.slice(source.indexOf('function syncStrategyGroup('),source.indexOf('function badgeTextColor('));
 vm.runInContext(count+match+sync+';syncStrategyGroup();',context);
 assert.deepEqual([...strategy.optionValues],[missing]);
 stage.state=new Set(['Política Nacional']);vm.runInContext('syncStrategyGroup();',context);assert.equal(strategy.optionValues.length,0);
});
