import { prisma } from "@/lib/prisma";
import { createPdi, addObjective, addAction, toggleActionStatus } from "@/lib/pdi-actions";

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Não iniciado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
};

export async function PdiBoard({ userId }: { userId: string }) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { manager: true },
  });

  const pdi = await prisma.pDI.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      objectives: {
        orderBy: { createdAt: "asc" },
        include: { actions: { orderBy: { createdAt: "asc" }, include: { owner: true } } },
      },
    },
  });

  if (!pdi) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">Nenhum PDI ativo para {user.name}.</p>
        <form action={createPdi} className="mt-4 flex gap-2">
          <input type="hidden" name="userId" value={userId} />
          <input
            name="title"
            required
            placeholder="Título do PDI (ex: PDI 2026)"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Criar PDI
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">{pdi.title}</h2>
        <p className="text-sm text-slate-500">Plano de Desenvolvimento Individual de {user.name}</p>
      </div>

      {pdi.objectives.map((objective) => (
        <div key={objective.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">{objective.description}</p>
              {objective.targetDate && (
                <p className="text-xs text-slate-500">
                  Meta: {objective.targetDate.toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {STATUS_LABEL[objective.status]}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {objective.actions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm text-slate-800">{action.description}</p>
                  <p className="text-xs text-slate-500">
                    Responsável: {action.owner.name}
                    {action.dueDate ? ` · Prazo: ${action.dueDate.toLocaleDateString("pt-BR")}` : ""}
                  </p>
                </div>
                <form action={toggleActionStatus}>
                  <input type="hidden" name="actionId" value={action.id} />
                  <input type="hidden" name="userId" value={userId} />
                  <input
                    type="hidden"
                    name="nextStatus"
                    value={action.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED"}
                  />
                  <button
                    type="submit"
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      action.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "border border-slate-300 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {action.status === "COMPLETED" ? "Concluída ✓" : "Marcar concluída"}
                  </button>
                </form>
              </div>
            ))}
          </div>

          <form action={addAction} className="mt-3 flex flex-wrap items-end gap-2">
            <input type="hidden" name="objectiveId" value={objective.id} />
            <input type="hidden" name="userId" value={userId} />
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-slate-500">Nova ação</label>
              <input
                name="description"
                required
                placeholder="Descreva a ação"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500">Responsável</label>
              <select
                name="ownerUserId"
                defaultValue={userId}
                className="mt-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value={userId}>{user.name}</option>
                {user.manager && (
                  <option value={user.manager.id}>{user.manager.name} (gestor)</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500">Prazo</label>
              <input
                type="date"
                name="dueDate"
                className="mt-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400"
            >
              Adicionar
            </button>
          </form>
        </div>
      ))}

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
        <form action={addObjective} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="pdiId" value={pdi.id} />
          <input type="hidden" name="userId" value={userId} />
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs text-slate-500">Novo objetivo</label>
            <input
              name="description"
              required
              placeholder="Ex: Desenvolver habilidade de delegação"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">Meta</label>
            <input
              type="date"
              name="targetDate"
              className="mt-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Adicionar objetivo
          </button>
        </form>
      </div>
    </div>
  );
}
