import { prisma } from "@/lib/prisma";

export async function getAggregatedCycleResults(cycleId: string) {
  const cycle = await prisma.feedbackCycle.findUniqueOrThrow({
    where: { id: cycleId },
    include: {
      invitations: {
        include: {
          responseSession: {
            include: {
              scoringResult: { include: { dimensionScores: { include: { dimension: true } } } },
            },
          },
        },
      },
      questionnaire: { include: { dimensions: { orderBy: { order: "asc" } } } },
    },
  });

  const othersCompleted = cycle.invitations.filter(
    (i) => i.relationship !== "SELF" && i.status === "COMPLETED"
  );
  const selfInvitation = cycle.invitations.find(
    (i) => i.relationship === "SELF" && i.status === "COMPLETED"
  );

  // Regra de privacidade (seção 11 do documento): só libera a média agregada
  // de terceiros quando há avaliadores suficientes para preservar anonimato.
  const enoughEvaluators = othersCompleted.length >= cycle.minEvaluators;

  const byDimension = new Map<string, { sum: number; weight: number }>();
  if (enoughEvaluators) {
    for (const inv of othersCompleted) {
      const scores = inv.responseSession?.scoringResult?.dimensionScores ?? [];
      for (const s of scores) {
        const entry = byDimension.get(s.dimensionId) ?? { sum: 0, weight: 0 };
        entry.sum += s.rawMean;
        entry.weight += 1;
        byDimension.set(s.dimensionId, entry);
      }
    }
  }

  const selfScores = new Map<string, number>();
  for (const s of selfInvitation?.responseSession?.scoringResult?.dimensionScores ?? []) {
    selfScores.set(s.dimensionId, s.rawMean);
  }

  const dimensions = cycle.questionnaire.dimensions.map((d) => {
    const agg = byDimension.get(d.id);
    return {
      id: d.id,
      name: d.name,
      description: d.description,
      othersAverage: agg ? agg.sum / agg.weight : null,
      selfAverage: selfScores.get(d.id) ?? null,
    };
  });

  return {
    cycle,
    enoughEvaluators,
    evaluatorsCompleted: othersCompleted.length,
    minEvaluators: cycle.minEvaluators,
    dimensions,
  };
}
