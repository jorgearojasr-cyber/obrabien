import { type ForumPost } from "./forum";

export function formatForoTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hace 1 día";
  if (days < 7) return `Hace ${days} días`;
  return date.toLocaleDateString("es-CL");
}

export function rowToForumPost(
  row: Record<string, unknown>,
  authorName: string,
  authorVerified: boolean,
  isMaestro: boolean,
): ForumPost {
  const titulo    = (row.titulo    as string) ?? "Sin título";
  const contenido = (row.contenido as string) ?? "";
  const excerpt   = contenido.length > 160
    ? contenido.slice(0, 160).trimEnd() + "…"
    : contenido;
  const initials  = authorName
    .split(" ").slice(0, 2).map((w: string) => w[0] ?? "").join("").toUpperCase() || "U";
  const createdAt = row.created_at ? new Date(row.created_at as string) : new Date();

  return {
    id:          row.id as string,
    title:       titulo,
    excerpt,
    content:     contenido,
    category:    (row.categoria      as string)              ?? "consultas",
    author:      { name: authorName, initials, role: isMaestro ? "maestro" : "cliente", verified: authorVerified },
    time:        formatForoTime(createdAt),
    views:       0,
    useful:      0,
    pinned:      false,
    solved:      false,
    tags:        (row.tags           as string[])            ?? [],
    whoCanReply: (row.quien_responde as "todos" | "maestros") ?? "todos",
    seedReplies: [],
    foto_url:    (row.foto_url       as string)              || undefined,
  };
}
