export interface Denuncia {
  id: string;
  created_at: string;
  denunciante_clerk_id: string;
  denunciante_nombre: string;
  denunciado_nombre: string;
  denunciado_rut?: string | null;
  denunciado_region?: string | null;
  descripcion: string;
  fotos_evidencia: string[];
  estado: "pendiente" | "aprobado" | "rechazado";
  razon_rechazo?: string | null;
  respuesta_descargo?: string | null;
  descargo_aprobado: boolean;
  aprobado_por?: string | null;
  aprobado_at?: string | null;
}

export function rowToDenuncia(row: Record<string, unknown>): Denuncia {
  const fe = row.fotos_evidencia;
  let fotos: string[] = [];
  if (Array.isArray(fe)) {
    fotos = (fe as string[]).filter(Boolean);
  } else if (typeof fe === "string" && fe) {
    try { fotos = JSON.parse(fe); } catch { fotos = []; }
  }
  return {
    id:                   row.id as string,
    created_at:           row.created_at as string,
    denunciante_clerk_id: row.denunciante_clerk_id as string,
    denunciante_nombre:   row.denunciante_nombre as string,
    denunciado_nombre:    row.denunciado_nombre as string,
    denunciado_rut:       (row.denunciado_rut as string | null) ?? null,
    denunciado_region:    (row.denunciado_region as string | null) ?? null,
    descripcion:          row.descripcion as string,
    fotos_evidencia:      fotos,
    estado:               (row.estado as "pendiente" | "aprobado" | "rechazado") ?? "pendiente",
    razon_rechazo:        (row.razon_rechazo as string | null) ?? null,
    respuesta_descargo:   (row.respuesta_descargo as string | null) ?? null,
    descargo_aprobado:    (row.descargo_aprobado as boolean) ?? false,
    aprobado_por:         (row.aprobado_por as string | null) ?? null,
    aprobado_at:          (row.aprobado_at as string | null) ?? null,
  };
}
