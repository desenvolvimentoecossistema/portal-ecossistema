export type TeamMember={name:string;role:string;contactName?:string};
export type FunctionalTeam={slide:string;leadership:TeamMember[];groups:{name:string;members:TeamMember[]}[]};
export const TEAM_SOURCE='https://docs.google.com/presentation/d/1MmKMqu14JEjicIUxa_U7XnhVaPV7m__YtgMzjnKCcKo/edit';
export const functionalTeams:Record<string,FunctionalTeam>={
 coinvest:{slide:'g395d0e0e3a6_1_2366',leadership:[],groups:[
  {name:'Coinvestimento Educação',members:[{name:'Cecilia Zahran',role:'Gerente'},{name:'Fabiana Ferraz',role:'Coordenadora'},{name:'Jorge Carvalho',role:'Estagiário'}]},
  {name:'Coinvestimento Lideranças',members:[{name:'Thais Chao',role:'Gerente'},{name:'Henrique Barbosa',role:'Coordenador'},{name:'Isabelina Meireles',role:'Analista'}]}
 ]},
 cdp:{slide:'g395d0e0e3a6_1_1843',leadership:[{name:'Flávia Schmidt',role:'Diretora de Conhecimento, Dados e Pesquisa'},{name:'Thamires Mirolli',role:'Gerente de Conhecimento, Dados e Pesquisa'}],groups:[
  {name:'CDP em Educação',members:[{name:'Rayana Vasconcellos',role:'Coordenadora'}]},
  {name:'CDP em Lideranças',members:[{name:'Matheus Nunes',role:'Coordenador'}]},
  {name:'Governança e Análise de dados',members:[{name:'Laura Ogando',role:'Coordenadora'}]},
  {name:'Apoio Transversal',members:[{name:'Dayara Moreira',role:'Analista'}]}
 ]},
 equidade:{slide:'g395d0e0e3a6_1_2149',leadership:[{name:'Jessica Vaitanan',role:'Gerente de Equidade Racial'}],groups:[{name:'Equidade Racial',members:[{name:'Carolina Leal',role:'Coordenadora'},{name:'Juliana Vittori',role:'Estagiária'}]}]},
 gente:{slide:'g3cf0cda35d9_0_2',leadership:[{name:'Maria Silvia',role:'Gerente de Gente e Gestão'}],groups:[
  {name:'Gente',members:[{name:'Jaqueline Zacharias',role:'Coordenadora'},{name:'Paula Santana',role:'Analista'}]},
  {name:'Gestão e Administrativo',members:[{name:'Lidiamara Betette',role:'Coordenadora'},{name:'Ana Júlia',role:'Jovem Aprendiz'}]}
 ]},
 financas:{slide:'g395d0e0e3a6_1_2902',leadership:[{name:'Classius Marques',role:'Diretor de Finanças e Controle',contactName:'Classius'}],groups:[{name:'Finanças e Controle',members:[{name:'Natália Gomes',role:'Coordenadora'},{name:'Natalia Medrado',role:'Coordenadora'},{name:'Kelly Ferreira',role:'Coordenadora'},{name:'Ana Beatriz',role:'Jovem Aprendiz'}]}]},
 tech:{slide:'g395d0e0e3a6_1_399',leadership:[{name:'Guilherme Cintra',role:'Diretor de Tecnologia e Inovação'},{name:'Tiago Maluta',role:'Gerente'}],groups:[]},
 marca:{slide:'g395d0e0e3a6_1_1375',leadership:[],groups:[
  {name:'Coordenação',members:[{name:'David Azevedo',role:'Coordenador'}]},
  {name:'Equipe',members:[{name:'Khaila Garcia',role:'Analista'},{name:'Fernanda Gouveia',role:'Analista'},{name:'Pedro Coimbra',role:'Estagiário'}]}
 ]},
 mobilizacao:{slide:'g395d0e0e3a6_1_1356',leadership:[],groups:[
  {name:'Gerência',members:[{name:'Mariana Cropalato',role:'Gerente'},{name:'Leticia Biaggioni',role:'Gerente'}]},
  {name:'Coordenação',members:[{name:'Julia Cintra',role:'Coordenadora'},{name:'André Liboeiro',role:'Coordenador'}]},
  {name:'Estágio',members:[{name:'Lara Isabelle',role:'Estagiária'}]}
 ]}
};
