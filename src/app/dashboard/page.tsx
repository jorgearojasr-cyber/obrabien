import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function isMaestroProfileComplete(metadata: Record<string, unknown>): boolean {
  const profile = metadata.profile as Record<string, unknown> | undefined;
  return !!(
    profile?.nombre &&
    profile?.rut &&
    profile?.telefono &&
    Array.isArray(profile?.especialidades) && (profile.especialidades as unknown[]).length > 0
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const params = await searchParams;
  const roleParam = Array.isArray(params.role) ? params.role[0] : params.role;

  let role: string | undefined;
  let metadata: Record<string, unknown> = {};

  try {
    const user = await currentUser();
    metadata = (user?.publicMetadata ?? {}) as Record<string, unknown>;
    role = metadata.role as string | undefined;
  } catch {
    role = roleParam;
  }

  // First sign-up: persist role to publicMetadata so future logins work
  if (!role && (roleParam === "maestro" || roleParam === "cliente")) {
    try {
      const clerk = await clerkClient();
      await clerk.users.updateUser(userId, {
        publicMetadata: { ...metadata, role: roleParam },
      });
    } catch {
      // continue with URL param role
    }
    role = roleParam;
  }

  if (role === "maestro") {
    redirect(isMaestroProfileComplete(metadata)
      ? "/dashboard/maestro"
      : "/dashboard/maestro/completar-perfil");
  }
  if (role === "cliente") redirect("/dashboard/cliente");

  redirect("/onboarding");
}
