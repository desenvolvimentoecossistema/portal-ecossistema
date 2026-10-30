import {readFileSync} from 'node:fs';
import {getSqliteDatabase} from '../db/sqlite.mjs';
import {IMPORT_COLUMNS,validateImport} from '../lib/portal-import.ts';
import {MapStorage} from '../lib/map-storage.mjs';
import map from '../lib/generated-map.js';
const [agendaFile,mapFile]=process.argv.slice(2);
if(!agendaFile)throw Error('Informe o arquivo local de migração da agenda.');
const data=validateImport(JSON.parse(readFileSync(agendaFile,'utf8'))),db=getSqliteDatabase();
if(db.prepare("SELECT id FROM portal_imports WHERE id='migration-v1'").get())throw Error('Esta migração já foi aplicada.');
if(db.prepare('SELECT count(*) AS count FROM events').get().count||db.prepare('SELECT count(*) AS count FROM registrations').get().count)throw Error('A importação inicial exige uma agenda vazia.');
// Validar o mapa pelo mesmo caminho da aplicação, sem gravar nada ainda.
let mapPayload;
if(mapFile){const value=JSON.parse(readFileSync(mapFile,'utf8'));mapPayload=value.snapshot?value.snapshot:value;const memory={get:async()=>null,put:async(_key,body)=>{JSON.parse(body);return {etag:'validation'};}};const r=await map.fetch(new Request('https://migration.local/api/data',{method:'PUT',headers:{origin:'https://migration.local','content-type':'application/json'},body:JSON.stringify({snapshot:mapPayload,revision:null})}),{BUCKET:memory,MAP_ORIGIN:'https://migration.local',MAP_ADMIN_EMAILS:'migration@example.org'},{userId:'migration',email:'migration@example.org',displayName:'Migration'});if(!r.ok)throw Error('O mapa de migração não é válido: '+r.status);}
db.exec('BEGIN IMMEDIATE');
try{
 for(const [table,columns] of Object.entries(IMPORT_COLUMNS)){const s=db.prepare(`INSERT INTO "${table}" (${columns.map(c=>'"'+c+'"').join(',')}) VALUES (${columns.map(()=>'?').join(',')})`);for(const row of data[table])s.run(...columns.map(c=>row[c]));}
 if(mapPayload){if(db.prepare('SELECT key FROM map_objects').get())throw Error('O mapa já tem dados publicados.');db.prepare('INSERT INTO map_objects VALUES (?,?,?)').run('mapa-ecossistema/current.json',JSON.stringify({snapshot:mapPayload,updatedAt:new Date().toISOString()}),crypto.randomUUID());}
 db.prepare('INSERT INTO portal_imports VALUES (?,?,?)').run('migration-v1',new Date().toISOString(),JSON.stringify(Object.fromEntries(Object.entries(data).map(([t,r])=>[t,r.length]))));db.exec('COMMIT');
}catch(error){db.exec('ROLLBACK');throw error;}
console.log('Dados importados com validação e transação. Sessões não foram importadas.');
