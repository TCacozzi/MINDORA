// Itens do IPIP Big-Five Factor Markers (50 itens, Goldberg, 1992).
// Domínio público — International Personality Item Pool (https://ipip.ori.org/).
// Tradução/adaptação para português do Brasil feita para este projeto;
// adaptação ilustrativa, ainda não submetida a validação psicométrica formal
// (ver seção 7 e seção 12 do documento de concepção da plataforma).

export type SeedQuestion = {
  text: string;
  reverseScored: boolean;
};

export type SeedDimension = {
  key: string;
  name: string;
  description: string;
  order: number;
  questions: SeedQuestion[];
};

export const bigFiveDimensions: SeedDimension[] = [
  {
    key: "extraversion",
    name: "Extroversão",
    description:
      "Tendência a buscar estímulo na companhia de outras pessoas, assertividade e energia em contextos sociais.",
    order: 1,
    questions: [
      { text: "Sou o centro das atenções em festas.", reverseScored: false },
      { text: "Falo pouco.", reverseScored: true },
      { text: "Sinto-me à vontade perto de outras pessoas.", reverseScored: false },
      { text: "Prefiro ficar em segundo plano.", reverseScored: true },
      { text: "Inicio conversas com facilidade.", reverseScored: false },
      { text: "Tenho pouco a dizer.", reverseScored: true },
      { text: "Converso com várias pessoas diferentes em festas.", reverseScored: false },
      { text: "Não gosto de chamar atenção para mim.", reverseScored: true },
      { text: "Não me incomodo em ser o centro das atenções.", reverseScored: false },
      { text: "Fico quieto(a) perto de pessoas que não conheço.", reverseScored: true },
    ],
  },
  {
    key: "emotional_stability",
    name: "Estabilidade Emocional",
    description:
      "Tendência a manter o equilíbrio emocional diante de contratempos, com menor reatividade a estresse e preocupação.",
    order: 2,
    questions: [
      { text: "Fico estressado(a) com facilidade.", reverseScored: true },
      { text: "Estou relaxado(a) na maior parte do tempo.", reverseScored: false },
      { text: "Preocupo-me com as coisas.", reverseScored: true },
      { text: "Raramente me sinto triste.", reverseScored: false },
      { text: "Perturbo-me com facilidade.", reverseScored: true },
      { text: "Fico aborrecido(a) com facilidade.", reverseScored: true },
      { text: "Meu humor muda com frequência.", reverseScored: true },
      { text: "Tenho oscilações de humor frequentes.", reverseScored: true },
      { text: "Fico irritado(a) com facilidade.", reverseScored: true },
      { text: "Frequentemente me sinto triste.", reverseScored: true },
    ],
  },
  {
    key: "agreeableness",
    name: "Amabilidade",
    description:
      "Tendência à cooperação, consideração pelos outros e orientação para relações harmoniosas.",
    order: 3,
    questions: [
      { text: "Tenho pouca consideração pelos outros.", reverseScored: true },
      { text: "Interesso-me por pessoas.", reverseScored: false },
      { text: "Ofendo as pessoas.", reverseScored: true },
      { text: "Compadeço-me dos sentimentos alheios.", reverseScored: false },
      { text: "Não me interesso pelos problemas dos outros.", reverseScored: true },
      { text: "Tenho um coração generoso.", reverseScored: false },
      { text: "Não me interesso realmente pelos outros.", reverseScored: true },
      { text: "Dedico tempo aos outros.", reverseScored: false },
      { text: "Sinto as emoções dos outros.", reverseScored: false },
      { text: "Faço as pessoas se sentirem à vontade.", reverseScored: false },
    ],
  },
  {
    key: "conscientiousness",
    name: "Conscienciosidade",
    description:
      "Tendência à organização, disciplina, atenção a detalhes e cumprimento de compromissos.",
    order: 4,
    questions: [
      { text: "Estou sempre preparado(a).", reverseScored: false },
      { text: "Deixo meus pertences espalhados.", reverseScored: true },
      { text: "Presto atenção aos detalhes.", reverseScored: false },
      { text: "Faço bagunça com as coisas.", reverseScored: true },
      { text: "Realizo minhas tarefas imediatamente.", reverseScored: false },
      { text: "Frequentemente esqueço de guardar as coisas em seu lugar.", reverseScored: true },
      { text: "Gosto de manter as coisas em ordem.", reverseScored: false },
      { text: "Negligencio minhas obrigações.", reverseScored: true },
      { text: "Sigo um planejamento ou agenda.", reverseScored: false },
      { text: "Sou caprichoso(a) e rigoroso(a) no meu trabalho.", reverseScored: false },
    ],
  },
  {
    key: "openness",
    name: "Abertura a Experiências",
    description:
      "Tendência à curiosidade intelectual, imaginação e interesse por ideias novas e abstratas.",
    order: 5,
    questions: [
      { text: "Tenho um vocabulário rico.", reverseScored: false },
      { text: "Tenho dificuldade em entender ideias abstratas.", reverseScored: true },
      { text: "Tenho uma imaginação vívida.", reverseScored: false },
      { text: "Não me interesso por ideias abstratas.", reverseScored: true },
      { text: "Tenho excelentes ideias.", reverseScored: false },
      { text: "Não tenho muita imaginação.", reverseScored: true },
      { text: "Compreendo as coisas rapidamente.", reverseScored: false },
      { text: "Uso palavras difíceis.", reverseScored: false },
      { text: "Dedico tempo a refletir sobre as coisas.", reverseScored: false },
      { text: "Estou cheio(a) de ideias.", reverseScored: false },
    ],
  },
];
