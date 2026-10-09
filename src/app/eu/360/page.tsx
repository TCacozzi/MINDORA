import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";

const RELATIONSHIP_LABEL: Record<string, string> = {
  SELF: "Autoavaliação",
  MANAGER: "Gestor",
  PEER: "Par",
  DIRECT_REPORT: "Liderado",
  OTHER: "Outro",
};

export default async function Feedback360Page() {
  const user = await requireUser();

  const invitations = await prisma.feedbackInvitation.findMany({
    where: { evaluatorUserId: user.id },
    include: { cycle: { include: { subject: true } } },
    orderBy: { invitedAt: "desc" },
  });

  const myCycle = await prisma.feedbackCycle.findFirst({
    where: { subjectUserId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Feedback 360°</h1>
        <p className="mt-1 text-sm text-slate-500">
          Avalie comportamentos efetivamente observados. Use a opção &quot;não observei&quot;
          quando não tiver contexto suficiente.
        </p>
      </div>

      {myCycle && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-medium text-slate-500">Meu ciclo</h2>
          <p className="mt-1 text-sm text-slate-700">{myCycle.title}</p>
          <Link
            href="/eu/360/resultado"
            className="mt-3 inline-block rounded-lg mindora-btn-outline px-3 py-1.5 text-sm font-medium"
          >
            Ver meu resultado
          </Link>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Avaliações para responder</h2>
        {invitations.length === 0 && (
          <EmptyState
            brandIcon="feedback"
            title="Nenhum convite no momento"
            description="Quando alguém pedir sua avaliação em um ciclo de 360°, os convites aparecem aqui."
          />
        )}
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">
                {inv.cycle.subjectUserId === user.id ? "Você mesmo(a)" : inv.cycle.subject.name}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                {inv.cycle.title} · {RELATIONSHIP_LABEL[inv.relationship]}
                <Badge variant={inv.status === "COMPLETED" ? "success" : "neutral"}>
                  {inv.status === "COMPLETED" ? "Concluída" : "Pendente"}
                </Badge>
              </p>
            </div>
            {inv.status === "PENDING" && (
              <Link
                href={`/eu/360/${inv.id}`}
                className="rounded-lg mindora-btn-primary px-3 py-1.5 text-sm font-medium"
              >
                Responder
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
