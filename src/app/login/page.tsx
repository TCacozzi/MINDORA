import { AuthError } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

async function authenticate(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/pos-login",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-mindora-lilac-light via-background to-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Image
          src="/mindora-logo.png"
          alt="MINDORA — People Intelligence & Development"
          width={1214}
          height={710}
          className="mx-auto h-auto w-56"
          priority
        />

        <form action={authenticate} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="voce@empresa.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              E-mail ou senha inválidos.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg mindora-btn-primary px-3 py-2 text-sm font-medium"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-medium text-slate-600">Acesso demo</p>
          <p>admin@demo.mindora · gestor@demo.mindora · joao@demo.mindora</p>
          <p>senha: mindora123</p>
        </div>
      </div>
    </main>
  );
}
