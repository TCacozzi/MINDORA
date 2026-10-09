import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getAggregatedCycleResults } from "@/lib/feedback-aggregation";
import { Feedback360Results } from "@/components/Feedback360Results";
import { PdiBoard } from "@/components/PdiBoard";

export default async function LideradoPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const manager = await requireUser();

  const report = await prisma.user.findUnique({ where: { id: userId } });
  if (!report) notFound();
  if (manager.role === "GESTOR" && report.managerId !== manager.id) notFound();

  const latestCycle = await prisma.feedbackCycle.findFirst({
    where: { subjectUserId: userId },
    orderBy: { createdAt: "desc" },
  });

  const aggregated = latestCycle ? await getAggregatedCycleResults(latestCycle.id) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{report.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{report.email}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Os resultados da avaliação de personalidade (Big Five) são privados e não ficam
        visíveis ao gestor, conforme os princípios de proteção de dados sensíveis da
        plataforma. Você tem acesso ao feedback 360° agregado e ao PDI autorizado.
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Feedback 360°</h2>
          <Link
            href={`/gestor/360/novo?subjectUserId=${report.id}`}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Abrir novo ciclo
          </Link>
        </div>
        {aggregated ? (
          <Feedback360Results result={aggregated} />
        ) : (
          <p className="text-sm text-slate-600">Nenhum ciclo de 360° iniciado ainda.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Plano de Desenvolvimento Individual
        </h2>
        <PdiBoard userId={report.id} />
      </section>
    </div>
  );
}
