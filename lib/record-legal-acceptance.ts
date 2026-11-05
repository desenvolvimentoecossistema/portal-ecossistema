import documents from '@/lib/legal-documents.json';
import {legalAcceptanceRecord} from '@/lib/legal-acceptance.js';
export function acceptanceRecord(userId:string,action:string,resourceId:string){
 return legalAcceptanceRecord(userId,action,resourceId,JSON.stringify(action==='portal-access'?documents:documents[0]));
}
