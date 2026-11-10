import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,mkdtempSync,writeFileSync,utimesSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runPrivacyRetention,yearsBefore} from '../lib/privacy-retention.mjs';
import {archiveLegalDocument,recordUserActivity,seedLegalHistory} from '../lib/legal-archive.mjs';
import {evidenceForRecord,evidenceHtml} from '../lib/legal-evidence.mjs';
import {legalAcceptanceRecord,registrationAcceptanceStatement} from '../lib/legal-acceptance.js';
import {pruneApplicationBackups} from '../lib/backup-retention.mjs';
const now='2026-11-10T15:00:00.000Z';
function fixture(){const db=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('../database/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync(new URL('../database/'+f,import.meta.url),'utf8'));return db;}
function event(db,id,end,owner='owner'){
 const columns=db.prepare('PRAGMA table_info(events)').all();const row=Object.fromEntries(columns.map(c=>[c.name,c.name==='max_participants'?5:'']));Object.assign(row,{id,title:id,end_date:end,start_date:end,created_by_user_id:owner,created_at:'2020-01-01T00:00:00.000Z',updated_at:'2020-01-01T00:00:00.000Z'});
 db.prepare('INSERT INTO events('+columns.map(c=>c.name).join(',')+') VALUES ('+columns.map(()=>'?').join(',')+')').run(...columns.map(c=>row[c.name]));
 db.prepare('INSERT INTO registrations(id,event_id,name,email,organization,role,created_at) VALUES (?,?,?,?,?,?,?)').run('r-'+id,id,'Pessoa','person-'+id+'@example.org','Org','Cargo','2020-01-01');
}
test('conservação elimina apenas agendas vencidas e preserva datas futuras, o dia-limite e reservas legais',()=>{
 const db=fixture();try{event(db,'old','2024-11-09');event(db,'limit','2024-11-10');event(db,'future','2030-01-01');event(db,'invalid','2024-02-30');event(db,'no-date','');event(db,'held','2020-01-01');
 db.prepare('INSERT INTO privacy_retention_holds VALUES (?,?,?,?,?,?)').run('hold','event','held','Obrigação legal documentada','2027-01-01',now);
 const result=runPrivacyRetention({database:db,now});assert.equal(result.events,2);assert.equal(result.registrations,2);
 assert.deepEqual(db.prepare('SELECT id FROM events ORDER BY id').all().map(r=>r.id),['future','held','invalid','limit']);
 assert.equal(runPrivacyRetention({database:db,now}).skipped,true);
 assert.equal(yearsBefore('2024-02-29T12:00:00Z'),'2022-02-28T12:00:00.000Z');assert.throws(()=>yearsBefore('not-a-date'));
 }finally{db.close();}
});
test('limpeza de usuário inativo preserva usuários ativos e sessões vigentes e remove provas pessoais vencidas',()=>{
 const db=fixture();try{
 for(const id of ['old','active','held','session'])recordUserActivity({userId:id,email:id+'@example.org',displayName:id},db,'2024-01-01T00:00:00.000Z');
 recordUserActivity({userId:'active',email:'active@example.org',displayName:'Ativa'},db,now);
 db.prepare('INSERT INTO oauth_sessions VALUES (?,?,?,?,?)').run('live','session','session@example.org','Pessoa',Math.floor(Date.parse(now)/1000)+3600);
 db.prepare('INSERT INTO oauth_sessions VALUES (?,?,?,?,?)').run('expired','old','old@example.org','Antiga',1);
 db.prepare('INSERT INTO app_user_roles VALUES (?,?,?,?,?)').run('old@example.org','Antiga','admin','2020-01-01','2020-01-01');
 db.prepare('INSERT INTO privacy_retention_holds VALUES (?,?,?,?,?,?)').run('hold','user','held','Exercício regular de direitos','2027-01-01',now);
 db.prepare('INSERT INTO legal_acceptances(id,user_id,terms_version,terms_hash,accepted_at,action,resource_id) VALUES (?,?,?,?,?,?,?)').run('old-acceptance','old','v','h','2024-01-01','portal-access','portal');
 const result=runPrivacyRetention({database:db,now});assert.equal(result.users,1);assert.equal(result.acceptances,1);assert.equal(result.sessions,1);
 assert.deepEqual(db.prepare('SELECT user_id FROM portal_user_activity ORDER BY user_id').all().map(r=>r.user_id),['active','held','session']);assert.equal(db.prepare('SELECT count(*) n FROM app_user_roles').get().n,0);
 }finally{db.close();}
});
test('reserva legal do participante ou do responsável pelo aceite impede exclusão da agenda correspondente',()=>{
 const db=fixture();try{event(db,'protected','2020-01-01');recordUserActivity({userId:'participant',email:'person-protected@example.org',displayName:'Pessoa'},db,now);db.prepare('INSERT INTO privacy_retention_holds VALUES (?,?,?,?,?,?)').run('h','user','participant','Processo legal','2027-01-01',now);
 assert.equal(runPrivacyRetention({database:db,now}).events,0);
 }finally{db.close();}
});
test('evidência de agenda cancelada usa a data mais recente e a limpeza é atômica',()=>{
 const db=fixture();try{
 db.prepare('INSERT INTO legal_acceptances(id,user_id,terms_version,terms_hash,accepted_at,action,resource_id,resource_end_date) VALUES (?,?,?,?,?,?,?,?)').run('a','u','v','h','2024-01-01T00:00:00Z','agenda-create','canceled','2030-01-01');
 runPrivacyRetention({database:db,now});assert.equal(db.prepare('SELECT count(*) n FROM legal_acceptances').get().n,1);
 event(db,'rollback','2020-01-01');db.exec("CREATE TRIGGER prevent_fixture_delete BEFORE DELETE ON events BEGIN SELECT RAISE(ABORT,'fixture'); END;");
 assert.throws(()=>runPrivacyRetention({database:db,now,force:true}));assert.equal(db.prepare("SELECT count(*) n FROM registrations WHERE event_id='rollback'").get().n,1);
 }finally{db.close();}
});
test('comprovante conserva cópia exata, valida integridade e não permite alterar o arquivo',async()=>{
 const db=fixture();try{const content=JSON.stringify([{title:'Termos',blocks:[{kind:'NORMAL_TEXT',runs:[{text:'Texto original <script>unsafe</script>'}]}]}]);const hash=archiveLegalDocument(content,'v1',db,now);archiveLegalDocument(content,'v2',db,now);
 assert.equal(db.prepare('SELECT count(*) n FROM legal_document_archives').get().n,1);assert.throws(()=>db.prepare("UPDATE legal_document_archives SET content_json='changed'").run());assert.throws(()=>db.prepare('DELETE FROM legal_document_archives').run());
 const record=await legalAcceptanceRecord('google:u','registration','event',content,{email:'u@example.org',displayName:'Pessoa <img onerror=x>',endDate:'2026-12-01'});
 const statement=registrationAcceptanceStatement(record,0);db.prepare(statement.sql.replace(' WHERE changes() = ?','')).run(...statement.values.slice(0,-1));
 const proof=evidenceForRecord(db,record.id);assert.equal(proof.sha256,hash);assert.deepEqual(proof.documents,JSON.parse(content));assert.equal(proof.email,'u@example.org');assert.equal(proof.name,'Pessoa <img onerror=x>');
 const html=evidenceHtml(proof);assert(!html.includes('<script>'));assert(!html.includes('<img'));assert(html.includes('&lt;script&gt;'));assert(html.includes('u@example.org'));
 db.exec('DROP TRIGGER legal_archive_immutable_update');db.prepare("UPDATE legal_document_archives SET content_json='{}'").run();assert.throws(()=>evidenceForRecord(db,record.id));
 }finally{db.close();}
});
test('versões históricas recuperam a cópia pelo hash sem atribuir o texto atual a um aceite antigo',()=>{
 const db=fixture();try{seedLegalHistory(db);assert(db.prepare('SELECT count(*) n FROM legal_document_archives').get().n>1);db.prepare('INSERT INTO legal_acceptances(id,user_id,terms_version,terms_hash,accepted_at,action,resource_id) VALUES (?,?,?,?,?,?,?)').run('legacy','u','old','unmapped-hash',now,'portal-access','portal');recordUserActivity({userId:'u',email:'current@example.org',displayName:'Nome atual'},db,now);const result=evidenceForRecord(db,'legacy');assert.equal(result.archiveAvailable,false);assert.equal(result.documents,null);assert(result.note.includes('não foi localizada'));assert.equal(result.identitySource,'current-account-for-legacy-record');assert(evidenceHtml(result).includes('Nome atual (cadastro atual)'));
 }finally{db.close();}
});
test('rotação de backup remove somente cópias do portal com mais de trinta dias',()=>{
 const folder=mkdtempSync(join(tmpdir(),'portal-backup-test-'));try{
 const old=join(folder,'portal-2026-09-01T00-00-00-000Z.sqlite'),recent=join(folder,'portal-2026-11-09T00-00-00-000Z.sqlite'),other=join(folder,'outro-banco.sqlite'),newlyCopied=join(folder,'portal-2026-08-01T00-00-00-000Z.sqlite');
 for(const p of [old,recent,other,newlyCopied])writeFileSync(p,'fixture');utimesSync(old,new Date('2026-09-01'),new Date('2026-09-01'));assert.equal(pruneApplicationBackups(folder,now),1);assert(!existsSync(old));assert(existsSync(recent)&&existsSync(other)&&existsSync(newlyCopied));
 }finally{rmSync(folder,{recursive:true,force:true});}
});
