import {FunctionalTeam} from '@/components/functional-team';
import {FunctionalAreaIcon} from '@/components/functional-area-icon';
import {notFound,redirect} from 'next/navigation';
import {functionalAreasEnabled} from '@/lib/portal-features';
import {requireSiteUser} from '@/app/site-auth';
import {areas,offers,offerTypes,coinvestHub,type Offer} from '@/lib/hub-data';
import {HubLayout,PortalHero,ForwardIcon} from '@/components/hub-layout';
export const dynamic='force-dynamic';
const introductions:Record<string,string>={
 coinvest:'CoInvest apoia as organizações na captação de recursos e na construção de parcerias. A área aproxima times de captação, articula conexões com investidores e apoia a estruturação de propostas e oportunidades de colaboração.',
 cdp:'Conhecimento, Dados e Pesquisa aproxima as equipes de monitoramento e avaliação para compartilhar experiências e fortalecer o uso de evidências. A área reúne a Comunidade de Monitoramento e Avaliação, a Rubrica de Evidências de Impacto e referências para estudos e pesquisas.',
 equidade:'A área de Equidade Racial apoia a incorporação da pauta nas estratégias, na gestão e nas práticas das organizações. O trabalho reúne espaços de troca, acompanhamento de projetos e iniciativas de formação e sensibilização das lideranças.',
 gente:'Gente e Gestão apoia os times das organizações em recrutamento, indicações e compartilhamento de oportunidades. A área também acompanha serviços comuns ao Ecossistema, como o plano de saúde, e a estruturação de novas iniciativas para posições estratégicas.',
 financas:'Finanças e Controle reúne apoios de Integridade e Compliance para as organizações. A atuação combina trocas entre os responsáveis de cada organização e suporte para encaminhar demandas, considerando os riscos e a melhor forma de condução.',
 tech:'Inovação e Tech apoia a construção de capacidades de tecnologia nas organizações. A Plataforma Tech reúne serviços em pessoas, infraestrutura e dados, formação e cultura, produto e inteligência artificial, além de apoio a demandas específicas.',
 marca:'Marca e Posicionamento aproxima os times de comunicação e apoia o alinhamento das iniciativas do Ecossistema. A atuação inclui troca de experiências, apoio em reputação e crises e colaboração em eventos, campanhas e ações de marca.',
 mobilizacao:'Mobilização articula as organizações em pautas prioritárias de Educação e Lideranças. A área promove trocas entre equipes de relações governamentais e advocacy e compartilha informações de monitoramento e incidência em políticas públicas.'
};
function OfferRow({offer,showKind=false}:{offer:Offer;showKind?:boolean}){
 const status=offer.status||(offer.planned?'A confirmar':'');
 const descriptionRepeatsStatus=Boolean(status)&&offer.description.trim().toLocaleLowerCase('pt-BR')===status.trim().toLocaleLowerCase('pt-BR');
 return <details className="functional-support-row"><summary>{showKind&&<div className="functional-editorial-kind">{offerTypes.find(t=>t.id===offer.type)?.name}</div>}<h3>{offer.name}</h3><span className="support-expand" aria-hidden="true">+</span></summary><div className="support-row-body">{status&&<span className="hub-planned">{status}</span>}{!descriptionRepeatsStatus&&<p>{offer.description}</p>}{(offer.frequency||offer.audience||offer.responsible)&&<dl className="functional-meta">{offer.frequency&&<div><dt>Periodicidade</dt><dd>{offer.frequency}</dd></div>}{offer.audience&&<div><dt>Público</dt><dd>{offer.audience}</dd></div>}{offer.responsible&&<div><dt>Responsáveis</dt><dd>{offer.responsible}</dd></div>}</dl>}</div></details>;
}
export default async function AreaPage({params}:{params:Promise<{slug:string}>}){
 if(!functionalAreasEnabled)redirect('/');
 const {slug}=await params;await requireSiteUser('/funcionais/'+slug);const area=areas.find(a=>a.id===slug);if(!area)notFound();const ownOffers=offers.filter(o=>o.area===slug),routines=ownOffers.filter(o=>o.type==='rotinas'),support=ownOffers.filter(o=>o.type!=='rotinas');
 return <HubLayout hero={<PortalHero title={area.name} description={area.description} back={{href:'/funcionais',label:'Todas as áreas'}}/>}><div className="functional-editorial functional-compact"><section id="sobre" className="functional-editorial-intro"><div className="functional-editorial-heading"><div className="functional-overview-title"><FunctionalAreaIcon id={slug}/><h2>Como podemos apoiar</h2></div><a className="hub-link" href="#contatos">Fale com o time <ForwardIcon/></a></div><p>{introductions[slug]}</p>{slug==='coinvest'&&<a className="hub-link functional-editorial-hub" href={coinvestHub} target="_blank" rel="noopener noreferrer">Acessar Hub CoInvest <ForwardIcon/></a>}</section>
 {routines.length>0&&<section className="functional-editorial-group" id="rotinas"><h2>Rotina da área</h2><div className="functional-offer-blocks">{routines.map(o=><OfferRow offer={o} key={o.id}/>)}</div></section>}
 {support.length>0&&<section className="functional-editorial-group" id="apoios"><h2>Apoios e iniciativas</h2><div className="functional-offer-blocks">{support.map(o=><OfferRow offer={o} showKind key={o.id}/>)}</div></section>}
 <section className="functional-editorial-team" id="contatos"><h2>Conheça o time</h2><FunctionalTeam area={slug}/></section>
 </div></HubLayout>;
}
