import {organizationProfiles,mappedOffers,additionalContacts} from './hub-content.ts';
export {coinvestHub} from './hub-content.ts';
export const HUB_SOURCES={
 deck:'https://docs.google.com/presentation/d/1-Uvn7aDTIf1aISzOUa7O96C0F4MiiybXWkJY97DcSKM/edit',
 folder:'https://drive.google.com/drive/u/0/folders/1ddMXTMSjbzhbUzfrwBHvX0I-3-JnIqMo',
 contacts:'https://docs.google.com/spreadsheets/d/1chlO4sJtDKQ1GT-k9GHs0_SA-jZEer4wwOYkmdwN_Sg/edit'
};
export const organizations=[
 {id:'abc',name:'Bem Comum',short:'BC',color:'#28659A',agendaName:'Bem Comum',website:'https://abemcomum.org/'},
 {id:'cls',name:'Centro Lemann',short:'CL',color:'#FA4400',agendaName:'Centro Lemann',website:'https://centrolemann.org.br/'},
 {id:'reuna',name:'Instituto Reúna',short:'RE',color:'#FF6A6A',agendaName:'Reúna',website:'https://www.institutoreuna.org.br/'},
 {id:'traj',name:'Instituto Trajetórias',short:'TR',color:'#004CA2',agendaName:'Trajetórias',website:'https://www.institutotrajetorias.org.br/'},
 {id:'megaedu',name:'MegaEdu',short:'ME',color:'#11103A',agendaName:'MegaEdu',website:'https://www.megaedu.org.br/'},
 {id:'motriz',name:'Motriz',short:'MO',color:'#004E41',agendaName:'Motriz',website:'https://www.motriz.org/'},
 {id:'ane',name:'Nova Escola',short:'NE',color:'#FA0063',agendaName:'Nova Escola',website:'https://novaescola.org.br/'}
].map(org=>({...org,...organizationProfiles[org.id]}));
export const areas=[
 {id:'coinvest',name:'CoInvest',description:'Captação de recursos e fortalecimento institucional.'},
 {id:'cdp',name:'Conhecimento, Dados e Pesquisa',description:'Monitoramento, avaliação e uso de evidências.'},
 {id:'equidade',name:'Equidade Racial',description:'Equidade racial nas políticas e na gestão das organizações.'},
 {id:'gente',name:'Gente e Gestão',description:'Conexões e serviços para os times das organizações.'},
 {id:'financas',name:'Finanças e Controle',description:'Integridade, compliance e apoio à gestão financeira.'},
 {id:'tech',name:'Inovação e Tech',description:'Tecnologia, inovação e desenvolvimento de capacidades.'},
 {id:'marca',name:'Marca e Posicionamento',description:'Comunicação, reputação e troca de referências.'},
 {id:'mobilizacao',name:'Mobilização',description:'Articulação e incidência em políticas públicas.'}
];
export const offerTypes=[
 {id:'rotinas',name:'Rotinas periódicas'},
 {id:'suporte',name:'Suporte individualizado'},
 {id:'servicos',name:'Serviços compartilhados'},
 {id:'oportunidades',name:'Oportunidades'},
 {id:'conteudos',name:'Acesso a conteúdos'}
];
export type Offer={id:string;area:string;type:string;name:string;description:string;slide?:string;planned?:boolean;status?:string;frequency?:string;audience?:string;responsible?:string;source?:string};
const rows:([string,string,string,string,string,boolean?]|null)[]=[
 ['coinvest','rotinas','Fórum de Captação','Troca entre os times de captação sobre desafios e oportunidades de mobilização de recursos.','180'],
 ['cdp','rotinas','Comunidade de Monitoramento e Avaliação','Comunidade de troca de experiências e práticas de monitoramento e avaliação, com participação do ecossistema ampliado.','180'],
 ['equidade','rotinas','Fórum de Equidade','Espaço de troca e acompanhamento das pautas de equidade racial entre as organizações.','180'],
 ['financas','rotinas','Fórum de Integridade','Trocas sobre integridade e compliance com os compliance officers das organizações associadas.','180'],
 ['tech','rotinas','Fórum de Tech','Troca entre os times de tecnologia sobre inovação e desenvolvimento de capacidades.','180'],
 ['marca','rotinas','Fórum de Comunicação','Encontros dos times de comunicação para compartilhar desafios, experiências e referências.','180'],
 ['mobilizacao','rotinas','Fórum de RelGov','Troca com profissionais de advocacy e relações governamentais das organizações do núcleo e híbridas de Educação.','180'],
 ['coinvest','suporte','Rotinas 1:1 de captação','Acompanhamento individual dos times, apoio à captação internacional e curadoria de conexões estratégicas.','216'],
 ['equidade','suporte','Rotinas 1:1 de equidade racial','Acompanhamento das agendas de equidade racial com lideranças das organizações.','216'],
 ['gente','suporte','Vagas Ecossistema','Compartilhamento de vagas, recomendações e indicações para as organizações.','216'],
 ['financas','suporte','Apoio em políticas e compliance','Apoio à implementação de políticas obrigatórias e à revisão de políticas opcionais.','216'],
 ['tech','suporte','Apoio em tecnologia e inovação','Apoio pontual ao desenvolvimento da capacidade de inovação das organizações.','216'],
 ['marca','suporte','Apoio em comunicação e reputação','Apoio pontual em crises de reputação e alinhamento de eventos, campanhas e marca.','216'],
 ['mobilizacao','suporte','Apoio à incidência conjunta','Apoio pontual à atuação conjunta em pautas prioritárias de Educação e Lideranças.','216'],
 ['cdp','suporte','Apoio em monitoramento e avaliação','Apoio pontual às demandas de monitoramento e avaliação das organizações.','216'],
 ['gente','servicos','Plano de Saúde','Negociação e revisão centralizada do plano de saúde.','237'],
 ['tech','servicos','Plataforma Tech','Apoio em Pessoas, Infraestrutura e Dados, Formação e Cultura, Produto e Inteligência Artificial.','237'],
 ['marca','servicos','Fornecedores','Compartilhamento de fornecedores para crises e projetos de comunicação.','237'],
 ['mobilizacao','servicos','Monitoramento de Eleições','Compartilhamento de materiais e informações produzidos pela consultoria da Fundação Lemann.','237'],
 ['coinvest','oportunidades','Apoio semente','Apoio a projetos de fortalecimento institucional voltados à captação de recursos.','257'],
 ['equidade','oportunidades','Edital de Fortalecimento em Equidade Racial','Iniciativa voltada à equidade racial em políticas, gestão e práticas de sala de aula.','257'],
 ['equidade','oportunidades','Imersão com CEOs','Espaço de sensibilização, letramento racial e construção de responsabilidade compartilhada.','257'],
 ['coinvest','oportunidades','Imersão temática em captação','Proposta de imersão sobre captação de recursos e parcerias, a confirmar no material de referência.','257',true],
 null, // Mantém o ID das ofertas seguintes após a retirada da oferta 24.
 ['coinvest','conteudos','CoInvest News','Curadoria de notícias, oportunidades e tendências da filantropia.','281'],
 ['coinvest','conteudos','Hub CoInvest','Repositório de referências, fornecedores e materiais de apoio.','281'],
 ['cdp','conteudos','Políticas Institucionais de M&A','Referências para fortalecer o monitoramento e a avaliação nas organizações.','281'],
 ['marca','conteudos','Newsletter do Ecossistema','Compartilhamento de informações das Organizações Core.','281'],
 ['mobilizacao','conteudos','Produtos temáticos','Materiais de acompanhamento e incidência em políticas públicas.','281']
];
const baseOffers:Offer[]=rows.flatMap((row,i)=>{if(!row)return[];const [area,type,name,description,slide,planned]=row;return[{id:`oferta-${i+1}`,area,type,name,description,slide:`g3c975735ede_0_${slide}`,...(planned?{planned:true}:{})}];});
export const offers:Offer[]=[...baseOffers.map(o=>{const record=mappedOffers.find(m=>m.id===o.id);return record?{...o,...record,type:o.type}:o;}),...mappedOffers.filter(m=>!baseOffers.some(o=>o.id===m.id))];
export const contacts: {area:string;name:string;email:string;topic:string;role?:string}[]=[
 ...additionalContacts,
 {area:'equidade',name:'Jessica Vaitanan',email:'jessicavaitanan@fundacaolemann.org.br',topic:'Demandas gerais de equidade racial'},
 {area:'equidade',name:'Carolina Leal',email:'carolinaleal@fundacaolemann.org.br',topic:'Edital de Equidade Racial'},
 {area:'financas',name:'Classius',email:'classiusmarques@fundacaolemann.org.br',topic:'Finanças e Controle'},
 {area:'financas',name:'Natália Gomes',email:'natalia@fundacaolemann.org.br',topic:'Integridade e Jurídico'},
 {area:'financas',name:'Natalia Medrado',email:'nataliamedrado@fundacaolemann.org.br',topic:'Auditoria e Contabilidade'},
 {area:'financas',name:'Kelly Ferreira',email:'kellyferreira@fundacaolemann.org.br',topic:'Banco, contas a pagar e a receber'}
];
export function filterOffers({query='',area='',type=''}:{query?:string;area?:string;type?:string}){
 const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const q=normalize(query.trim());
 return offers.filter(o=>(!area||o.area===area)&&(!type||o.type===type)&&(!q||normalize(`${o.name} ${o.description} ${areas.find(a=>a.id===o.area)?.name} ${offerTypes.find(t=>t.id===o.type)?.name}`).includes(q)));
}
