import test from 'node:test';
import assert from 'node:assert/strict';
import {mapExplorerEntries,filterMapExplorerEntries} from '../lib/portal-map-explorer.js';
const entries=mapExplorerEntries({
 hotspots:[{k:'cnca'},{k:'bncc'},{k:'cnca'},{k:'unknown'}],
 catalog:{cnca:{nome:'CNCA',etapa:'Política Nacional'},bncc:{nome:'BNCC',etapa:'Política Nacional',tipo:'Currículo'}},
 organizations:{cnca:['abc']},extra:{cnca:['abc','reuna']},external:{bncc:['Movimento pela Base']},
 orgs:{abc:{label:'Bem Comum',color:'#123456'},reuna:{label:'Reúna',color:'#ff5555'}},counts:{cnca:2}
});
test('as estratégias mantêm o vínculo, a contagem e as organizações, sem duplicar entradas',()=>{
 assert.equal(entries.length,2);
 assert.deepEqual(entries[0].organizations.map(org=>org.name),['Bem Comum','Reúna']);
 assert.equal(entries[0].key,'cnca');assert.equal(entries[0].count,2);
 assert.equal(entries[1].count,0);assert.equal(entries[1].organizations[0].name,'Movimento pela Base');
});
test('a busca combina palavras, aceita nomes sem acento e filtra estratégias com programas',()=>{
 assert.deepEqual(filterMapExplorerEntries(entries,'reuna').map(e=>e.key),['cnca']);
 assert.deepEqual(filterMapExplorerEntries(entries,'POLITICA comum').map(e=>e.key),['cnca']);
 assert.deepEqual(filterMapExplorerEntries(entries,'curriculo base').map(e=>e.key),['bncc']);
 assert.equal(filterMapExplorerEntries(entries,'bncc',true).length,0);
 assert.deepEqual(filterMapExplorerEntries(entries,'',true).map(e=>e.key),['cnca']);
 assert.equal(filterMapExplorerEntries(entries,'termo inexistente').length,0);
});
