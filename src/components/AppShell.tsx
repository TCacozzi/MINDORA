import Image from "next/image";
import Link from "next/link";
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "@/auth";
import type { Role } from "@/generated/prisma";

const SELF_NAV = [
  { href: "/eu", label: "Minha jornada", icon: HomeIcon },
  { href: "/eu/questionario", label: "Questionário", icon: ClipboardDocumentCheckIcon },
  { href: "/eu/relatorio", label: "Meu relatório", icon: ChartBarIcon },
  { href: "/eu/360", label: "Feedback 360°", icon: ChatBubbleLeftRightIcon },
  { href: "/eu/pdi", label: "Meu PDI", icon: FlagIcon },
];

const EXTRA_NAV_BY_ROLE: Record<Role, { href: string; label: string; icon: typeof HomeIcon }[]> = {
  PROFISSIONAL: [],
  GESTOR: [{ href: "/gestor", label: "Minha equipe", icon: UserGroupIcon }],
  ADMIN: [{ href: "/admin", label: "Organização", icon: BuildingOfficeIcon }],
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/eu" className="flex shrink-0 items-center gap-2">
              <Image src="/mindora-icon.png" alt="" width={28} height={22} priority />
              <span className="text-sm font-semibold tracking-tight text-mindora-primary">
                MINDORA
              </span>
            </Link>
            <nav className="flex gap-3 overflow-x-auto">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm text-slate-600 hover:text-mindora-secondary"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-slate-500 md:inline">{userName}</span>
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
