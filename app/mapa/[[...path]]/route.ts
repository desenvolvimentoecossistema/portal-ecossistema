import {getSiteUser} from '@/app/site-auth';
import {safeReturnPath,siteOrigin} from '@/lib/oauth-config';
import {mapStorage} from '@/lib/map-storage.mjs';
import map from '@/lib/generated-map.js';
export const dynamic='force-dynamic';
export const runtime='nodejs';
async function handle(request:Request){const user=await getSiteUser(),url=new URL(request.url),isPage=/^\/mapa\/?$/.test(url.pathname);if(!user)return isPage?Response.redirect(new URL('/login?return_to='+encodeURIComponent(safeReturnPath(url.pathname+url.search)),url),302):Response.json({error:'Entre no portal para acessar o mapa.'},{status:401,headers:{'cache-control':'no-store'}});url.pathname=url.pathname.replace(/^\/mapa(?=\/|$)/,'')||'/';return map.fetch(new Request(url,request),{...process.env,BUCKET:mapStorage(),MAP_ORIGIN:siteOrigin()||url.origin},{...user,email:user.email.trim().toLowerCase()});}
export const GET=handle;export const HEAD=handle;export const POST=handle;export const PUT=handle;
