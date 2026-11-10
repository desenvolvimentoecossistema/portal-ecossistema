import {getSqliteDatabase} from '../db/sqlite.mjs';

export function yearsBefore(value,years=2){
 const d=new Date(value);if(!Number.isFinite(d.getTime()))throw Error('Data inválida para conservação.');
 const day=d.getUTCDate();d.setUTCDate(1);d.setUTCFullYear(d.getUTCFullYear()-years);d.setUTCDate(Math.min(day,new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate()));return d.toISOString();
}
// Destructive maintenance is restricted to records older than the stated policy.
// Holds are explicit, dated and scoped; document snapshots contain no user records.
export function runPrivacyRetention({database=getSqliteDatabase(),now=new Date().toISOString(),force=false}={}){
 const db=database,instant=new Date(now);if(!Number.isFinite(instant.getTime()))throw Error('Data inválida.');
 const iso=instant.toISOString(),cutoff=yearsBefore(iso),day=cutoff.slice(0,10),seconds=Math.floor(instant.getTime()/1000);
 const stats={events:0,registrations:0,acceptances:0,users:0,sessions:0,states:0,drafts:0,notifications:0};
 db.exec('PRAGMA secure_delete=ON; BEGIN IMMEDIATE');
 try{
  const previous=db.prepare("SELECT completed_at FROM privacy_maintenance WHERE id='retention'").get();
  if(!force&&previous&&Date.parse(previous.completed_at)>instant.getTime()-24*3600000){db.exec('COMMIT');return {skipped:true,...stats};}
  const held=(type,id)=>Boolean(db.prepare('SELECT 1 FROM privacy_retention_holds WHERE subject_type=? AND subject_id=? AND expires_at>? LIMIT 1').get(type,id,iso));
  const stale=val=>Number.isFinite(Date.parse(val))&&val<cutoff;
  for(const e of db.prepare('SELECT id,end_date,created_at,updated_at,created_by_user_id FROM events').all()){
   const validDate=/^\d{4}-\d{2}-\d{2}$/.test(e.end_date)&&Number.isFinite(Date.parse(e.end_date))&&new Date(e.end_date).toISOString().slice(0,10)===e.end_date;
   const expired=validDate?e.end_date<day:!e.end_date&&stale(e.updated_at||e.created_at);
   if(!expired||held('event',e.id)||held('user',e.created_by_user_id))continue;
   if(db.prepare(`SELECT 1 FROM legal_acceptances a JOIN privacy_retention_holds h ON h.subject_type='user' AND h.subject_id=a.user_id WHERE a.resource_id=? AND h.expires_at>? LIMIT 1`).get(e.id,iso))continue;
   // A participant-specific legal hold also protects the associated agenda.
   if(db.prepare(`SELECT 1 FROM registrations r JOIN portal_user_activity u ON lower(r.email)=lower(u.email)
    JOIN privacy_retention_holds h ON h.subject_type='user' AND h.subject_id=u.user_id WHERE r.event_id=? AND h.expires_at>? LIMIT 1`).get(e.id,iso))continue;
   stats.registrations+=Number(db.prepare('DELETE FROM registrations WHERE event_id=?').run(e.id).changes);
   stats.acceptances+=Number(db.prepare("DELETE FROM legal_acceptances WHERE action<>'portal-access' AND resource_id=?").run(e.id).changes);
   stats.events+=Number(db.prepare('DELETE FROM events WHERE id=?').run(e.id).changes);
  }
  // Canceled agendas no longer exist; retain their evidence through the later
  // of the recorded event end date and the last accepted operation.
  for(const a of db.prepare("SELECT * FROM legal_acceptances WHERE action<>'portal-access' AND NOT EXISTS(SELECT 1 FROM events WHERE id=resource_id)").all()){
   if(held('user',a.user_id)||held('event',a.resource_id))continue;
   const anchor=a.resource_end_date&&a.resource_end_date>a.accepted_at.slice(0,10)?a.resource_end_date+'T23:59:59.999Z':a.accepted_at;
   if(stale(anchor))stats.acceptances+=Number(db.prepare('DELETE FROM legal_acceptances WHERE id=?').run(a.id).changes);
  }
  stats.sessions=Number(db.prepare('DELETE FROM oauth_sessions WHERE expires_at<=?').run(seconds).changes);
  stats.states=Number(db.prepare('DELETE FROM oauth_states WHERE expires_at<=?').run(seconds).changes);
  stats.drafts=Number(db.prepare(`DELETE FROM event_drafts WHERE updated_at<? AND NOT EXISTS(SELECT 1 FROM privacy_retention_holds h WHERE h.subject_type='user' AND h.subject_id=event_drafts.created_by_user_id AND h.expires_at>?)`).run(cutoff,iso).changes);
  stats.notifications=Number(db.prepare('DELETE FROM notification_outbox WHERE created_at<?').run(cutoff).changes);
  db.prepare('DELETE FROM privacy_retention_holds WHERE expires_at<?').run(cutoff);
  for(const u of db.prepare('SELECT * FROM portal_user_activity WHERE last_seen_at<?').all(cutoff)){
   if(!stale(u.last_seen_at)||held('user',u.user_id))continue;
   if(db.prepare('SELECT 1 FROM oauth_sessions WHERE user_id=? AND expires_at>?').get(u.user_id,seconds))continue;
   if(db.prepare('SELECT 1 FROM events WHERE created_by_user_id=? LIMIT 1').get(u.user_id))continue;
   if(db.prepare("SELECT 1 FROM legal_acceptances WHERE user_id=? AND action<>'portal-access' LIMIT 1").get(u.user_id))continue;
   stats.acceptances+=Number(db.prepare("DELETE FROM legal_acceptances WHERE user_id=? AND action='portal-access'").run(u.user_id).changes);
   if(u.email)db.prepare('DELETE FROM app_user_roles WHERE lower(email)=?').run(u.email.toLowerCase());
   db.prepare('DELETE FROM portal_user_activity WHERE user_id=?').run(u.user_id);stats.users++;
  }
  db.prepare(`DELETE FROM app_user_roles WHERE updated_at<? AND NOT EXISTS(SELECT 1 FROM portal_user_activity u WHERE lower(u.email)=lower(app_user_roles.email)) AND NOT EXISTS(SELECT 1 FROM oauth_sessions s WHERE lower(s.email)=lower(app_user_roles.email) AND s.expires_at>?)`).run(cutoff,seconds);
  db.prepare("INSERT INTO privacy_maintenance VALUES ('retention',?,?) ON CONFLICT(id) DO UPDATE SET completed_at=excluded.completed_at,counts_json=excluded.counts_json").run(iso,JSON.stringify(stats));
  db.exec('COMMIT');return {skipped:false,...stats};
 }catch(error){db.exec('ROLLBACK');throw error;}
}
