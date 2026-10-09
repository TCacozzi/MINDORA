import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function GestorPage() {
  const manager = await requireUser();

  const reports = await prisma.user.findMany({
    where: { managerId: manager.id },
    orderBy: { name: "asc" },
    include: {
      responseSessions: {
        where: { questionnaire: { key: "ipip50-bigfive-ptbr-v1" }, status: "COMPLETED" },
        take: 1,
      },
      feedbackCyclesAsSubject: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { invitations: true },
      },
      pdis: { where: { status: "ACTIVE" }, include: { objectives: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Minha equipe</h1>
        <p className="mt-1 text-sm text-slate-500">
          Acompanhamento de desenvolvimento dos seus liderados diretos — MINDORA Leader.
        </p>
      </div>

      {reports.length === 0 && (
        <p className="text-sm text-slate-600">Você ainda não tem liderados diretos cadastrados.</p>
      )}

      <div className="space-y-4">
        {reports.map((r) => {
          const cycle = r.feedbackCyclesAsSubject[0];
          const completedEvaluators = cycle?.invitations.filter(
            (i) => i.status === "COMPLETED" && i.relationship !== "SELF"
          ).length;

          return (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{r.name}</h2>
                  <p className="text-sm text-slate-500">{r.email}</p>
                </div>
                <Link
                  href={`/gestor/${r.id}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400"
                >
                  Ver detalhes
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <p>
                  Big Five:{" "}
                  <span className="font-medium text-slate-900">
                    {r.responseSessions.length > 0 ? "Concluído" : "Pendente"}
                  </span>
                </p>
                <p>
                  Ciclo 360°:{" "}
                  <span className="font-medium text-slate-900">
                    {cycle
                      ? `${cycle.status === "OPEN" ? "Aberto" : "Encerrado"} (${completedEvaluators}/${cycle.minEvaluators})`
                      : "Nenhum"}
                  </span>
                </p>
                <p>
                  PDI ativo:{" "}
                  <span className="font-medium text-slate-900">
                    {r.pdis[0] ? `${r.pdis[0].objectives.length} objetivo(s)` : "Nenhum"}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
