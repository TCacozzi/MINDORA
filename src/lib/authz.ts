import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export function homePath(): string {
  // Todos os papéis têm a jornada individual (MINDORA Self) como ponto de
  // partida; gestores e admins acessam MINDORA Leader/Insights pelo menu.
  return "/eu";
}
