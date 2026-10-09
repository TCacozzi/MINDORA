import { prisma } from "@/lib/prisma";

const LIKERT_MIN = 1;
const LIKERT_MAX = 5;

/**
 * Motor de pontuação determinístico: reverte itens marcados como
 * reverseScored, ignora respostas "não observei", e calcula a média
 * por dimensão. Não produz uma pontuação única agregada — cada
 * dimensão é reportada separadamente (ver seção 2 do documento de
 * concepção: "traços são contínuos, não rótulos fixos").
 */
export async function computeAndStoreScoring(sessionId: string) {
  const session = await prisma.responseSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      answers: { include: { question: true } },
    },
  });

  const byDimension = new Map<string, { sum: number; count: number }>();

  for (const answer of session.answers) {
    if (answer.notObserved || answer.value == null) continue;
    const raw = answer.question.reverseScored
      ? LIKERT_MIN + LIKERT_MAX - answer.value
      : answer.value;
    const entry = byDimension.get(answer.question.dimensionId) ?? { sum: 0, count: 0 };
    entry.sum += raw;
    entry.count += 1;
    byDimension.set(answer.question.dimensionId, entry);
  }

  await prisma.scoringResult.deleteMany({ where: { sessionId } });

  return prisma.scoringResult.create({
    data: {
      sessionId,
      dimensionScores: {
        create: Array.from(byDimension.entries()).map(([dimensionId, { sum, count }]) => ({
          dimensionId,
          rawMean: count > 0 ? sum / count : 0,
          itemCount: count,
        })),
      },
    },
    include: { dimensionScores: true },
  });
}

export function scoreLabel(rawMean: number): string {
  if (rawMean >= 4) return "Tendência elevada";
  if (rawMean >= 3) return "Tendência moderada a elevada";
  if (rawMean >= 2) return "Tendência moderada a baixa";
  return "Tendência baixa";
}
