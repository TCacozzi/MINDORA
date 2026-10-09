import { requireRole } from "@/lib/authz";
import { AppShell } from "@/components/AppShell";

export default async function GestorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["GESTOR", "ADMIN"]);

  return (
    <AppShell role={user.role} userName={user.name ?? user.email ?? ""}>
      {children}
    </AppShell>
  );
}
