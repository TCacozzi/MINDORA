"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/authz";
import type { EvaluatorRelationship } from "@/generated/prisma";

export async function createFeedbackCycle(input: {
  subjectUserId: string;
  title: string;
  minEvaluators: number;
  evaluators: { userId: string; relationship: EvaluatorRelationship }[];
}) {
  const manager = await requireRole(["GESTOR", "ADMIN"]);

  const subject = await prisma.user.findUnique({ where: { id: input.subjectUserId } });
  if (!subject || subject.organizationId !== manager.organizationId) {
    throw new Error("Pessoa avaliada inválida.");
  }
  if (manager.role === "GESTOR" && subject.managerId !== manager.id) {
    throw new Error("Você só pode abrir ciclos de 360° para seus liderados diretos.");
  }

  const evaluatorEntries = new Map<string, EvaluatorRelationship>();
  evaluatorEntries.set(subject.id, "SELF");
  for (const e of input.evaluators) {
    evaluatorEntries.set(e.userId, e.relationship);
  }

  const cycle = await prisma.feedbackCycle.create({
    data: {
      organizationId: subject.organizationId,
      subjectUserId: subject.id,
      questionnaireId: (
        await prisma.questionnaire.findUniqueOrThrow({ where: { key: "feedback360-ptbr-v1" } })
      ).id,
      title: input.title,
      status: "OPEN",
      minEvaluators: input.minEvaluators,
      openedAt: new Date(),
      invitations: {
        create: Array.from(evaluatorEntries.entries()).map(([userId, relationship]) => ({
          evaluatorUserId: userId,
          relationship,
        })),
      },
    },
  });

  revalidatePath("/gestor");
  revalidatePath("/admin");
  return cycle;
}

export async function createFeedbackCycleFromForm(formData: FormData) {
  const subjectUserId = String(formData.get("subjectUserId"));
  const title = String(formData.get("title") ?? "").trim();
  const minEvaluators = Number(formData.get("minEvaluators") ?? 3);

  if (!title) throw new Error("Informe um título para o ciclo.");

  const evaluators: { userId: string; relationship: EvaluatorRelationship }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("include_") && value === "on") {
      const userId = key.replace("include_", "");
      const relationship = String(
        formData.get(`relationship_${userId}`) ?? "PEER"
      ) as EvaluatorRelationship;
      evaluators.push({ userId, relationship });
    }
  }

  if (evaluators.length === 0) {
    throw new Error("Selecione ao menos um avaliador.");
  }

  await createFeedbackCycle({ subjectUserId, title, minEvaluators, evaluators });
  redirect(`/gestor/${subjectUserId}`);
}

export async function getOrCreateInvitationSession(invitationId: string) {
  const user = await requireUser();

  const invitation = await prisma.feedbackInvitation.findUnique({
    where: { id: invitationId },
    include: { cycle: true },
  });
  if (!invitation || invitation.evaluatorUserId !== user.id) {
    throw new Error("Convite inválido.");
  }

  if (invitation.responseSessionId) {
    return invitation.responseSessionId;
  }

  const session = await prisma.responseSession.create({
    data: { userId: user.id, questionnaireId: invitation.cycle.questionnaireId },
  });

  await prisma.feedbackInvitation.update({
    where: { id: invitation.id },
    data: { responseSessionId: session.id },
  });

  return session.id;
}
