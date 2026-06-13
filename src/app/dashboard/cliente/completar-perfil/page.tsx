import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CompletarPerfilClienteForm from "./CompletarPerfilClienteForm";

export const dynamic = "force-dynamic";

export default async function CompletarPerfilClientePage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
  if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) redirect("/admin");

  return <CompletarPerfilClienteForm />;
}
