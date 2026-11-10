import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {acceptedMutation} from '../lib/accepted-mutation.mjs';
const record=id=>({id,userId:'fixture-user',termsVersion:'fixture',termsHash:'fixture',acceptedAt:'2026-11-04',action:'registration',resourceId:'fixture-event'});
test('a gravação e o aceite são atômicos, inclusive quando o registro do aceite falha',()=>{
 const db=new DatabaseSync(':memory:');
 try{
  for(const file of readdirSync(new URL('../database/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync(new URL('../database/'+file,import.meta.url),'utf8'));
  db.exec('CREATE TABLE fixture(id INTEGER PRIMARY KEY);');
  acceptedMutation({sql:'INSERT INTO fixture VALUES (?)',params:[1]},record('one'),1,db);
  assert.equal(db.prepare('SELECT count(*) n FROM legal_acceptances').get().n,1);
  acceptedMutation({sql:'INSERT INTO fixture SELECT 2 WHERE 0',params:[]},record('zero'),1,db);
  assert.equal(db.prepare('SELECT count(*) n FROM legal_acceptances').get().n,1);
  assert.throws(()=>acceptedMutation({sql:'INSERT INTO fixture VALUES (?)',params:[2]},record('one'),1,db));
  assert.equal(db.prepare('SELECT count(*) n FROM fixture').get().n,1);
 }finally{db.close();}
});
