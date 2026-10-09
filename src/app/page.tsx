import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homePath } from "@/lib/authz";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect(homePath());
  }
  redirect("/login");
}
