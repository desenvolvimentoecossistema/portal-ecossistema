import {legalDocumentVersion} from './portal-legal.js';
export function portalConsentError(input){
 if(input?.termsAccepted!==true||input?.privacyAcknowledged!==true)return 'Confirme o aceite dos Termos de Uso e a leitura do Aviso de Privacidade.';
 if(input.version!==legalDocumentVersion)return 'Os documentos foram atualizados. Recarregue a página e consulte a versão atual.';
 return '';
}
export function safePortalReturnTo(value){
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return '/';
 try{const url=new URL(value,'https://portal.invalid');if(url.origin!=='https://portal.invalid'||/^\/(aceite|auth|login|api)(\/|$)/.test(url.pathname))return '/';return url.pathname+url.search+url.hash;}catch{return '/';}
}
