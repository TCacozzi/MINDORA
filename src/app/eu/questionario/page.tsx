import { redirect } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { getOrCreateSession, getSessionWithQuestions } from "@/lib/sessions";
import { QuestionnaireForm } from "@/components/QuestionnaireForm";

export default async function QuestionarioPage() {
  const user = await requireUser();
  const session = await getOrCreateSession(user.id, "ipip50-bigfive-ptbr-v1");

  if (session.status === "COMPLETED") {
    redirect("/eu/relatorio");
  }

  const full = await getSessionWithQuestions(session.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Avaliação de Personalidade (Big Five)
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Não há respostas certas ou erradas. Responda com base em como você realmente age,
          não em como gostaria de agir. Itens baseados no IPIP (domínio público), adaptação
          ilustrativa ainda não validada psicometricamente.
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
        redirectTo="/eu/relatorio"
        completedAlready={false}
      />
    </div>
  );
}
