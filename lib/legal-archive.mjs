import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {getSqliteDatabase} from '../db/sqlite.mjs';

export function archiveLegalDocument(content,version,db=getSqliteDatabase(),capturedAt=new Date().toISOString()){
 const hash=createHash('sha256').update(content).digest('hex');
 JSON.parse(content);
 db.prepare('INSERT OR IGNORE INTO legal_document_archives(hash,version,content_json,captured_at) VALUES (?,?,?,?)').run(hash,version,content,capturedAt);
 const existing=db.prepare('SELECT content_json FROM legal_document_archives WHERE hash=?').get(hash);
 if(existing.content_json!==content)throw Error('Divergência na integridade do documento arquivado.');
 return hash;
}
export function seedLegalHistory(db=getSqliteDatabase()){
 const history=JSON.parse(readFileSync(resolve('lib/legal-document-history.json'),'utf8'));
 for(const item of history)archiveLegalDocument(item.content,item.version,db,item.capturedAt);
}
export function recordUserActivity(user,db=getSqliteDatabase(),now=new Date().toISOString()){
 db.prepare(`INSERT INTO portal_user_activity(user_id,email,display_name,last_seen_at) VALUES (?,?,?,?)
 ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name,last_seen_at=MAX(last_seen_at,excluded.last_seen_at)`)
 .run(user.userId,user.email.trim().toLowerCase(),user.displayName||'',now);
}
