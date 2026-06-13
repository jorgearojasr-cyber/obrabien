export type ListingType     = "venta" | "arriendo" | "servicio";
export type PriceUnit       = "unidad" | "lote" | "m2" | "kg" | "hora" | "día" | "semana" | "mes" | "servicio";
export type SellerRole      = "maestro" | "cliente" | "empresa";
export type ListingPlan     = "gratis" | "basico" | "destacado" | "pro";

export interface MarketplaceSeller {
  name: string;
  initials: string;
  role: SellerRole;
  verified: boolean;
  whatsapp: string;   // just digits, e.g. "56912345678"
  photoUrl?: string;
}

export interface MarketplaceListing {
  id: string;
  type: ListingType;
  category: string;
  title: string;
  description: string;
  price: number | null;   // null = a convenir
  priceUnit: PriceUnit;
  region: string;
  ciudad: string;
  seller: MarketplaceSeller;
  publishedAt: string;
  featured: boolean;
  plan: ListingPlan;
  tags: string[];
  photoUrl?: string;
  fotosUrls?: string[];
  consultaCount?: number;
}

/* ── Category maps ──────────────────────────────────────────────────────── */
export const VENTA_CATS    = ["Herramientas", "Materiales", "Equipos", "Ventanas / Puertas", "Otros"];
export const ARRIENDO_CATS = ["Andamios", "Maquinaria pesada", "Herramientas eléctricas", "Otros"];
export const SERVICIO_CATS = ["Hojalatería", "Vidriería", "Proveedor de materiales", "Fabricante", "Otro"];

export const CAT_MAP: Record<ListingType, string[]> = {
  venta:    VENTA_CATS,
  arriendo: ARRIENDO_CATS,
  servicio: SERVICIO_CATS,
};

/* ── Visual config ──────────────────────────────────────────────────────── */
export const TYPE_CONFIG: Record<ListingType, { label: string; bg: string; color: string }> = {
  venta:    { label: "VENTA",    bg: "rgba(37,165,90,0.13)",  color: "#1a8c4a" },
  arriendo: { label: "ARRIENDO", bg: "rgba(20,55,95,0.10)",   color: "#14375F" },
  servicio: { label: "SERVICIO", bg: "rgba(109,40,217,0.10)", color: "#6d28d9" },
};

export const PLAN_CONFIG: Record<ListingPlan, { label: string; color: string; bg: string }> = {
  gratis:    { label: "GRATIS",     color: "#6B7C8F", bg: "rgba(107,124,143,0.10)" },
  basico:    { label: "BÁSICO",     color: "#14375F", bg: "rgba(20,55,95,0.08)"   },
  destacado: { label: "DESTACADO",  color: "#E86C1C", bg: "rgba(232,108,28,0.12)" },
  pro:       { label: "PRO",        color: "#fff",    bg: "#14375F"               },
};

