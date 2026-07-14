import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

async function supabaseMaestroExists(userId: string): Promise<boolean> {
  const { data } = await getSupabaseAdmin()
    .from("maestros")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  return !!data;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  // ── Admin bypass ─────────────────────────────────────────────────────────────
  // Must come before any role/metadata check and outside any try/catch.
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
    // Basic registration flow: any existing Supabase row (regardless of perfil_estado)
    // sends the maestro straight to their dashboard. Only brand-new maestros with no
    // row yet go through the quick registro-basico form.
    const hasProfile = await supabaseMaestroExists(userId);
    redirect(hasProfile
      ? "/dashboard/maestro"
      : "/dashboard/maestro/registro-basico");
  }

  if (role === "cliente") redirect("/dashboard/cliente");

  redirect("/onboarding");
}
