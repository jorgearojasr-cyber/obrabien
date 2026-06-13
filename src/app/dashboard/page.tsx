import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function maestroNeedsOnboarding(metadata: Record<string, unknown>): boolean {
  const profile = metadata.profile as Record<string, unknown> | null | undefined;
  if (!profile) return true;
  const especialidades = profile.especialidades;
  return !(
    profile.nombre &&
    profile.rut &&
    profile.telefono &&
    Array.isArray(especialidades) && especialidades.length > 0
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  // ── Admin bypass ─────────────────────────────────────────────────────────────
  // This MUST come before any role/metadata check and outside any try/catch.
  // Next.js redirect() throws NEXT_REDIRECT internally — a catch block swallows
  // it and execution falls through. Check email first so admin always wins even
  // if Clerk publicMetadata still contains a stale role value.
  const user = await currentUser();
  const userEmail = (user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? "").toLowerCase().trim();
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jorge.arojasr@gmail.com").toLowerCase().trim();
  if (userEmail && userEmail === adminEmail) redirect("/admin");
  // ─────────────────────────────────────────────────────────────────────────────

  const params = await searchParams;
  const roleParam = Array.isArray(params.role) ? params.role[0] : params.role;

  let role: string | undefined;
  let metadata: Record<string, unknown> = {};

  try {
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
    redirect(maestroNeedsOnboarding(metadata)
      ? "/dashboard/maestro/completar-perfil"
      : "/dashboard/maestro");
  }
  if (role === "cliente") redirect("/dashboard/cliente");

  redirect("/onboarding");
}
