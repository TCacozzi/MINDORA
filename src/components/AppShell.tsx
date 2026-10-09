import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/auth";
import type { Role } from "@/generated/prisma";

const SELF_NAV = [
  { href: "/eu", label: "Minha jornada" },
  { href: "/eu/questionario", label: "Questionário" },
  { href: "/eu/relatorio", label: "Meu relatório" },
  { href: "/eu/360", label: "Feedback 360°" },
  { href: "/eu/pdi", label: "Meu PDI" },
];

const EXTRA_NAV_BY_ROLE: Record<Role, { href: string; label: string }[]> = {
  PROFISSIONAL: [],
  GESTOR: [{ href: "/gestor", label: "Minha equipe" }],
  ADMIN: [{ href: "/admin", label: "Organização" }],
};

export function AppShell({
  role,
  userName,
  children,
}: {
  role: Role;
  userName: string;
  children: React.ReactNode;
}) {
  const nav = [...SELF_NAV, ...EXTRA_NAV_BY_ROLE[role]];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/eu" className="flex items-center gap-2">
              <Image src="/mindora-icon.png" alt="" width={28} height={22} priority />
              <span className="text-sm font-semibold tracking-tight text-mindora-primary">
                MINDORA
              </span>
            </Link>
            <nav className="flex gap-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-slate-600 hover:text-mindora-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{userName}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-slate-500 hover:text-mindora-secondary"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
