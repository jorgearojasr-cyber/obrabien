// Autorización de administrador (hotfix de privacidad 19A.1).
//
// Antes: cada página y endpoint repetía «el correo (primario o el primero de la lista) es igual a ADMIN_EMAIL», con un
// correo por defecto escrito en el código. Eso aceptaba direcciones NO verificadas y seguía funcionando aunque la variable
// de entorno faltara. Ahora hay UN solo punto de decisión, que falla cerrado:
//   - el correo primario debe estar VERIFICADO en Clerk;
//   - debe coincidir con ADMIN_EMAIL (o NEXT_PUBLIC_ADMIN_EMAIL, por compatibilidad); sin variable configurada, nadie es admin;
//   - si se define ADMIN_CLERK_USER_IDS (lista separada por comas), el identificador de Clerk también debe estar en la lista.
// No hay roles en metadatos que el propio usuario pueda escribir: `set-role` solo asigna «maestro» o «cliente».

export type EmailLike = { emailAddress?: string | null; verification?: { status?: string | null } | null } | null | undefined;
export type UserLike = { id?: string | null; primaryEmailAddress?: EmailLike } | null | undefined;
type Env = Record<string, string | undefined>;

function clean(value: string | undefined): string {
  return (value ?? "").toLowerCase().trim();
}

/** Correo del administrador según el entorno. Cadena vacía = no configurado (nadie es admin). */
export function adminEmailFromEnv(env: Env = process.env): string {
  return clean(env.ADMIN_EMAIL) || clean(env.NEXT_PUBLIC_ADMIN_EMAIL);
}

export function adminUserIdsFromEnv(env: Env = process.env): string[] {
  return (env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/** ¿El correo dado es el del administrador configurado? (sin considerar verificación; para rechazar el rol «admin» en set-role). */
export function isAdminEmail(email: string | null | undefined, env: Env = process.env): boolean {
  const admin = adminEmailFromEnv(env);
  return admin !== "" && clean(email ?? undefined) === admin;
}

export function isAdminUser(user: UserLike, env: Env = process.env): boolean {
  if (!user) return false;
  const admin = adminEmailFromEnv(env);
  if (admin === "") return false;
  const primary = user.primaryEmailAddress;
  if (!primary || clean(primary.emailAddress ?? undefined) !== admin) return false;
  if (primary.verification?.status !== "verified") return false;
  const allowed = adminUserIdsFromEnv(env);
  if (allowed.length > 0 && (!user.id || !allowed.includes(user.id))) return false;
  return true;
}
