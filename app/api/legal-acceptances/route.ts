import {getPortalUser} from '@/app/portal-access';
import {getAppRole} from '@/app/authz';
import {getSqliteDatabase} from '@/db';
import {seedLegalHistory} from '@/lib/legal-archive.mjs';
import {evidenceForRecord,evidenceHtml} from '@/lib/legal-evidence.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const headers={'cache-control':'private, no-store','x-content-type-options':'nosniff'};
 const user=await getPortalUser();if(!user)return Response.json({error:'Faça login e aceite os documentos vigentes.'},{status:401,headers});
 if(await getAppRole(user)!=='admin')return Response.json({error:'Somente administradores podem consultar os aceites.'},{status:403,headers});
 try{
  const db=getSqliteDatabase();seedLegalHistory(db);
  const url=new URL(request.url),id=url.searchParams.get('id');
  if(id){
   if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id))return Response.json({error:'Registro inválido.'},{status:400,headers});
   const proof=evidenceForRecord(db,id);if(!proof)return Response.json({error:'Registro não encontrado.'},{status:404,headers});
   if(url.searchParams.get('format')==='html')return new Response(evidenceHtml(proof),{headers:{...headers,'content-type':'text/html; charset=utf-8','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'"}});
   return new Response(JSON.stringify(proof,null,2),{headers:{...headers,'content-type':'application/json; charset=utf-8','content-disposition':`attachment; filename="aceite-${id}.json"`}});
  }
  const q=(url.searchParams.get('q')||'').trim().slice(0,160),offset=Number(url.searchParams.get('offset')||0);
  if(!Number.isSafeInteger(offset)||offset<0||offset>1000000)return Response.json({error:'Página inválida.'},{status:400,headers});
  const rows=db.prepare(`SELECT a.id,a.user_id AS userId,COALESCE(NULLIF(a.user_email,''),u.email,'') AS email,COALESCE(NULLIF(a.user_name,''),u.display_name,'') AS name,
   a.accepted_at AS acceptedAt,a.terms_version AS version,a.action,a.resource_id AS resourceId,EXISTS(SELECT 1 FROM legal_document_archives d WHERE d.hash=a.terms_hash) AS archiveAvailable
   FROM legal_acceptances a LEFT JOIN portal_user_activity u ON u.user_id=a.user_id
   WHERE (?='' OR instr(lower(a.user_email),lower(?))>0 OR instr(lower(u.email),lower(?))>0 OR instr(lower(a.user_name),lower(?))>0 OR instr(lower(u.display_name),lower(?))>0 OR a.user_id=?)
   ORDER BY a.accepted_at DESC,a.id DESC LIMIT 51 OFFSET ?`).all(q,q,q,q,q,q,offset);
  const maintenance=db.prepare("SELECT completed_at AS completedAt,counts_json AS counts FROM privacy_maintenance WHERE id='retention'").get();
  return Response.json({records:rows.slice(0,50),hasMore:rows.length>50,maintenance:maintenance?{completedAt:maintenance.completedAt,counts:JSON.parse(maintenance.counts as string)}:null},{headers});
 }catch(error){console.error('Falha na consulta de aceites:',error instanceof Error?error.message:'Erro interno');return Response.json({error:'Não foi possível consultar os registros de aceite.'},{status:503,headers});}
}
