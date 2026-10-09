import Link from "next/link";
import {
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";

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
        <EmptyState
          brandIcon="equipe"
          title="Nenhum liderado direto"
          description="Quando o administrador cadastrar pessoas com você como gestor, elas aparecem aqui."
        />
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
                  className="rounded-lg mindora-btn-outline px-3 py-1.5 text-sm font-medium"
                >
                  Ver detalhes
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <p className="flex items-center gap-1.5">
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-slate-400" />
                  Big Five:{" "}
                  <Badge variant={r.responseSessions.length > 0 ? "success" : "neutral"}>
                    {r.responseSessions.length > 0 ? "Concluído" : "Pendente"}
                  </Badge>
                </p>
                <p className="flex items-center gap-1.5">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 text-slate-400" />
                  Ciclo 360°:{" "}
                  <Badge variant={cycle ? (cycle.status === "OPEN" ? "info" : "success") : "neutral"}>
                    {cycle
                      ? `${cycle.status === "OPEN" ? "Aberto" : "Encerrado"} (${completedEvaluators}/${cycle.minEvaluators})`
                      : "Nenhum"}
                  </Badge>
                </p>
                <p className="flex items-center gap-1.5">
                  <FlagIcon className="h-4 w-4 text-slate-400" />
                  PDI ativo:{" "}
                  <Badge variant={r.pdis[0] ? "info" : "neutral"}>
                    {r.pdis[0] ? `${r.pdis[0].objectives.length} objetivo(s)` : "Nenhum"}
                  </Badge>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
