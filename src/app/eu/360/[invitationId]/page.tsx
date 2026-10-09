import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getOrCreateInvitationSession } from "@/lib/feedback-actions";
import { getSessionWithQuestions } from "@/lib/sessions";
import { QuestionnaireForm } from "@/components/QuestionnaireForm";

export default async function ResponderConvitePage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  const user = await requireUser();

  const invitation = await prisma.feedbackInvitation.findUnique({
    where: { id: invitationId },
    include: { cycle: { include: { subject: true } } },
  });
  if (!invitation || invitation.evaluatorUserId !== user.id) notFound();

  if (invitation.status === "COMPLETED") {
    redirect("/eu/360");
  }

  const sessionId = await getOrCreateInvitationSession(invitationId);
  const full = await getSessionWithQuestions(sessionId);

  const isSelf = invitation.relationship === "SELF";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {isSelf ? "Minha autoavaliação" : `Avaliação sobre ${invitation.cycle.subject.name}`}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Considere apenas comportamentos que você efetivamente observou nos últimos meses.
        </p>
      </div>

      <QuestionnaireForm
        sessionId={full.id}
        scaleType={full.questionnaire.scaleType}
        dimensions={full.questionnaire.dimensions.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          questions: d.questions.map((q) => ({
            id: q.id,
            text: q.text,
            allowNotObserved: q.allowNotObserved,
          })),
        }))}
        existingAnswers={full.answers.map((a) => ({
          questionId: a.questionId,
          value: a.value,
          notObserved: a.notObserved,
        }))}
        redirectTo="/eu/360"
        completedAlready={false}
      />
    </div>
  );
}
