import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatRecordedDate,eventLastEditedDate} from '../lib/publication-dates.js';

test('datas registradas são apresentadas no horário de São Paulo sem criar datas ausentes',()=>{
 assert.equal(formatRecordedDate('2026-11-04T02:30:00Z'),'03/11/2026, 23:30');
 for(const value of [null,undefined,'','inválido'])assert.equal(formatRecordedDate(value),null);
});

test('a edição da agenda prevalece sobre o cadastro, com alternativa para registros antigos',()=>{
 assert.equal(eventLastEditedDate({updatedAt:'2026-11-04T15:00:00Z',createdAt:'2026-10-01T15:00:00Z'}),'04/11/2026, 12:00');
 assert.equal(eventLastEditedDate({updatedAt:'',createdAt:'2026-10-01T15:00:00Z'}),'01/10/2026, 12:00');
 assert.equal(eventLastEditedDate({}),'data não registrada');
});
