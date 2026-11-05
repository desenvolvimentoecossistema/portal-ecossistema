import {getSiteUser} from '@/app/site-auth';
import {getAppRole} from '@/app/authz';
import {isSameOriginMutation} from '@/lib/request-origin';
import {portalConsentError} from '@/lib/portal-consent';
import {hasPortalConsent} from '@/lib/portal-consent-store';
import {acceptanceRecord} from '@/lib/record-legal-acceptance';
import {getDb} from '@/db';
import {legalAcceptances} from '@/db/schema';
import {legalDocumentVersion} from '@/lib/portal-legal';
export const dynamic='force-dynamic';
export async function GET(){
 const user=await getSiteUser();
 const headers={'cache-control':'private, no-store'};
 if(!user)return Response.json({error:'Acesso necessário.'},{status:401,headers});
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('portal-legal-notice:'+user.userId));
 const reader=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 return Response.json({reader,version:legalDocumentVersion,accepted:await hasPortalConsent(user.userId),canPreview:await getAppRole(user)==='admin'},{headers});
}
export async function POST(request:Request){
 const headers={'cache-control':'private, no-store'};
 if(!isSameOriginMutation(request))return Response.json({error:'Origem inválida.'},{status:403,headers});
 const user=await getSiteUser();
 if(!user)return Response.json({error:'Acesso necessário.'},{status:401,headers});
 try{
  const input=await request.json(),error=portalConsentError(input);
  if(error)return Response.json({error},{status:400,headers});
  const record=await acceptanceRecord(user.userId,'portal-access','portal');
  await getDb().insert(legalAcceptances).values(record);
  return Response.json({accepted:true,version:legalDocumentVersion},{headers});
 }catch{return Response.json({error:'Não foi possível registrar o aceite. Tente novamente.'},{status:503,headers});}
}
