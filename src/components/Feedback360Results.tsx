import type { getAggregatedCycleResults } from "@/lib/feedback-aggregation";

export function Feedback360Results({
  result,
}: {
  result: Awaited<ReturnType<typeof getAggregatedCycleResults>>;
}) {
  const { cycle, enoughEvaluators, evaluatorsCompleted, minEvaluators, dimensions } = result;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">{cycle.title}</h2>
        <p className="text-sm text-slate-500">
          {cycle.status === "OPEN" ? "Ciclo aberto" : "Ciclo encerrado"} ·{" "}
          {evaluatorsCompleted} de {minEvaluators} avaliadores mínimos responderam
        </p>
      </div>

      {!enoughEvaluators && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ainda não há avaliadores suficientes para exibir a média agregada mantendo o
          anonimato ({evaluatorsCompleted}/{minEvaluators}). Os resultados de terceiros ficam
          ocultos até o mínimo ser atingido.
        </p>
      )}

      <div className="space-y-3">
        {dimensions.map((d) => (
          <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">{d.name}</h3>
            {d.description && <p className="text-xs text-slate-500">{d.description}</p>}

            <div className="mt-3 space-y-2 text-sm">
              <ScoreBar label="Autoavaliação" value={d.selfAverage} />
              <ScoreBar
                label="Média de terceiros"
                value={enoughEvaluators ? d.othersAverage : null}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{value != null ? value.toFixed(2) : "—"}</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-slate-900"
          style={{ width: value != null ? `${((value - 1) / 4) * 100}%` : "0%" }}
        />
      </div>
    </div>
  );
}
