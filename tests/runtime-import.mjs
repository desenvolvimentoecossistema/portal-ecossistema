import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
import {IMPORT_COLUMNS} from '../lib/portal-import.ts';
const dir=mkdtempSync(join(tmpdir(),'portal-runtime-import-')),file=join(dir,'agenda.json'),path=join(dir,'portal.sqlite');
const payload=Object.fromEntries(Object.keys(IMPORT_COLUMNS).map(table=>[table,[]]));
payload.events=[Object.fromEntries(IMPORT_COLUMNS.events.map(column=>[column,column==='max_participants'?3:column==='id'?'fixture-event':'fixture']))];
writeFileSync(file,JSON.stringify(payload));
const run=()=>spawnSync(process.execPath,['--experimental-strip-types','scripts/import-data.mjs',file],{cwd:resolve('.next/standalone'),env:{...process.env,DATABASE_PATH:path},encoding:'utf8'});
const first=run();assert.equal(first.status,0,first.stderr);
const db=new DatabaseSync(path);
try{
 assert.equal(db.prepare('SELECT count(*) n FROM events').get().n,1);
 assert.equal(db.prepare('SELECT max_participants FROM events').get().max_participants,3);
 assert.equal(db.prepare('SELECT count(*) n FROM oauth_sessions').get().n,0);
 assert.equal(db.prepare('SELECT count(*) n FROM application_migrations').get().n,readdirSync(resolve('database')).filter(file=>file.endsWith('.sql')).length);
 assert.notEqual(run().status,0,'a imagem não pode importar a mesma carga duas vezes');
 assert.equal(db.prepare('SELECT count(*) n FROM events').get().n,1);
}finally{db.close();}
console.log('OK importador standalone disponível, migrações aplicadas e carga duplicada recusada.');
