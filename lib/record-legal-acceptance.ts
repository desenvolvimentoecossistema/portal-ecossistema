import documents from '@/lib/legal-documents.json';
import {legalAcceptanceRecord} from '@/lib/legal-acceptance.js';
import {archiveLegalDocument} from '@/lib/legal-archive.mjs';
import {legalDocumentVersion} from '@/lib/portal-legal';
export function acceptanceRecord(userId:string,action:string,resourceId:string,identity:{email?:string;displayName?:string;endDate?:string}={}){
 const content=JSON.stringify(documents);
 archiveLegalDocument(content,legalDocumentVersion);
 return legalAcceptanceRecord(userId,action,resourceId,content,identity);
}
