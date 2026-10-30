import {FunctionalAreaIcon} from '@/components/functional-area-icon';
import {requireSiteUser} from '@/app/site-auth';
import {HubLayout,PortalHero,ForwardIcon} from '@/components/hub-layout';
import {areas} from '@/lib/hub-data';
import {redirect} from 'next/navigation';
import {functionalAreasEnabled} from '@/lib/portal-features';
export const dynamic='force-dynamic';
export default async function FunctionalPage(){
 if(!functionalAreasEnabled)redirect('/');
 await requireSiteUser('/funcionais');
 return <HubLayout hero={<PortalHero title="Áreas Funcionais FL" description="Conheça as áreas da Fundação Lemann e encontre os apoios para sua organização." back={{href:'/',label:'Início'}}/>}><section className="hub-section functional-directory"><div className="hub-area-grid">{areas.map(a=><a className="hub-area" href={'/funcionais/'+a.id} key={a.id}><div><FunctionalAreaIcon id={a.id}/><h3>{a.name}</h3><p>{a.description}</p></div><span>Acessar a área <ForwardIcon/></span></a>)}</div></section></HubLayout>;
}
