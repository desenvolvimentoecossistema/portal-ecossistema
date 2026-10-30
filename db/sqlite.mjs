import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
let connection;
export function getSqliteDatabase(){
 if(!connection){const path=process.env.DATABASE_PATH||'./data/portal.sqlite';if(path!==':memory:')mkdirSync(dirname(resolve(path)),{recursive:true,mode:0o700});connection=new DatabaseSync(path);connection.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=10000;');migrate(connection);}
 return connection;
}
function migrate(db){db.exec('CREATE TABLE IF NOT EXISTS application_migrations(id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');const dir=resolve('database');for(const file of readdirSync(dir).filter(f=>f.endsWith('.sql')).sort()){if(db.prepare('SELECT id FROM application_migrations WHERE id=?').get(file))continue;db.exec('BEGIN IMMEDIATE');try{db.exec(readFileSync(resolve(dir,file),'utf8'));db.prepare('INSERT INTO application_migrations VALUES (?,?)').run(file,new Date().toISOString());db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}}}
function query(sql,params,method){const s=getSqliteDatabase().prepare(sql);if(method==='run'){const r=s.run(...params);return {rows:[],meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}};}s.setReturnArrays(true);return {rows:method==='get'?s.get(...params):s.all(...params)};}
export async function executeQuery(sql,params,method){return query(sql,params,method);}
export async function executeBatch(statements){const db=getSqliteDatabase();db.exec('BEGIN IMMEDIATE');try{const r=statements.map(s=>query(s.sql,s.params,s.method));db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}
