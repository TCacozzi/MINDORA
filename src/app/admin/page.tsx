import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { createUser } from "@/lib/admin-actions";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  GESTOR: "Gestor",
  PROFISSIONAL: "Profissional",
};

const MIN_N_FOR_INSIGHTS = 3;

export default async function AdminPage() {
  const admin = await requireUser();

  const users = await prisma.user.findMany({
    where: { organizationId: admin.organizationId },
    orderBy: { name: "asc" },
    include: { manager: true },
  });

  const completedBigFive = await prisma.responseSession.findMany({
    where: {
      questionnaire: { key: "ipip50-bigfive-ptbr-v1" },
      status: "COMPLETED",
      user: { organizationId: admin.organizationId },
    },
    include: { scoringResult: { include: { dimensionScores: { include: { dimension: true } } } } },
  });

  const byDimension = new Map<string, { name: string; sum: number; count: number }>();
  for (const session of completedBigFive) {
    for (const s of session.scoringResult?.dimensionScores ?? []) {
      const entry = byDimension.get(s.dimensionId) ?? {
        name: s.dimension.name,
        sum: 0,
        count: 0,
      };
      entry.sum += s.rawMean;
      entry.count += 1;
      byDimension.set(s.dimensionId, entry);
    }
  }

  const insightsAvailable = completedBigFive.length >= MIN_N_FOR_INSIGHTS;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Organização</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visão administrativa — MINDORA Insights e gestão de usuários.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Indicadores agregados de personalidade
        </h2>
        {!insightsAvailable ? (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Ainda há poucos resultados concluídos ({completedBigFive.length}) para exibir
            médias agregadas preservando a privacidade individual (mínimo de{" "}
            {MIN_N_FOR_INSIGHTS}).
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from(byDimension.values()).map((d) => (
              <div key={d.name} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">{d.name}</p>
                <p className="text-xs text-slate-500">
                  Média da organização: {(d.sum / d.count).toFixed(2)} de 5 ({d.count}{" "}
                  pessoas)
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Usuários</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">E-mail</th>
                <th className="px-4 py-2">Papel</th>
                <th className="px-4 py-2">Gestor</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-800">{u.name}</td>
                  <td className="px-4 py-2 text-slate-500">{u.email}</td>
                  <td className="px-4 py-2 text-slate-500">{ROLE_LABEL[u.role]}</td>
                  <td className="px-4 py-2 text-slate-500">{u.manager?.name ?? "—"}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/gestor/${u.id}`} className="text-slate-700 underline">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Criar usuário</h2>
        <form
          action={createUser}
          className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
        >
          <div>
            <label className="block text-xs text-slate-500">Nome</label>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">E-mail</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">Senha provisória</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">Papel</label>
            <select
              name="role"
              defaultValue="PROFISSIONAL"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="PROFISSIONAL">Profissional</option>
              <option value="GESTOR">Gestor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-500">Gestor direto (opcional)</label>
            <select
              name="managerId"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Nenhum</option>
              {users
                .filter((u) => u.role === "GESTOR" || u.role === "ADMIN")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg mindora-btn-primary px-4 py-2 text-sm font-medium"
            >
              Criar usuário
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
