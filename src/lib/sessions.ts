import { prisma } from "@/lib/prisma";

export async function getOrCreateSession(userId: string, questionnaireKey: string) {
  const questionnaire = await prisma.questionnaire.findUniqueOrThrow({
    where: { key: questionnaireKey },
  });

  const existing = await prisma.responseSession.findFirst({
    where: { userId, questionnaireId: questionnaire.id },
    orderBy: { startedAt: "desc" },
  });

  if (existing) return existing;

  return prisma.responseSession.create({
    data: { userId, questionnaireId: questionnaire.id },
  });
}

export async function getSessionWithQuestions(sessionId: string) {
  return prisma.responseSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      questionnaire: {
        include: {
          dimensions: {
            orderBy: { order: "asc" },
            include: { questions: { orderBy: { order: "asc" } } },
          },
        },
      },
      answers: true,
    },
  });
}
