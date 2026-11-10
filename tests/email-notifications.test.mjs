import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {queueNotification,flushNotifications} from '../lib/email-notifications.mjs';

test('fila persiste avisos, repete envios pendentes e impede entrega concorrente do mesmo item',async()=>{
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../database/0004_notification_outbox.sql',import.meta.url),'utf8'));
 const previous={url:process.env.EMAIL_WEBHOOK_URL,secret:process.env.EMAIL_WEBHOOK_SECRET};process.env.EMAIL_WEBHOOK_URL='https://example.test/mail';process.env.EMAIL_WEBHOOK_SECRET='fake-test-only';
 try{
  const id=queueNotification(db,{notificationType:'event_cancellation',contactEmail:'person@example.org'});
  await flushNotifications({database:db,now:100,fetcher:async()=>{throw Error('temporary');}});
  assert.equal(db.prepare('SELECT status FROM notification_outbox WHERE id=?').get(id).status,'pending');
  let sent=0;const fetcher=async(_url,options)=>{const body=JSON.parse(options.body);assert.equal(body.contactEmail,'person@example.org');sent++;return {ok:true,json:async()=>({ok:true})};};
  await flushNotifications({database:db,now:101,fetcher});assert.equal(sent,0);
  await Promise.all([flushNotifications({database:db,now:161,fetcher}),flushNotifications({database:db,now:161,fetcher})]);
  assert.equal(sent,1);assert.equal(db.prepare('SELECT status,payload FROM notification_outbox WHERE id=?').get(id).status,'sent');
  assert.equal(db.prepare('SELECT payload FROM notification_outbox WHERE id=?').get(id).payload,'');
  await flushNotifications({database:db,now:1000,fetcher});assert.equal(sent,1);
  db.exec('BEGIN IMMEDIATE');queueNotification(db,{notificationType:'registration_cancellation'});db.exec('ROLLBACK');assert.equal(db.prepare('SELECT count(*) n FROM notification_outbox').get().n,1);
 }finally{db.close();if(previous.url===undefined)delete process.env.EMAIL_WEBHOOK_URL;else process.env.EMAIL_WEBHOOK_URL=previous.url;if(previous.secret===undefined)delete process.env.EMAIL_WEBHOOK_SECRET;else process.env.EMAIL_WEBHOOK_SECRET=previous.secret;}
});
