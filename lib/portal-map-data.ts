import {mapStorage} from '@/lib/map-storage.mjs';
import map from '@/lib/generated-map.js';
import type {SiteUser} from '@/app/site-auth';
export async function portalMapData(user:SiteUser){
 const response=await map.fetch(new Request('https://portal.internal/api/data'),{...process.env,BUCKET:mapStorage()},user);
 if(!response.ok)throw new Error('Não foi possível consultar os dados publicados do mapa.');
 const data=await response.json() as {snapshot:{dims:Record<string,Record<string,{segmento_categoria?:string}>>}};
 return data.snapshot.dims;
}
