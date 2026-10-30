import {requireSiteUser} from '@/app/site-auth';
import {HubLayout,OrgLogo,PortalHero,ForwardIcon} from '@/components/hub-layout';
import {organizations} from '@/lib/hub-data';
import {portalMapData} from '@/lib/portal-map-data';
export const dynamic='force-dynamic';
export default async function OrganizationsPage(){
 const user=await requireSiteUser('/organizacoes');const dims=await portalMapData(user);
 return <HubLayout hero={<PortalHero title="Organizações Core" description="Conheça o trabalho de cada organização e descubra como se conectar." back={{href:'/',label:'Início'}}/>}><div className="hub-org-grid">{organizations.map(o=><a className="hub-org" href={'/organizacoes/'+o.id} key={o.id}><OrgLogo {...o}/><div><h3>{o.name}</h3><p>{o.summary}</p><span className="organization-card-link">{Object.keys(dims[o.id]||{}).length} programas no mapa <ForwardIcon/></span></div></a>)}</div><section className="hub-section organization-map-callout"><h2>Como as atuações se conectam?</h2><p className="hub-section-copy">Os Mapas Programáticos e de Atuação permitem comparar públicos, níveis e estratégias de atuação em Educação e Lideranças.</p><a className="hub-link" href="/mapa">Explorar o mapa <ForwardIcon/></a></section></HubLayout>;
}
