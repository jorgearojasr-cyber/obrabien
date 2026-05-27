import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  // auth() reads from the middleware JWT — no Clerk API call needed
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const params = await searchParams;
  const roleParam = Array.isArray(params.role) ? params.role[0] : params.role;

  // Try to read existing role from publicMetadata
  let role: string | undefined;
  try {
    const user = await currentUser();
    role = user?.publicMetadata?.role as string | undefined;
  } catch {
    // currentUser() failed — fall back to URL param
    role = roleParam;
  }

  // First sign-up: persist role to publicMetadata so future logins work
  if (!role && (roleParam === "maestro" || roleParam === "cliente")) {
    try {
      const clerk = await clerkClient();
      await clerk.users.updateUser(userId, {
        publicMetadata: { role: roleParam },
      });
    } catch {
      // Write failed — still redirect using the URL param
    }
    role = roleParam;
  }

  if (role === "maestro") redirect("/dashboard/maestro");
  if (role === "cliente") redirect("/dashboard/cliente");

  // No role determined — let user pick
  redirect("/onboarding");
}
