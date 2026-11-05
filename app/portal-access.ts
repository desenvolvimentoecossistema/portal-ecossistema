import {getSiteUser} from '@/app/site-auth';
import {hasPortalConsent} from '@/lib/portal-consent-store';
export async function getPortalUser(){
 const user=await getSiteUser();return user&&await hasPortalConsent(user.userId)?user:null;
}
