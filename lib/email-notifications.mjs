import {getSqliteDatabase} from '../db/sqlite.mjs';

export function queueNotification(db,payload){
 const id=crypto.randomUUID();
 db.prepare('INSERT INTO notification_outbox(id,payload,created_at) VALUES (?,?,?)').run(id,JSON.stringify(payload),new Date().toISOString());
 return id;
}

export async function flushNotifications({database,fetcher=fetch,limit=20,now=Math.floor(Date.now()/1000)}={}){
 const url=process.env.EMAIL_WEBHOOK_URL?.trim(),secret=process.env.EMAIL_WEBHOOK_SECRET?.trim();
 if(!url||!secret)return {sent:0,pending:true};
 const db=database||getSqliteDatabase();
 const rows=db.prepare("SELECT id,payload,attempts FROM notification_outbox WHERE (status='pending' AND next_attempt_at<=?) OR (status='sending' AND locked_until<=?) ORDER BY created_at LIMIT ?").all(now,now,limit);
 const results=await Promise.all(rows.map(async row=>{
  const claim=db.prepare("UPDATE notification_outbox SET status='sending',locked_until=?,attempts=attempts+1 WHERE id=? AND ((status='pending' AND next_attempt_at<=?) OR (status='sending' AND locked_until<=?))").run(now+120,row.id,now,now);
  if(!claim.changes)return false;
  try{
   const response=await fetcher(url,{method:'POST',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json'},body:JSON.stringify({secret,...JSON.parse(row.payload)})});
   const result=await response.json();
   if(!response.ok||result?.ok!==true)throw Error('Envio pendente');
   db.prepare("UPDATE notification_outbox SET status='sent',payload='',locked_until=0,sent_at=? WHERE id=?").run(new Date().toISOString(),row.id);
   return true;
  }catch{
   db.prepare("UPDATE notification_outbox SET status='pending',locked_until=0,next_attempt_at=? WHERE id=?").run(now+Math.min(60*2**Math.min(Number(row.attempts),6),3600),row.id);
   return false;
  }
 }));
 return {sent:results.filter(Boolean).length,pending:results.some(x=>!x)};
}
