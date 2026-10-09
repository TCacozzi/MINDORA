"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import type { Role } from "@/generated/prisma";

export async function createUser(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "PROFISSIONAL") as Role;
  const managerIdRaw = String(formData.get("managerId") ?? "");

  if (!name || !email || password.length < 8) {
    throw new Error("Preencha nome, e-mail e uma senha com ao menos 8 caracteres.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      organizationId: admin.organizationId,
      name,
      email,
      passwordHash,
      role,
      managerId: managerIdRaw || null,
    },
  });

  revalidatePath("/admin");
}
