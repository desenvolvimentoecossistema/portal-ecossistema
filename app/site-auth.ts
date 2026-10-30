import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { oauthSessions } from '@/db/schema';
import {emailIsAllowed,SESSION_COOKIE,tokenHash,safeReturnPath} from '@/lib/oauth-config';
export type SiteUser={userId:string;displayName:string;email:string;fullName:string|null;sessionExpiresAt?:number};
export async function getSiteUser():Promise<SiteUser|null>{
 const token=(await cookies()).get(SESSION_COOKIE)?.value;
 if(!token||!/^[-_A-Za-z0-9]{40,100}$/.test(token))return null;
 const [session]=await getDb().select().from(oauthSessions).where(eq(oauthSessions.id,await tokenHash(token))).limit(1);
 if(!session||session.expiresAt<=Math.floor(Date.now()/1000)||!session.userId.startsWith('google:')||!emailIsAllowed(session.email))return null;
 return {...session,fullName:session.displayName,sessionExpiresAt:session.expiresAt*1000};
}
export async function requireSiteUser(returnTo:string):Promise<SiteUser>{const user=await getSiteUser();if(user)return user;redirect('/login?return_to='+encodeURIComponent(safeReturnPath(returnTo)));}
export function siteSignOutPath(){return '/auth/logout';}
