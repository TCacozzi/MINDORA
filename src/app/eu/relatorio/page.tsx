import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { scoreLabel } from "@/lib/scoring";

export default async function RelatorioPage() {
  const user = await requireUser();

  const session = await prisma.responseSession.findFirst({
    where: {
      userId: user.id,
      questionnaire: { key: "ipip50-bigfive-ptbr-v1" },
      status: "COMPLETED",
    },
    orderBy: { completedAt: "desc" },
    include: {
      scoringResult: {
        include: { dimensionScores: { include: { dimension: true } } },
      },
    },
  });

  if (!session?.scoringResult) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Meu relatório</h1>
        <p className="text-sm text-slate-600">
          Você ainda não concluiu a avaliação de personalidade.
        </p>
        <Link
          href="/eu/questionario"
          className="inline-block rounded-lg mindora-btn-primary px-3 py-1.5 text-sm font-medium"
        >
          Responder agora
        </Link>
      </div>
    );
  }

  const scores = [...session.scoringResult.dimensionScores].sort(
    (a, b) => a.dimension.order - b.dimension.order
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Meu relatório de personalidade</h1>
        <p className="mt-1 text-sm text-slate-500">
          Concluído em {session.completedAt?.toLocaleDateString("pt-BR")}.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">Como interpretar este relatório</p>
        <p className="mt-1">
          Os traços de personalidade são contínuos, não rótulos fixos. Este relatório não é um
          diagnóstico psicológico, não prevê desempenho futuro e não deve ser usado isoladamente
          para decisões de contratação, promoção ou desligamento. Os resultados refletem como
          você se descreveu no momento da resposta.
        </p>
      </div>

      <div className="space-y-4">
        {scores.map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-slate-900">{s.dimension.name}</h2>
              <span className="text-xs text-slate-400">
                {s.itemCount} item(ns) considerados
              </span>
            </div>
            {s.dimension.description && (
              <p className="mt-1 text-sm text-slate-500">{s.dimension.description}</p>
            )}
            <div className="mt-3 h-2.5 w-full rounded-full bg-slate-100">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-mindora-secondary to-mindora-violet"
                style={{ width: `${((s.rawMean - 1) / 4) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {scoreLabel(s.rawMean)}{" "}
              <span className="font-normal text-slate-400">
                (média {s.rawMean.toFixed(2)} de 5)
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Próximo passo sugerido</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use estes resultados como ponto de partida para uma conversa de desenvolvimento com
          seu gestor e para construir ou atualizar seu Plano de Desenvolvimento Individual.
        </p>
        <Link
          href="/eu/pdi"
          className="mt-3 inline-block rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400"
        >
          Ir para meu PDI
        </Link>
      </div>
    </div>
  );
}
