import {and,eq} from 'drizzle-orm';
import {getDb} from '@/db';
import {legalAcceptances} from '@/db/schema';
import {legalDocumentVersion} from '@/lib/portal-legal';
import documents from '@/lib/legal-documents.json';
import {legalDocumentFingerprint} from '@/lib/legal-acceptance';
export async function hasPortalConsent(userId:string){
 const fingerprint=await legalDocumentFingerprint(JSON.stringify(documents));
 const [record]=await getDb().select({id:legalAcceptances.id}).from(legalAcceptances).where(and(eq(legalAcceptances.userId,userId),eq(legalAcceptances.action,'portal-access'),eq(legalAcceptances.termsVersion,legalDocumentVersion),eq(legalAcceptances.termsHash,fingerprint))).limit(1);
 return Boolean(record);
}
