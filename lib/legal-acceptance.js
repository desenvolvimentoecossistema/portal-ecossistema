import {legalDocumentVersion} from './portal-legal.js';
export function formTermsVersionError(input){
 if(input?.termsVersion!==legalDocumentVersion)return 'Os Termos de Uso foram atualizados. Recarregue a página e consulte os documentos antes de continuar.';
 return '';
}
export async function legalDocumentFingerprint(termsText){
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(termsText));
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function legalAcceptanceRecord(userId,action,resourceId,termsText){
 return {id:crypto.randomUUID(),userId,termsVersion:legalDocumentVersion,termsHash:await legalDocumentFingerprint(termsText),acceptedAt:new Date().toISOString(),action,resourceId};
}
export function registrationAcceptanceStatement(acceptance,count){
 return {sql:'INSERT INTO legal_acceptances (id,user_id,terms_version,terms_hash,accepted_at,action,resource_id) SELECT ?,?,?,?,?,?,? WHERE changes() = ?',values:[acceptance.id,acceptance.userId,acceptance.termsVersion,acceptance.termsHash,acceptance.acceptedAt,acceptance.action,acceptance.resourceId,count]};
}
