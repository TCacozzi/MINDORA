import { notFound } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { createFeedbackCycleFromForm } from "@/lib/feedback-actions";

export default async function NovoCiclo360Page({
  searchParams,
}: {
  searchParams: Promise<{ subjectUserId?: string }>;
}) {
  const { subjectUserId } = await searchParams;
  const manager = await requireUser();

  if (!subjectUserId) notFound();
  const subject = await prisma.user.findUnique({ where: { id: subjectUserId } });
  if (!subject) notFound();
  if (manager.role === "GESTOR" && subject.managerId !== manager.id) notFound();

  const candidateEvaluators = await prisma.user.findMany({
    where: { organizationId: subject.organizationId, id: { not: subject.id } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Novo ciclo de feedback 360° para {subject.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Uma autoavaliação é incluída automaticamente. Selecione quem mais participará como
          avaliador e o tipo de relação com a pessoa avaliada.
        </p>
      </div>

      <form action={createFeedbackCycleFromForm} className="space-y-6">
        <input type="hidden" name="subjectUserId" value={subject.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Título do ciclo</label>
            <input
              name="title"
              required
              defaultValue={`Feedback 360° — ${subject.name} — ${new Date().getFullYear()}`}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mínimo de avaliadores para liberar a média agregada
            </label>
            <input
              name="minEvaluators"
              type="number"
              min={2}
              defaultValue={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Avaliadores</h2>
          <div className="mt-3 space-y-2">
            {candidateEvaluators.map((u) => {
              const suggested = u.id === subject.managerId ? "MANAGER" : "PEER";
              const preChecked = u.id === subject.managerId;
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name={`include_${u.id}`}
                      defaultChecked={preChecked}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {u.name} <span className="text-xs text-slate-400">({u.email})</span>
                  </label>
                  <select
                    name={`relationship_${u.id}`}
                    defaultValue={suggested}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                  >
                    <option value="MANAGER">Gestor</option>
                    <option value="PEER">Par</option>
                    <option value="DIRECT_REPORT">Liderado</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Abrir ciclo
        </button>
      </form>
    </div>
  );
}
