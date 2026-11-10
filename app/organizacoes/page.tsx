import {requireSiteUser} from '@/app/site-auth';
import {HubLayout,OrgLogo,PortalHero,ForwardIcon} from '@/components/hub-layout';
import {organizations} from '@/lib/hub-data';
import {portalMapData} from '@/lib/portal-map-data';
export const dynamic='force-dynamic';
export default async function OrganizationsPage(){
 const user=await requireSiteUser('/organizacoes');const dims=await portalMapData(user);
 return <HubLayout hero={<PortalHero title="Organizações Core" description="Conheça o trabalho de cada organização que faz parte do nosso Ecossistema." back={{href:'/',label:'Início'}}/>}><div className="hub-org-grid">{organizations.map(o=><a className="hub-org" href={'/organizacoes/'+o.id} key={o.id}><OrgLogo {...o}/><div><h3>{o.name}</h3><p>{o.summary}</p><span className="organization-card-link">{Object.keys(dims[o.id]||{}).length} programas no mapa <ForwardIcon/></span></div></a>)}</div><section className="hub-section organization-map-callout"><h2>Como as atuações se conectam?</h2><p className="hub-section-copy">No Mapa Programático, consulte os programas e compare públicos, níveis e estratégias. Nos Mapas de Atuação, veja como as organizações atuam em Alfabetização, Fundamental 2 e Lideranças.</p><div className="organization-map-actions"><a className="hub-link" href="/mapa-programatico">Explorar o Mapa Programático <ForwardIcon/></a><a className="hub-link" href="/mapa-de-atuacao?selecionar=1">Explorar os Mapas de Atuação <ForwardIcon/></a></div></section></HubLayout>;
}
