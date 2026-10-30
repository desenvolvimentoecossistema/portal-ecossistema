import {FunctionalAreaIcon} from '@/components/functional-area-icon';
import {ArrowRight,CalendarDays,Network} from 'lucide-react';
import {requireSiteUser} from '@/app/site-auth';
import {HubLayout,OrgLogo,PortalHero,ForwardIcon} from '@/components/hub-layout';
import {organizations,areas} from '@/lib/hub-data';
import SessionGuard from '@/components/session-guard';
import {functionalAreasEnabled} from '@/lib/portal-features';
export const dynamic='force-dynamic';
export default async function Home(){
 await requireSiteUser('/');
 return <HubLayout hero={<PortalHero home title="Quanto mais nos aproximamos, mais possibilidades criamos juntos."/>}><SessionGuard/>
 <div className="hub-tools"><a href="/imersoes" className="hub-tool"><CalendarDays aria-hidden="true"/><div><h2>Imersões em Eventos</h2><p>Encontre agendas das organizações e participe de momentos de troca no Ecossistema.</p></div><ArrowRight aria-hidden="true"/></a><a href="/mapa" className="hub-tool"><Network aria-hidden="true"/><div><h2>Mapas Programáticos e de Atuação</h2><p>Explore os programas e as estratégias de atuação em Educação e Lideranças.</p></div><ArrowRight aria-hidden="true"/></a></div>
 {functionalAreasEnabled&&<section className="hub-section home-functional-section" aria-labelledby="hub-funcionais"><div className="hub-section-head"><div><h2 id="hub-funcionais">Encontre o apoio de que precisa</h2><p className="hub-section-copy">Conecte-se às áreas funcionais da Fundação Lemann.</p></div><a className="hub-link" href="/funcionais">Explorar os apoios <ForwardIcon/></a></div><div className="home-area-list">{areas.map(a=><a href={'/funcionais/'+a.id} key={a.id}><FunctionalAreaIcon id={a.id}/><span>{a.name}</span><ForwardIcon/></a>)}</div></section>}
 <section className="hub-section home-organizations" aria-labelledby="hub-organizacoes"><div className="hub-section-head"><h2 id="hub-organizacoes">Organizações Core</h2><a className="hub-link" href="/organizacoes">Conhecer as organizações <ForwardIcon/></a></div><div className="home-logo-strip">{organizations.map(o=><a key={o.id} href={'/organizacoes/'+o.id} aria-label={'Conhecer '+o.name}><OrgLogo {...o}/></a>)}</div></section>
 </HubLayout>;
}
