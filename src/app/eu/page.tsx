import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function EuDashboardPage() {
  const user = await requireUser();

  const bigFiveSession = await prisma.responseSession.findFirst({
    where: { userId: user.id, questionnaire: { key: "ipip50-bigfive-ptbr-v1" } },
    include: { answers: true, questionnaire: { include: { questions: true } } },
    orderBy: { startedAt: "desc" },
  });

  const pendingInvitations = await prisma.feedbackInvitation.count({
    where: { evaluatorUserId: user.id, status: "PENDING" },
  });

  const myCycle = await prisma.feedbackCycle.findFirst({
    where: { subjectUserId: user.id },
    orderBy: { createdAt: "desc" },
    include: { invitations: true },
  });

  const activePdi = await prisma.pDI.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    include: { objectives: true },
  });

  const totalQuestions = bigFiveSession?.questionnaire.questions.length ?? 0;
  const answeredQuestions =
    bigFiveSession?.answers.filter((a) => a.value != null || a.notObserved).length ?? 0;
  const bigFiveStatus = !bigFiveSession
    ? "not_started"
    : bigFiveSession.status === "COMPLETED"
      ? "completed"
      : "in_progress";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Olá, {user.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sua jornada de autoconhecimento e desenvolvimento contínuo — MINDORA Self.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-medium text-slate-500">Avaliação de personalidade</h2>
          {bigFiveStatus === "not_started" && (
            <>
              <p className="mt-2 text-sm text-slate-700">
                Você ainda não começou sua avaliação Big Five.
              </p>
              <Link
                href="/eu/questionario"
                className="mt-3 inline-block rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Começar
              </Link>
            </>
          )}
          {bigFiveStatus === "in_progress" && (
            <>
              <p className="mt-2 text-sm text-slate-700">
                {answeredQuestions} de {totalQuestions} perguntas respondidas.
              </p>
              <Link
                href="/eu/questionario"
                className="mt-3 inline-block rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Continuar
              </Link>
            </>
          )}
          {bigFiveStatus === "completed" && (
            <>
              <p className="mt-2 text-sm text-slate-700">Avaliação concluída.</p>
              <Link
                href="/eu/relatorio"
                className="mt-3 inline-block rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Ver meu relatório
              </Link>
            </>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-medium text-slate-500">Feedback 360°</h2>
          <p className="mt-2 text-sm text-slate-700">
            {myCycle
              ? `Seu ciclo atual está ${myCycle.status === "OPEN" ? "aberto" : myCycle.status === "CLOSED" ? "encerrado" : "em preparação"}. ${myCycle.invitations.filter((i) => i.status === "COMPLETED" && i.relationship !== "SELF").length} de ${myCycle.minEvaluators} avaliadores mínimos responderam.`
              : "Nenhum ciclo de feedback 360° foi aberto para você ainda."}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Você tem <strong>{pendingInvitations}</strong> avaliação(ões) pendente(s) sobre colegas.
          </p>
          <Link
            href="/eu/360"
            className="mt-3 inline-block rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400"
          >
            Ver feedback 360°
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:col-span-2">
          <h2 className="text-sm font-medium text-slate-500">Plano de Desenvolvimento Individual</h2>
          <p className="mt-2 text-sm text-slate-700">
            {activePdi
              ? `${activePdi.objectives.length} objetivo(s) em acompanhamento.`
              : "Você ainda não tem um PDI ativo."}
          </p>
          <Link
            href="/eu/pdi"
            className="mt-3 inline-block rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400"
          >
            {activePdi ? "Ver meu PDI" : "Criar meu PDI"}
          </Link>
        </div>
      </div>
    </div>
  );
}
