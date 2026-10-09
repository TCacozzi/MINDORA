import { redirect } from "next/navigation";
import { requireUser, homePath } from "@/lib/authz";

export default async function PosLoginPage() {
  await requireUser();
  redirect(homePath());
}
