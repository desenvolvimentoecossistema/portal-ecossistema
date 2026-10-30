import assert from 'node:assert/strict';
import test from 'node:test';
process.env.DATABASE_PATH=':memory:';
const {getSqliteDatabase,executeBatch}=await import('../db/sqlite.mjs');
const {MapStorage}=await import('../lib/map-storage.mjs');
test('banco real aplica migrações e desfaz gravação parcial',async()=>{const db=getSqliteDatabase();assert.equal(db.prepare('SELECT count(*) AS n FROM application_migrations').get().n,3);await assert.rejects(()=>executeBatch([{sql:'INSERT INTO app_user_roles VALUES (?,?,?,?,?)',params:['rollback@example.org','','user','now','now'],method:'run'},{sql:'INSERT INTO missing_table VALUES (?)',params:['x'],method:'run'}]));assert.equal(db.prepare('SELECT count(*) AS n FROM app_user_roles').get().n,0);});
test('publicação do mapa usa revisão atômica e preserva a versão em conflito',async()=>{const db=getSqliteDatabase(),a=new MapStorage(db),b=new MapStorage(db);const first=await a.put('test-map','{"version":1}',{onlyIf:new Headers({'if-none-match':'*'})});assert(first);assert.equal(await b.put('test-map','{"version":2}',{onlyIf:new Headers({'if-none-match':'*'})}),null);const race=await Promise.all([a.put('test-map','{"version":2}',{onlyIf:{etagMatches:first.etag}}),b.put('test-map','{"version":3}',{onlyIf:{etagMatches:first.etag}})]);assert.equal(race.filter(Boolean).length,1);assert.equal((await(await a.get('test-map')).json()).version,2);});
