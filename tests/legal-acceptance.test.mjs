import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {formTermsVersionError,legalAcceptanceRecord,registrationAcceptanceStatement} from '../lib/legal-acceptance.js';
import {legalDocumentVersion} from '../lib/portal-legal.js';
test('o formulário exige a versão corrente sem repetir o aceite de acesso',()=>{
 assert(formTermsVersionError(undefined));
 assert(formTermsVersionError({}));
 assert(formTermsVersionError({termsVersion:'old-version'}));
 assert.equal(formTermsVersionError({termsVersion:legalDocumentVersion}),'');
});
test('o registro usa a identidade autenticada, data e impressão do documento',async()=>{
 const doc=JSON.parse(await readFile(new URL('../lib/legal-documents.json',import.meta.url),'utf8'))[0];
 const text=JSON.stringify(doc),record=await legalAcceptanceRecord('signed-in-user','registration','event-id',text);
 assert.equal(record.userId,'signed-in-user');assert.equal(record.termsVersion,legalDocumentVersion);assert.equal(record.resourceId,'event-id');
 assert.equal(record.termsHash,createHash('sha256').update(text).digest('hex'));assert(Number.isFinite(Date.parse(record.acceptedAt)));
});
test('só registra o aceite de inscrição se o lote anterior inseriu todas as pessoas',async()=>{
 const db=new DatabaseSync(':memory:');
 try{
  for(const file of (await readdir(new URL('../database/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())db.exec(await readFile(new URL('../database/'+file,import.meta.url),'utf8'));
  db.exec('CREATE TABLE registration_fixture(id INTEGER PRIMARY KEY);');
  const write=async(changes)=>{
   const statement=registrationAcceptanceStatement(await legalAcceptanceRecord('u','registration','e','terms'),2);
   db.exec('BEGIN;');
   db.exec(changes===2?'INSERT INTO registration_fixture VALUES (1),(2);':'INSERT INTO registration_fixture SELECT 3 WHERE 0;');
   db.prepare(statement.sql).run(...statement.values);db.exec('COMMIT;');
  };
  await write(0);assert.equal(db.prepare('SELECT count(*) n FROM legal_acceptances').get().n,0);
  await write(2);assert.equal(db.prepare('SELECT count(*) n FROM legal_acceptances').get().n,1);
 }finally{db.close();}
});
