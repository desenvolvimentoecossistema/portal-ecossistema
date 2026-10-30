export function resolvePortalMapLink(search,dimensions){
 const params=new URLSearchParams(search),candidate=params.get('organizacao')||'',org=Object.hasOwn(dimensions,candidate)?candidate:'',query=(params.get('busca')||'').trim().slice(0,300);
 if(!org)return {org:'',query,tab:'educacao'};
 const programs=dimensions[org],exact=Object.hasOwn(programs,query)?[programs[query]]:Object.values(programs);
 const education=exact.some(p=>String(p.segmento_categoria||'').split(';').map(x=>x.trim()).includes('Educação'));
 return {org,query,tab:education?'educacao':'liderancas'};
}
