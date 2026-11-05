import {test} from 'node:test';
import assert from 'node:assert/strict';
import {portalConsentError,safePortalReturnTo} from '../lib/portal-consent.js';
import {legalDocumentVersion} from '../lib/portal-legal.js';
test('o acesso exige as duas confirmações explícitas da versão atual',()=>{
 assert(portalConsentError({version:legalDocumentVersion,termsAccepted:true}));
 assert(portalConsentError({version:legalDocumentVersion,privacyAcknowledged:true}));
 assert(portalConsentError({version:'old',termsAccepted:true,privacyAcknowledged:true}));
 assert(portalConsentError({version:legalDocumentVersion,termsAccepted:'true',privacyAcknowledged:true}));
 assert.equal(portalConsentError({version:legalDocumentVersion,termsAccepted:true,privacyAcknowledged:true}),'');
});
test('o retorno do aceite permanece no portal e recusa ciclos e endereços externos',()=>{
 for(const value of ['https://example.com','//example.com','/\\example.com','/aceite','/auth/logout','/api/events'])assert.equal(safePortalReturnTo(value),'/');
 assert.equal(safePortalReturnTo('/mapa-de-atuacao/alfabetizacao'),'/mapa-de-atuacao/alfabetizacao');
});
