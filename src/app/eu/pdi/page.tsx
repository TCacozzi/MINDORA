import Image from "next/image";
import { requireUser } from "@/lib/authz";
import { PdiBoard } from "@/components/PdiBoard";

export default async function MeuPdiPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Meu Plano de Desenvolvimento</h1>
          <p className="mt-1 text-sm text-slate-500">
            Objetivos, ações, responsáveis e prazos acordados com seu gestor.
          </p>
        </div>
        <Image
          src="/illustrations/desenvolvimento_ilustracao.png"
          alt=""
          width={553}
          height={507}
          className="hidden h-24 w-auto shrink-0 sm:block"
        />
      </div>
      <PdiBoard userId={user.id} />
    </div>
  );
}