/* ── Seed data ──────────────────────────────────────────────────────────── */
export const LISTINGS: MarketplaceListing[] = [
  {
    id: "m-001",
    type: "venta", category: "Herramientas",
    title: "Rotomartillo Bosch GSB 13 RE — poco uso",
    description: `Rotomartillo Bosch GSB 13 RE 600W en excelente estado. Comprado hace 8 meses, se usó en un solo proyecto de ampliación. Incluye estuche original, 3 brocas SDS, adaptador y manual.

Motivo de venta: compré modelo profesional y no necesito dos. Se puede ver funcionando antes de comprar.

Acepto transferencia o efectivo. Entrego en metro Los Héroes o despacho a costo del comprador.`,
    price: 45000, priceUnit: "unidad",
    region: "Metropolitana", ciudad: "Santiago",
    seller: { name: "Pedro Rojas", initials: "PR", role: "maestro", verified: false, whatsapp: "56912345001" },
    publishedAt: "Hace 1 día", featured: true, plan: "destacado",
    tags: ["bosch", "rotomartillo", "herramientas eléctricas"],
  },
  {
    id: "m-002",
    type: "venta", category: "Materiales",
    title: "50 bolsas cemento Melón sin abrir — sobrante de obra",
    description: `Sobrante de obra, 50 bolsas de cemento Melón 42.5R sin abrir. Almacenadas en bodega seca desde hace 3 semanas, en perfectas condiciones.

Precio: $3.600 c/u o $180.000 el lote completo. No se divide por menos de 20 bolsas.

Retiro en obra, Concepción sector Pedro de Valdivia. Coordinar horario de lunes a sábado.`,
    price: 180000, priceUnit: "lote",
    region: "Biobío", ciudad: "Concepción",
    seller: { name: "Manuel Soto", initials: "MS", role: "maestro", verified: false, whatsapp: "56912345002" },
    publishedAt: "Hace 2 días", featured: false, plan: "basico",
    tags: ["cemento", "materiales", "construcción"],
  },
  {
    id: "m-003",
    type: "venta", category: "Equipos",
    title: "Generador Honda EU55iS 5500W inverter silencioso",
    description: `Generador Honda EU55iS tecnología inverter, 5500W pico / 4500W continuo. Ideal para obras donde no hay electricidad o como respaldo.

500 horas de uso, servicio técnico Honda al día. Parte al primer tirón. Consumo muy bajo comparado con generadores convencionales.

Incluye: cables de conexión, embudo, manual. Precio no negociable — vale $750.000 nuevo.`,
    price: 350000, priceUnit: "unidad",
    region: "Valparaíso", ciudad: "Viña del Mar",
    seller: { name: "Roberto Muñoz", initials: "RM", role: "maestro", verified: true, whatsapp: "56912345003" },
    publishedAt: "Hace 3 días", featured: true, plan: "destacado",
    tags: ["generador", "honda", "equipos", "inverter"],
  },
  {
    id: "m-004",
    type: "venta", category: "Ventanas / Puertas",
    title: "2 puertas pino oregón 200×80 — nuevas sin usar",
    description: `Dos puertas de pino oregón 200×80cm, nuevas sin usar. Sobraron de remodelación. Sin marcos ni herrajes.

Precio: $80.000 el par. No se venden separadas.

Retiro en Maipú. Tienen algunos golpes de transporte menores en la superficie, no en la estructura.`,
    price: 80000, priceUnit: "lote",
    region: "Metropolitana", ciudad: "Maipú",
    seller: { name: "Francisco Bravo", initials: "FB", role: "maestro", verified: false, whatsapp: "56912345004" },
    publishedAt: "Hace 5 días", featured: false, plan: "gratis",
    tags: ["puertas", "madera", "pino", "construcción"],
  },
  {
    id: "m-005",
    type: "arriendo", category: "Andamios",
    title: "Andamio metálico tubular 4m×1.5m — 2 juegos disponibles",
    description: `Arriendo andamio metálico tubular marca Layher compatible. Torre de 4 metros de altura, plataforma 1.5m de ancho. Disponibles 2 juegos independientes.

Incluye: tablones de madera, baranda de seguridad, bases niveladoras. Todo en excelente estado, revisado mensualmente.

Tarifa: $15.000/día por juego o $25.000/día los 2. Mínimo 3 días. Entrega y retiro en sector norte de Santiago a coordinar.`,
    price: 15000, priceUnit: "día",
    region: "Metropolitana", ciudad: "Quilicura",
    seller: { name: "Arriendos MR", initials: "AM", role: "empresa", verified: true, whatsapp: "56912345005" },
    publishedAt: "Hace 1 día", featured: true, plan: "pro",
    tags: ["andamio", "arriendo", "altura", "seguridad"],
  },
  {
    id: "m-006",
    type: "arriendo", category: "Maquinaria pesada",
    title: "Hormigonera eléctrica 140L IMER con operario opcional",
    description: `Arriendo hormigonera eléctrica IMER 140 litros en perfecto estado. Motor 1.1kW monofásico, mezcla hasta 100L de hormigón procesado por carga.

Con operario: $45.000/día. Sin operario: $25.000/día. Mínimo 2 días. Incluye cable de 10m. Operario disponible solo entre semana.

Entrega en radio 30km de Providencia. Costo de transporte: $12.000 ida y vuelta.`,
    price: 25000, priceUnit: "día",
    region: "Metropolitana", ciudad: "Providencia",
    seller: { name: "Diego Cáceres", initials: "DC", role: "maestro", verified: false, whatsapp: "56912345006" },
    publishedAt: "Hace 4 días", featured: false, plan: "basico",
    tags: ["hormigonera", "arriendo", "maquinaria", "concreto"],
  },
  {
    id: "m-007",
    type: "arriendo", category: "Herramientas eléctricas",
    title: "Amoladora angular Makita 9\" con discos de corte y desbaste",
    description: `Arriendo amoladora angular Makita GA9020 9 pulgadas, 2200W. Perfecta para corte de hierro, perfiles y desbaste de superficies.

Incluye 5 discos de corte y 2 de desbaste. Funda de transporte incluida.

Tarifa: $8.000/día. Mínimo 2 días. Retiro y devolución en Valparaíso centro.`,
    price: 8000, priceUnit: "día",
    region: "Valparaíso", ciudad: "Valparaíso",
    seller: { name: "Luis Fuentes", initials: "LF", role: "maestro", verified: false, whatsapp: "56912345007" },
    publishedAt: "Hace 6 días", featured: false, plan: "gratis",
    tags: ["amoladora", "makita", "arriendo", "herramientas"],
  },
  {
    id: "m-008",
    type: "servicio", category: "Proveedor de materiales",
    title: "Distribuidora cerámica y porcelanato importado — precios por volumen",
    description: `Distribuimos cerámica y porcelanato importado directo de Brasil e Italia. Precios mayoristas para maestros y constructoras.

Catálogo de más de 200 referencias, formatos desde 30×30 hasta 120×260. Stock permanente en bodega Santiago.

Ofrecemos: muestras gratuitas, despacho a obra, crédito a 30 días para maestros registrados. Mínimo de compra: 30m².`,
    price: null, priceUnit: "m2",
    region: "Metropolitana", ciudad: "Santiago",
    seller: { name: "Cerámicas del Sur", initials: "CS", role: "empresa", verified: true, whatsapp: "56912345008" },
    publishedAt: "Hace 2 días", featured: true, plan: "pro",
    tags: ["cerámica", "porcelanato", "importado", "mayorista"],
  },
  {
    id: "m-009",
    type: "servicio", category: "Fabricante",
    title: "Fabricante ventanas PVC y aluminio — presupuesto en 24h",
    description: `Fabricamos ventanas y puertas en PVC y aluminio a medida. Instalación incluida en RM y quinta región. Más de 12 años en el rubro.

Trabajamos con perfiles VEKA (Alemania) y aluminio Hydro. Vidrio simple, doble y termopanel disponible.

Entregamos en 10 días hábiles. Garantía 5 años en perfiles y 1 año en herrajes. Pide tu presupuesto sin costo.`,
    price: null, priceUnit: "servicio",
    region: "Metropolitana", ciudad: "Pudahuel",
    seller: { name: "VentanaCL", initials: "VC", role: "empresa", verified: true, whatsapp: "56912345009" },
    publishedAt: "Hace 1 semana", featured: true, plan: "destacado",
    tags: ["ventanas", "PVC", "aluminio", "termopanel", "fabricante"],
  },
  {
    id: "m-010",
    type: "servicio", category: "Vidriería",
    title: "Vidriería y espejería — corte a medida y templado",
    description: `Servicio de vidriería comercial y residencial en Concepción y Gran Concepción. Cortamos vidrio laminado, templado y espejo a medida.

Trabajos más frecuentes: ventanas, vitrinas, espejos de baño, mampara de ducha, divisiones de oficina.

Servicio a domicilio disponible. Presupuesto gratis. Trabajamos lunes a sábado 9-18h.`,
    price: null, priceUnit: "servicio",
    region: "Biobío", ciudad: "Concepción",
    seller: { name: "Hernán Salazar", initials: "HS", role: "maestro", verified: false, whatsapp: "56912345010" },
    publishedAt: "Hace 3 días", featured: false, plan: "basico",
    tags: ["vidriería", "espejo", "templado", "Concepción"],
  },
];

