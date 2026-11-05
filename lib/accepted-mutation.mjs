import {getSqliteDatabase} from '../db/sqlite.mjs';
import {registrationAcceptanceStatement} from './legal-acceptance.js';
export function acceptedMutation(query,acceptance,expectedChanges,db=getSqliteDatabase()){
 db.exec('BEGIN IMMEDIATE');
 try{
  const result=db.prepare(query.sql).run(...query.params);
  if(Number(result.changes)===expectedChanges){const statement=registrationAcceptanceStatement(acceptance,expectedChanges);db.prepare(statement.sql).run(...statement.values);}
  db.exec('COMMIT');return result;
 }catch(error){db.exec('ROLLBACK');throw error;}
}
