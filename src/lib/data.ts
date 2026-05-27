export interface Region {
  id: string;
  name: string;
  cities: string[];
}

export const REGIONS: Region[] = [
  { id: "ap", name: "Arica y Parinacota",     cities: ["Arica", "Putre"] },
  { id: "ta", name: "Tarapacá",               cities: ["Iquique", "Alto Hospicio", "Pozo Almonte"] },
  { id: "an", name: "Antofagasta",            cities: ["Antofagasta", "Calama", "Tocopilla", "Mejillones", "Taltal"] },
  { id: "at", name: "Atacama",                cities: ["Copiapó", "Vallenar", "Caldera", "Chañaral"] },
  { id: "co", name: "Coquimbo",               cities: ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Vicuña"] },
  { id: "va", name: "Valparaíso",             cities: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "Quillota", "San Antonio", "Los Andes"] },
  { id: "rm", name: "Metropolitana",          cities: ["Santiago", "Maipú", "Puente Alto", "Las Condes", "La Florida", "Providencia", "Ñuñoa", "San Bernardo", "Quilicura", "Pudahuel", "Peñalolén", "La Reina", "Vitacura", "Estación Central", "Recoleta"] },
  { id: "oh", name: "O'Higgins",              cities: ["Rancagua", "San Fernando", "Machalí", "Rengo", "Santa Cruz", "Pichilemu"] },
  { id: "ma", name: "Maule",                  cities: ["Talca", "Curicó", "Linares", "Cauquenes", "Constitución", "Parral", "Molina", "San Javier"] },
  { id: "nu", name: "Ñuble",                  cities: ["Chillán", "San Carlos", "Bulnes", "Coihueco"] },
  { id: "bi", name: "Biobío",                 cities: ["Concepción", "Talcahuano", "Los Ángeles", "Chiguayante", "San Pedro de la Paz", "Coronel", "Tomé"] },
  { id: "ar", name: "La Araucanía",           cities: ["Temuco", "Padre Las Casas", "Villarrica", "Pucón", "Angol", "Victoria"] },
  { id: "lr", name: "Los Ríos",               cities: ["Valdivia", "La Unión", "Río Bueno", "Panguipulli"] },
  { id: "ll", name: "Los Lagos",              cities: ["Puerto Montt", "Osorno", "Castro", "Ancud", "Puerto Varas", "Frutillar"] },
  { id: "ay", name: "Aysén",                  cities: ["Coyhaique", "Puerto Aysén"] },
  { id: "mg", name: "Magallanes",             cities: ["Punta Arenas", "Puerto Natales", "Porvenir"] },
];

export const SPECIALTIES = [
  "Albañil", "Gasfiter", "Electricista", "Carpintero", "Pintor", "Ceramista",
  "Soldador", "Techumbre", "Yesero", "Drywall",
  "Instalador de pisos flotantes", "Instalador de ventanas termopanel",
  "Instalador de cámaras", "Aire acondicionado", "Mantención de jardines",
  "Excavaciones", "Paneles solares", "Maestro multifunción",
];

export function specialtySlug(name: string) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface MasterSocial {
  whatsapp?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
}

export interface Master {
  id: string;
  name: string;
  initials: string;
  specialties: string[];
  city: string;
  sector: string;
  phone: string;
  schedule: string;
  rating: number;
  jobs: number;
  yearsExp: number;
  verified: boolean;
  description: string;
  gallery: string[];
  paymentMethods?: string[];
  paymentSchedule?: string[];
  quote?: string;
  social?: MasterSocial;
}

