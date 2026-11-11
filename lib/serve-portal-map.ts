import {getSiteUser,siteSignOutPath} from '@/app/site-auth';
import {siteOrigin,safeReturnPath} from '@/lib/oauth-config';
import {hasPortalConsent} from '@/lib/portal-consent-store';
import {getAppRole} from '@/app/authz';
import {portalMapRequestTarget} from '@/lib/portal-map-paths';
import {mapStorage} from '@/lib/map-storage.mjs';
import map from '@/lib/generated-map.js';
export async function servePortalMap(request:Request){
 const url=new URL(request.url),origin=siteOrigin()??url.origin,target=portalMapRequestTarget(url.pathname,url.search);
 if(!target)return new Response('Não encontrado',{status:404});
 if(target.redirect)return Response.redirect(new URL(target.redirect,origin),308);
 const user=await getSiteUser();
 if(!user)return target.page?Response.redirect(new URL('/login?return_to='+encodeURIComponent(safeReturnPath(url.pathname+url.search)),origin),302):Response.json({error:'Entre no portal para acessar o mapa.'},{status:401,headers:{'cache-control':'no-store'}});
 if(!await hasPortalConsent(user.userId))return target.page?Response.redirect(new URL('/aceite?return_to='+encodeURIComponent(url.pathname+url.search),origin),302):Response.json({error:'É necessário aceitar os documentos do portal.'},{status:428,headers:{'cache-control':'no-store'}});
 url.pathname=target.path!;
 const role=await getAppRole(user);
 return map.fetch(new Request(url,request),{...process.env,BUCKET:mapStorage(),MAP_ORIGIN:origin,PORTAL_SIGN_OUT:siteSignOutPath(),PORTAL_PAGE_VIEW:target.view||'programas'},{...user,email:user.email.trim().toLowerCase(),role});
}
