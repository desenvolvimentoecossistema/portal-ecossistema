import {getSqliteDatabase} from '../db/sqlite.mjs';
const [type,id,expires,reason]=process.argv.slice(2);
if(!['user','event'].includes(type)||!id||!reason?.trim()||!Number.isFinite(Date.parse(expires))||Date.parse(expires)<=Date.now())throw Error('Informe: user|event identificador vencimento-ISO justificativa-legal.');
getSqliteDatabase().prepare('INSERT INTO privacy_retention_holds(id,subject_type,subject_id,reason,expires_at,created_at) VALUES (?,?,?,?,?,?)').run(crypto.randomUUID(),type,id,reason.trim(),new Date(expires).toISOString(),new Date().toISOString());
console.log('Conservação excepcional registrada com data de vencimento.');
