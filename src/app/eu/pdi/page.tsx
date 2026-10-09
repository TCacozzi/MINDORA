import { requireUser } from "@/lib/authz";
import { PdiBoard } from "@/components/PdiBoard";

export default async function MeuPdiPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Meu Plano de Desenvolvimento</h1>
        <p className="mt-1 text-sm text-slate-500">
          Objetivos, ações, responsáveis e prazos acordados com seu gestor.
        </p>
      </div>
      <PdiBoard userId={user.id} />
    </div>
  );
}
