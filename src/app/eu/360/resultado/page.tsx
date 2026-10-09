import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getAggregatedCycleResults } from "@/lib/feedback-aggregation";
import { Feedback360Results } from "@/components/Feedback360Results";

export default async function MeuResultado360Page() {
  const user = await requireUser();

  const cycle = await prisma.feedbackCycle.findFirst({
    where: { subjectUserId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!cycle) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Meu resultado 360°</h1>
        <p className="text-sm text-slate-600">
          Nenhum ciclo de feedback 360° foi aberto para você ainda.
        </p>
        <Link href="/eu/360" className="text-sm text-slate-700 underline">
          Voltar
        </Link>
      </div>
    );
  }

  const result = await getAggregatedCycleResults(cycle.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Meu resultado 360°</h1>
      <Feedback360Results result={result} />
    </div>
  );
}
