import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const roleParam = params.role;

  let role = user.publicMetadata?.role as string | undefined;

  // First sign-up: role comes from the query param, promote it to publicMetadata
  if (!role && roleParam && (roleParam === "maestro" || roleParam === "cliente")) {
    const clerk = await clerkClient();
    await clerk.users.updateUser(user.id, {
      publicMetadata: { role: roleParam },
    });
    role = roleParam;
  }

  // Also check unsafeMetadata as fallback (set by SignUp component if supported)
  if (!role) {
    role = user.unsafeMetadata?.role as string | undefined;
  }

  if (role === "maestro") redirect("/dashboard/maestro");
  if (role === "cliente") redirect("/dashboard/cliente");

  // No role yet — let user choose
  redirect("/onboarding");
}
