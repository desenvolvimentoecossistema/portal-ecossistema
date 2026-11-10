import {ArrowRight,BookOpen,GraduationCap,Users} from 'lucide-react';
import '@/public/portal-home-tools.css';
import {requireSiteUser} from '@/app/site-auth';
import {HubLayout,PortalHero} from '@/components/hub-layout';

export const dynamic='force-dynamic';

export default async function ActingMapsPage(){
 await requireSiteUser('/mapa-de-atuacao');
 return <HubLayout hero={<PortalHero title="Mapas de Atuação" description="Escolha um mapa para conhecer as estratégias de atuação das organizações do Ecossistema."/>}>
  <div className="hub-tools hub-tools-three">
   <a href="/mapa-de-atuacao/alfabetizacao" className="hub-tool"><BookOpen aria-hidden="true"/><div><h2>Alfabetização</h2></div><ArrowRight aria-hidden="true"/></a>
   <a href="/mapa-de-atuacao/fundamental-2" className="hub-tool"><GraduationCap aria-hidden="true"/><div><h2>Fundamental 2</h2></div><ArrowRight aria-hidden="true"/></a>
   <a href="/mapa-de-atuacao/liderancas" className="hub-tool"><Users aria-hidden="true"/><div><h2>Lideranças</h2></div><ArrowRight aria-hidden="true"/></a>
  </div>
 </HubLayout>;
}
