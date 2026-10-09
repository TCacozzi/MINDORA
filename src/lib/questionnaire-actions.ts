"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { computeAndStoreScoring } from "@/lib/scoring";

export async function saveAnswer(
  sessionId: string,
  questionId: string,
  value: number | null,
  notObserved: boolean
) {
  const user = await requireUser();
  const session = await prisma.responseSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== user.id) {
    throw new Error("Sessão inválida.");
  }
  if (session.status === "COMPLETED") {
    throw new Error("Esta avaliação já foi concluída.");
  }

  await prisma.answer.upsert({
    where: { sessionId_questionId: { sessionId, questionId } },
    update: { value, notObserved },
    create: { sessionId, questionId, value, notObserved },
  });

  revalidatePath("/eu/questionario");
  revalidatePath("/eu/360");
}

export async function completeSession(sessionId: string) {
  const user = await requireUser();
  const session = await prisma.responseSession.findUnique({
    where: { id: sessionId },
    include: { questionnaire: { include: { questions: true } }, answers: true },
  });
  if (!session || session.userId !== user.id) {
    throw new Error("Sessão inválida.");
  }

  const answeredIds = new Set(
    session.answers.filter((a) => a.notObserved || a.value != null).map((a) => a.questionId)
  );
  const missing = session.questionnaire.questions.filter((q) => !answeredIds.has(q.id));
  if (missing.length > 0) {
    throw new Error(
      `Ainda há ${missing.length} pergunta(s) sem resposta. Responda todas antes de concluir.`
    );
  }

  await prisma.responseSession.update({
    where: { id: sessionId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  await computeAndStoreScoring(sessionId);

  // Se esta sessão é a resposta de um avaliador em um ciclo de 360°,
  // marca o convite como concluído.
  const invitation = await prisma.feedbackInvitation.findUnique({
    where: { responseSessionId: sessionId },
  });
  if (invitation) {
    await prisma.feedbackInvitation.update({
      where: { id: invitation.id },
      data: { status: "COMPLETED", respondedAt: new Date() },
    });
  }

  revalidatePath("/eu");
  revalidatePath("/eu/360");
  revalidatePath("/gestor");
}
