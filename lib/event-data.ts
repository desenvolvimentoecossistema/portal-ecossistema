export type EcosystemEvent = {
  id: string;
  title: string;
  organization: string;
  type: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  registrationDeadline: string;
  city: string;
  state: string;
  venue: string;
  address: string;
  transport: string;
  accommodation: string;
  meals: string;
  dressCode: string;
  additionalNotes: string;
  contactName: string;
  contactEmail: string;
  maxParticipants: number;
  availableSpots: number;
  createdByUserId?: string;
  creatorEmail?: string;
  isDemo?: boolean;
  dateNote?: string;
};

export const DEMO_EVENTS: EcosystemEvent[] = [
  {
    id: "demo-alfabetizacao",
    title: "Visita de campo: alfabetização em rede",
    organization: "Reúna",
    type: "Visita a território",
    description:
      "Dois dias de acompanhamento a escolas e encontro com equipes municipais para conhecer uma estratégia de alfabetização em regime de colaboração.",
    startDate: "2026-10-22",
    startTime: "08:30",
    endDate: "2026-10-23",
    endTime: "17:30",
    registrationDeadline: "2026-10-02",
    city: "São Luís",
    state: "MA",
    venue: "Secretaria Municipal de Educação e escolas da rede",
    address: "O endereço detalhado será enviado às pessoas confirmadas.",
    transport: "Traslados locais entre hotel, secretaria e escolas incluídos.",
    accommodation: "Hospedagem não incluída; lista de hotéis parceiros após a confirmação.",
    meals: "Almoço e lanches durante a programação incluídos.",
    dressCode: "Roupa confortável e calçado fechado para os deslocamentos.",
    additionalNotes: "",
    contactName: "Equipe de Parcerias",
    contactEmail: "imersoes@exemplo.org",
    maxParticipants: 12,
    availableSpots: 7,
    isDemo: true,
  },
  {
    id: "demo-amazonia",
    title: "Jornada Amazônia: gestão escolar em território",
    organization: "Trajetórias",
    type: "Visita a território",
    description:
      "Vivência com lideranças escolares e comunitárias para compreender soluções de permanência e aprendizagem em comunidades ribeirinhas.",
    startDate: "2026-11-10",
    startTime: "07:00",
    endDate: "2026-11-12",
    endTime: "18:00",
    registrationDeadline: "2026-10-16",
    city: "Santarém",
    state: "PA",
    venue: "Escolas parceiras e base da organização",
    address: "Ponto de saída na região central de Santarém; confirmação por e-mail.",
    transport: "Deslocamentos terrestres e fluviais da programação incluídos.",
    accommodation: "Duas noites em pousada local incluídas, em quartos compartilhados.",
    meals: "Café da manhã, almoço, jantar e água incluídos nos três dias.",
    dressCode: "Calçado antiderrapante, proteção solar e capa de chuva.",
    additionalNotes: "",
    contactName: "Núcleo de Programas",
    contactEmail: "jornada@exemplo.org",
    maxParticipants: 10,
    availableSpots: 4,
    isDemo: true,
  },
  {
    id: "demo-evidencias",
    title: "Encontro de evidências e políticas públicas",
    organization: "Motriz",
    type: "Evento institucional",
    description:
      "Encontro de um dia com pesquisadores, gestores e organizações para discutir o uso de evidências no desenho de políticas educacionais.",
    startDate: "2026-11-27",
    startTime: "09:00",
    endDate: "2026-11-27",
    endTime: "17:30",
    registrationDeadline: "2026-11-13",
    city: "São Paulo",
    state: "SP",
    venue: "Centro de Convenções Aurora",
    address: "Rua Exemplo, 240 — Centro, São Paulo — SP.",
    transport: "Local próximo ao metrô; não haverá traslado dedicado.",
    accommodation: "Não incluída. O evento acontece em um único dia.",
    meals: "Café de boas-vindas, almoço e coffee break incluídos.",
    dressCode: "Casual profissional.",
    additionalNotes: "",
    contactName: "Produção do Encontro",
    contactEmail: "eventos@exemplo.org",
    maxParticipants: 30,
    availableSpots: 18,
    isDemo: true,
  },
];
