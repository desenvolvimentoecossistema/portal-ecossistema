import {randomUUID} from 'node:crypto';
import {getSqliteDatabase} from '../db/sqlite.mjs';
export class MapStorage{
 constructor(db){this.db=db||getSqliteDatabase();}
 async get(key){const r=this.db.prepare('SELECT body,etag FROM map_objects WHERE key=?').get(key);return r?{etag:r.etag,json:async()=>JSON.parse(r.body)}:null;}
 async put(key,body,options={}){const db=this.db;db.exec('BEGIN IMMEDIATE');try{const r=db.prepare('SELECT etag FROM map_objects WHERE key=?').get(key),c=options.onlyIf,absent=c instanceof Headers&&c.get('if-none-match')==='*';if(absent&&r||c?.etagMatches!==undefined&&r?.etag!==c.etagMatches){db.exec('ROLLBACK');return null;}const etag=randomUUID();db.prepare('INSERT INTO map_objects VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET body=excluded.body,etag=excluded.etag').run(key,String(body),etag);db.exec('COMMIT');return {etag};}catch(e){db.exec('ROLLBACK');throw e;}}
}
export function mapStorage(){return new MapStorage();}