export function rowToListing(row: Record<string, unknown>): MarketplaceListing {
  const name      = (row.contact_name as string) || "Usuario ObraBien";
  const initials  = name.trim().split(/\s+/).slice(0, 2).map((w: string) => w[0] ?? "").join("").toUpperCase() || "?";
  const plan      = ((row.plan as string) || "gratis") as ListingPlan;
  const date      = new Date(row.created_at as string);
  const publishedAt = date.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
  return {
    id:          row.id          as string,
    type:        (row.tipo       as ListingType),
    category:    (row.categoria  as string) || "General",
    title:       row.titulo      as string,
    description: (row.descripcion as string) || "",
    price:       (row.precio     as number | null) ?? null,
    priceUnit:   ((row.precio_unit as string) || "unidad") as PriceUnit,
    region:      (row.region     as string) || "",
    ciudad:      (row.ciudad     as string) || "",
    seller: {
      name,
      initials,
      role:     (((row.seller_role as string) || "cliente") as SellerRole),
      verified: false,
      whatsapp: (row.whatsapp as string) || "",
      photoUrl: (row.seller_foto_url as string) || undefined,
    },
    publishedAt,
    featured:   plan === "destacado" || plan === "pro",
    plan,
    tags:       [],
    photoUrl:      (row.foto_url as string) || undefined,
    fotosUrls:     (row.fotos_urls as string[] | null)?.filter(Boolean) || undefined,
    consultaCount: (row.consulta_count as number) ?? 0,
  };
}

export function getListing(id: string): MarketplaceListing | undefined {
  return LISTINGS.find(l => l.id === id);
}

export function formatPrice(listing: MarketplaceListing): string {
  if (listing.price === null) return "A convenir";
  const p = listing.price.toLocaleString("es-CL");
  const units: Partial<Record<PriceUnit, string>> = {
    hora: "/hr", día: "/día", semana: "/sem", mes: "/mes", m2: "/m²", kg: "/kg",
  };
  return `$${p}${units[listing.priceUnit] ?? ""}`;
}
