"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";

async function assertCanAccessUser(targetUserId: string) {
  const viewer = await requireUser();
  if (viewer.id === targetUserId) return viewer;

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target || target.managerId !== viewer.id) {
    throw new Error("Você não tem acesso ao PDI desta pessoa.");
  }
  return viewer;
}

export async function createPdi(formData: FormData) {
  const userId = String(formData.get("userId"));
  const title = String(formData.get("title") ?? "").trim();
  await assertCanAccessUser(userId);
  if (!title) throw new Error("Informe um título para o PDI.");

  await prisma.pDI.create({ data: { userId, title, status: "ACTIVE" } });
  revalidatePath(`/eu/pdi`);
  revalidatePath(`/gestor/${userId}`);
}

export async function addObjective(formData: FormData) {
  const pdiId = String(formData.get("pdiId"));
  const userId = String(formData.get("userId"));
  const description = String(formData.get("description") ?? "").trim();
  const targetDateRaw = formData.get("targetDate");
  await assertCanAccessUser(userId);
  if (!description) throw new Error("Descreva o objetivo.");

  await prisma.objective.create({
    data: {
      pdiId,
      description,
      targetDate: targetDateRaw ? new Date(String(targetDateRaw)) : null,
    },
  });
  revalidatePath(`/eu/pdi`);
  revalidatePath(`/gestor/${userId}`);
}

export async function addAction(formData: FormData) {
  const objectiveId = String(formData.get("objectiveId"));
  const userId = String(formData.get("userId"));
  const description = String(formData.get("description") ?? "").trim();
  const ownerUserId = String(formData.get("ownerUserId") ?? userId);
  const dueDateRaw = formData.get("dueDate");
  await assertCanAccessUser(userId);
  if (!description) throw new Error("Descreva a ação.");

  await prisma.action.create({
    data: {
      objectiveId,
      description,
      ownerUserId,
      dueDate: dueDateRaw ? new Date(String(dueDateRaw)) : null,
    },
  });
  revalidatePath(`/eu/pdi`);
  revalidatePath(`/gestor/${userId}`);
}

export async function toggleActionStatus(formData: FormData) {
  const actionId = String(formData.get("actionId"));
  const userId = String(formData.get("userId"));
  const nextStatus = String(formData.get("nextStatus"));
  await assertCanAccessUser(userId);

  await prisma.action.update({
    where: { id: actionId },
    data: {
      status: nextStatus as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
      completedAt: nextStatus === "COMPLETED" ? new Date() : null,
    },
  });
  revalidatePath(`/eu/pdi`);
  revalidatePath(`/gestor/${userId}`);
}
