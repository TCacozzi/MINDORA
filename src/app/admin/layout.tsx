import { requireRole } from "@/lib/authz";
import { AppShell } from "@/components/AppShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["ADMIN"]);

  return (
    <AppShell role={user.role} userName={user.name ?? user.email ?? ""}>
      {children}
    </AppShell>
  );
}
