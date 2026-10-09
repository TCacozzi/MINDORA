// Itens ilustrativos de feedback 360° sobre comportamentos observáveis.
// Escala de frequência (1 = Nunca .. 5 = Sempre) com opção "não observei".
// Itens de exemplo, não validados psicometricamente — ver seção 7 do
// documento de concepção. Mesmo texto é usado para autoavaliação e
// avaliação por terceiros (gestor, pares, liderados).

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

export const feedback360Dimensions: SeedDimension[] = [
  {
    key: "comunicacao",
    name: "Comunicação",
    description: "Clareza, transparência e qualidade da escuta nas interações.",
    order: 1,
    questions: [
      { text: "Compartilha informações relevantes com as pessoas envolvidas em tempo adequado.", reverseScored: false },
      { text: "Comunica-se de forma clara e objetiva.", reverseScored: false },
      { text: "Ouve atentamente antes de responder.", reverseScored: false },
      { text: "Dá feedback de forma construtiva.", reverseScored: false },
    ],
  },
  {
    key: "colaboracao",
    name: "Colaboração",
    description: "Disposição para cooperar, reconhecer contribuições e lidar com conflitos.",
    order: 2,
    questions: [
      { text: "Colabora com outras áreas ou equipes quando necessário.", reverseScored: false },
      { text: "Reconhece as contribuições dos colegas.", reverseScored: false },
      { text: "Busca resolver conflitos de forma construtiva.", reverseScored: false },
      { text: "Compartilha o crédito pelos resultados do time.", reverseScored: false },
    ],
  },
  {
    key: "planejamento_execucao",
    name: "Planejamento e Execução",
    description: "Organização do trabalho, cumprimento de prazos e qualidade das entregas.",
    order: 3,
    questions: [
      { text: "Planeja suas atividades antes de executá-las.", reverseScored: false },
      { text: "Cumpre os prazos combinados.", reverseScored: false },
      { text: "Prioriza tarefas de acordo com urgência e importância.", reverseScored: false },
      { text: "Entrega resultados com qualidade consistente.", reverseScored: false },
    ],
  },
  {
    key: "lideranca_delegacao",
    name: "Liderança e Delegação",
    description: "Clareza ao delegar, autonomia concedida e reconhecimento da equipe.",
    order: 4,
    questions: [
      { text: "Define expectativas claras ao delegar atividades.", reverseScored: false },
      { text: "Oferece autonomia adequada às pessoas da equipe.", reverseScored: false },
      { text: "Acompanha o progresso das entregas sem microgerenciar.", reverseScored: false },
      { text: "Reconhece publicamente o bom desempenho da equipe.", reverseScored: false },
    ],
  },
  {
    key: "adaptabilidade",
    name: "Adaptabilidade",
    description: "Flexibilidade diante de mudanças, pressão e aprendizado contínuo.",
    order: 5,
    questions: [
      { text: "Adapta-se bem a mudanças de prioridade.", reverseScored: false },
      { text: "Mantém a calma em situações de pressão.", reverseScored: false },
      { text: "Busca aprender com os próprios erros.", reverseScored: false },
      { text: "Está aberto(a) a novas formas de realizar o trabalho.", reverseScored: false },
    ],
  },
];
