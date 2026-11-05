import {redirect} from 'next/navigation';
import {requireSiteUser} from '@/app/site-auth';
import {getAppRole} from '@/app/authz';
import {hasPortalConsent} from '@/lib/portal-consent-store';
import {safePortalReturnTo} from '@/lib/portal-consent';
import {PortalConsentGate} from '@/components/portal-consent-gate';
import '@/public/portal-consent.css';
export const dynamic='force-dynamic';
export const metadata={title:'Termos de acesso | Portal do Ecossistema'};
export default async function ConsentPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const user=await requireSiteUser('/aceite'),params=await searchParams;
 const returnTo=safePortalReturnTo(params.return_to),preview=params.preview==='1'&&await getAppRole(user)==='admin';
 if(!preview&&await hasPortalConsent(user.userId))redirect(returnTo);
 return <main className="portal-consent-page"><PortalConsentGate preview={preview} returnTo={returnTo}/></main>;
}
