import {notFound} from 'next/navigation';
import {requireSiteUser} from '@/app/site-auth';
import {HubLayout,PortalHero,ForwardIcon} from '@/components/hub-layout';
import {organizations} from '@/lib/hub-data';
import {portalMapData} from '@/lib/portal-map-data';
export const dynamic='force-dynamic';
export default async function OrganizationPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const user=await requireSiteUser('/organizacoes/'+slug);const organization=organizations.find(o=>o.id===slug);if(!organization)notFound();const dims=await portalMapData(user);const programs=Object.entries(dims[slug]||{});
 return <HubLayout hero={<PortalHero title={organization.name} description={organization.summary} organization={organization} back={{href:'/organizacoes',label:'Organizações Core'}}/>}><section className="organization-about"><h2>Sobre a organização</h2>{organization.description.split(/\n+/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</section><div className="organization-actions"><a className="hub-link" href={organization.website} target="_blank" rel="noopener noreferrer" aria-label={`Site oficial de ${organization.name} (abre em nova aba)`}>Site oficial <ForwardIcon/></a><a className="hub-link" href={'/mapa?organizacao='+slug}>Ver atuação no mapa <ForwardIcon/></a><a className="hub-link" href={'/imersoes?organizacao='+encodeURIComponent(organization.agendaName)}>Ver imersões da organização <ForwardIcon/></a></div><section className="hub-section"><h2>Programas</h2><ul className="hub-program-list">{programs.map(([name,program])=><li key={name}><a href={'/mapa?organizacao='+slug+'&busca='+encodeURIComponent(name)}>{name} <ForwardIcon/></a><span>{program.segmento_categoria}</span></li>)}</ul></section></HubLayout>;
}