export const SAMPLE_MASTERS: Master[] = [
  {
    id: "m-001", name: "Juan Pérez Aravena", initials: "JP",
    specialties: ["Albañil", "Ceramista"], city: "Talca", sector: "Villa El Bosque, Talca",
    phone: "+56 9 8421 7733", schedule: "Lun a Sáb · 08:00 – 19:00",
    rating: 4.8, jobs: 142, yearsExp: 18, verified: true,
    description: "Maestro albañil con 18 años de experiencia en ampliaciones, radieres y muros de albañilería. Trabajo limpio, presupuesto sin costo y siempre con boleta.",
    gallery: ["Ampliación dormitorio", "Radier 40m²", "Muro perimetral", "Cerámica baño"],
    paymentMethods: ["Efectivo", "Transferencia bancaria"], paymentSchedule: ["50% al inicio y 50% al finalizar", "A convenir con el cliente"],
    quote: "Trabajo limpio, presupuesto sin costo y siempre con boleta. Eso es mi garantía.",
    social: { whatsapp: "+56984217733", instagram: "juanperez.albanil", facebook: "JuanPerezAravena" },
  },
  {
    id: "m-002", name: "Roberto Muñoz Salinas", initials: "RM",
    specialties: ["Gasfiter", "Instalador de ventanas termopanel"], city: "Santiago", sector: "Maipú, Santiago",
    phone: "+56 9 5512 9988", schedule: "Lun a Vie · 09:00 – 20:00 · Emergencias 24h",
    rating: 4.9, jobs: 287, yearsExp: 22, verified: true,
    description: "Gasfitería domiciliaria e industrial. Cambio de cañerías, reparación de filtraciones, instalación de calefón y termo. Atención de emergencias 24 horas.",
    gallery: ["Cambio cañerías PPR", "Instalación calefón", "Reparación baño", "Detección filtración"],
    paymentMethods: ["Efectivo", "Transferencia bancaria", "Mercado Pago"], paymentSchedule: ["Pago contra entrega", "A convenir con el cliente"],
    quote: "Porque los problemas de gasfitería no tienen horario, yo estoy disponible 24 horas.",
    social: { whatsapp: "+56955129988", instagram: "roberto.gasfiter.stgo", tiktok: "robertogasfiter", facebook: "roberto.munoz.gasfiter" },
  },
  {
    id: "m-003", name: "Carlos Vega Henríquez", initials: "CV",
    specialties: ["Electricista"], city: "Curicó", sector: "Centro, Curicó",
    phone: "+56 9 7733 4421", schedule: "Lun a Sáb · 08:30 – 18:30",
    rating: 4.7, jobs: 98, yearsExp: 11, verified: true,
    description: "Electricista clase A SEC. Instalaciones eléctricas residenciales y comerciales, tableros, automatización, certificación TE1.",
    gallery: ["Tablero monofásico", "Iluminación LED living", "Automatización portón", "Certificación TE1"],
    paymentMethods: ["Efectivo", "Transferencia bancaria", "Tarjeta de débito", "Tarjeta de crédito"], paymentSchedule: ["50% al inicio y 50% al finalizar", "Pago por avance del proyecto"],
    quote: "Instalaciones certificadas SEC. Tu hogar seguro y sin sorpresas.",
    social: { whatsapp: "+56977334421", instagram: "carlosvega.electricista" },
  },
  {
    id: "m-004", name: "Manuel Soto Carrasco", initials: "MS",
    specialties: ["Carpintero", "Techumbre"], city: "Linares", sector: "Yerbas Buenas, Linares",
    phone: "+56 9 6611 2284", schedule: "Lun a Sáb · 07:30 – 18:00",
    rating: 4.6, jobs: 76, yearsExp: 15, verified: false,
    description: "Carpintero estructural y de terminaciones. Estructuras de madera, tabiques, cielos, pisos flotantes y muebles a medida.",
    gallery: ["Cielo americano", "Piso flotante 60m²", "Estructura techumbre", "Tabique divisorio"],
    paymentMethods: ["Efectivo", "Transferencia bancaria", "Pago con cuotas"], paymentSchedule: ["Pago por avance del proyecto"],
    quote: "La madera bien trabajada no miente. Calidad y detalle en cada proyecto.",
    social: { whatsapp: "+56966112284", facebook: "manuel.soto.carpintero" },
  },
  {
    id: "m-005", name: "Pedro Rojas Mella", initials: "PR",
    specialties: ["Pintor"], city: "Concepción", sector: "San Pedro de la Paz",
    phone: "+56 9 9012 3344", schedule: "Lun a Sáb · 09:00 – 19:00",
    rating: 4.9, jobs: 215, yearsExp: 20, verified: true,
    description: "Pintura interior y exterior, óleo, látex, esmalte sintético. Preparación de muros, masillado, lijado. Trabajo rápido y prolijo.",
    gallery: ["Fachada 2 pisos", "Living comedor", "Reja metálica", "Cielo descascarado"],
    paymentMethods: ["Efectivo"], paymentSchedule: ["Pago contra entrega"],
    quote: "Pintura prolija y rápida. Tu casa renovada en tiempo récord, sin manchas y sin excusas.",
    social: { whatsapp: "+56990123344", instagram: "pedro.pintor.chile", tiktok: "pedropintorchile" },
  },
  {
    id: "m-006", name: "Luis Fuentes Pavez", initials: "LF",
    specialties: ["Ceramista", "Albañil"], city: "Talca", sector: "Población Carlos Trupp",
    phone: "+56 9 8855 1276", schedule: "Lun a Vie · 08:00 – 18:00 · Sáb medio día",
    rating: 4.8, jobs: 124, yearsExp: 14, verified: true,
    description: "Especialista en cerámica, porcelanato y piedra. Baños completos, cocinas, terrazas. Pego porcelanato gran formato y rectificado.",
    gallery: ["Baño porcelanato", "Cocina americana", "Terraza piedra", "Greca decorativa"],
    paymentMethods: ["Transferencia bancaria", "Mercado Pago", "Pago con cuotas"], paymentSchedule: ["50% al inicio y 50% al finalizar", "A convenir con el cliente"],
  },
  {
    id: "m-007", name: "Diego Cáceres Toro", initials: "DC",
    specialties: ["Soldador"], city: "Santiago", sector: "San Bernardo, Santiago",
    phone: "+56 9 4421 5577", schedule: "Lun a Sáb · 08:00 – 18:00",
    rating: 4.7, jobs: 89, yearsExp: 12, verified: false,
    description: "Soldador calificado MIG, TIG y arco. Rejas, portones, escaleras metálicas, estructuras. Trabajo en taller y a domicilio.",
    gallery: ["Portón corredera", "Escalera caracol", "Reja seguridad", "Pérgola metálica"],
    paymentMethods: ["Efectivo"], paymentSchedule: ["Pago contra entrega"],
  },
  {
    id: "m-008", name: "Francisco Bravo Ulloa", initials: "FB",
    specialties: ["Yesero", "Pintor"], city: "Santiago", sector: "Ñuñoa, Santiago",
    phone: "+56 9 3344 7799", schedule: "Lun a Vie · 09:00 – 18:30",
    rating: 4.9, jobs: 168, yearsExp: 16, verified: true,
    description: "Estuco de yeso, cornisas, molduras decorativas, reparación de cielos. Trabajo fino y detallado para casas y oficinas.",
    gallery: ["Cornisa living", "Estuco muro", "Molduras techo", "Reparación cielo"],
    paymentMethods: ["Efectivo", "Transferencia bancaria"], paymentSchedule: ["50% al inicio y 50% al finalizar"],
  },
  {
    id: "m-009", name: "Hernán Salazar Pinto", initials: "HS",
    specialties: ["Aire acondicionado", "Electricista"], city: "Santiago", sector: "Las Condes, Santiago",
    phone: "+56 9 4422 8866", schedule: "Lun a Sáb · 09:00 – 19:00",
    rating: 4.9, jobs: 245, yearsExp: 15, verified: true,
    description: "Instalación y mantención de aire acondicionado split, inverter y multisplit. Limpieza, recarga de gas y reparación.",
    gallery: ["Split 12.000 BTU", "Multisplit oficina", "Mantención filtros", "Instalación inverter"],
    paymentMethods: ["Efectivo", "Transferencia bancaria", "Tarjeta de débito"], paymentSchedule: ["Pago contra entrega"],
  },
  {
    id: "m-010", name: "Ricardo Olivares Núñez", initials: "RO",
    specialties: ["Paneles solares", "Electricista"], city: "La Serena", sector: "Coquimbo, La Serena",
    phone: "+56 9 9911 4422", schedule: "Lun a Sáb · 09:00 – 19:00",
    rating: 4.9, jobs: 78, yearsExp: 7, verified: true,
    description: "Instalación de paneles fotovoltaicos on-grid y off-grid. Certificación SEC TE4, cálculo de consumo y conexión a red.",
    gallery: ["Panel 3kW techo", "Inversor instalado", "Sistema off-grid", "Conexión red TE4"],
    paymentMethods: ["Transferencia bancaria", "Pago con cuotas"], paymentSchedule: ["50% al inicio y 50% al finalizar", "Pago por avance del proyecto"],
  },
];
