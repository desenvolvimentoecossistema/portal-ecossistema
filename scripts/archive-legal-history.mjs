import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const history=new Map();
const revisions=execFileSync('git',['log','--reverse','--format=%H','--','lib/legal-documents.json'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
for(const revision of revisions){
 const documents=JSON.parse(execFileSync('git',['show',revision+':lib/legal-documents.json'],{encoding:'utf8'}));
 const versionFile=execFileSync('git',['show',revision+':lib/portal-legal.js'],{encoding:'utf8'});
 const version=versionFile.match(/legalDocumentVersion\s*=\s*['"]([^'"]+)['"]/)?.[1];
 if(!version)throw Error('Versão não identificada no histórico '+revision);
 const capturedAt=new Date(execFileSync('git',['show','-s','--format=%cI',revision],{encoding:'utf8'}).trim()).toISOString();
 for(const content of [JSON.stringify(documents),JSON.stringify(documents[0])]){
  const hash=createHash('sha256').update(content).digest('hex');
  if(!history.has(hash))history.set(hash,{version,capturedAt,content});
 }
}
writeFileSync('lib/legal-document-history.json',JSON.stringify([...history.values()],null,2)+'\n');
console.log('Versões históricas arquivadas:',history.size);
