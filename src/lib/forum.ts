export type AuthorRole = "maestro" | "cliente";

export interface ForumAuthor {
  name: string;
  initials: string;
  role: AuthorRole;
  specialty?: string;
  verified: boolean;
}

export interface ForumReply {
  id: string;
  author: ForumAuthor;
  content: string;
  time: string;
  useful: number;
}

export interface ForumPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: ForumAuthor;
  time: string;
  views: number;
  useful: number;
  pinned?: boolean;
  solved?: boolean;
  tags: string[];
  whoCanReply: "todos" | "maestros";
  seedReplies: ForumReply[];
}

export const FORUM_CATEGORIES = [
  { id: "todos",       label: "Todos" },
  { id: "consultas",   label: "Consultas" },
  { id: "tips",        label: "Tips del oficio" },
  { id: "materiales",  label: "Materiales" },
  { id: "herramientas",label: "Herramientas" },
  { id: "proyectos",   label: "Proyectos" },
  { id: "compraventa", label: "Compra y venta" },
  { id: "empleos",     label: "Empleos" },
];

export const FORUM_CAT_COLORS: Record<string, { bg: string; color: string }> = {
  consultas:    { bg: "rgba(20,55,95,0.08)",   color: "#14375F" },
  tips:         { bg: "rgba(232,108,28,0.10)", color: "#E86C1C" },
  materiales:   { bg: "rgba(45,66,88,0.08)",   color: "#2D4258" },
  herramientas: { bg: "rgba(107,124,143,0.12)",color: "#6B7C8F" },
  proyectos:    { bg: "rgba(20,55,95,0.12)",   color: "#14375F" },
  compraventa:  { bg: "rgba(37,165,90,0.10)",  color: "#1a8c4a" },
  empleos:      { bg: "rgba(109,40,217,0.10)", color: "#6d28d9" },
};

export const FORUM_POSTS: ForumPost[] = [
  {
    id: "p-001",
    title: "¿Cuánto cobrar por m² de cerámica instalada en 2025?",
    excerpt: "Estoy recibiendo trabajos de cerámica en la RM y me cuesta definir mis precios. Vi que hay mucha variación entre colegas. ¿Alguno tiene referencia de lo que se está cobrando actualmente?",
    content: `Estoy recibiendo trabajos de cerámica en la RM y me cuesta definir mis precios. Vi que hay mucha variación entre colegas — algunos cobran $6.000/m² y otros $12.000/m² por trabajo aparentemente similar.

Mis costos actuales consideran: pegamento Famacol, crucetas 2mm, fragüe, y desplazamiento. El precio de la cerámica lo pone el cliente.

Tengo 4 años de experiencia instalando pisos y muros, trabajo solo y tengo todas mis herramientas. ¿Alguno tiene referencia de lo que se está cobrando actualmente en Santiago, Providencia, Las Condes?

¿Cómo calculan si el formato es grande (60x120) versus formato pequeño (20x20)? ¿Cobran diferente por biselado o cortes en diagonal?`,
    category: "consultas",
    author: { name: "Luis Fuentes", initials: "LF", role: "maestro", specialty: "Ceramista", verified: false },
    time: "Hace 2 horas",
    views: 187, useful: 23, pinned: false, solved: true,
    tags: ["precios", "cerámica", "RM"],
    whoCanReply: "todos",
    seedReplies: [
      {
        id: "r-001-1",
        author: { name: "Roberto Muñoz", initials: "RM", role: "maestro", specialty: "Ceramista", verified: true },
        content: "En RM el estándar hoy (2025) está entre $8.000 y $10.000/m² para cerámica estándar 40x40, mano de obra pura. Si el cliente pone los materiales. Para formato grande (60x120 o más) yo cobro mínimo $13.000/m² porque el corte es más lento y las roturas son más caras. El biselado y diagonal lo cobro por metro lineal aparte, entre $2.500 y $3.500/ml dependiendo del equipo que tenga en la obra.",
        time: "Hace 1 hora",
        useful: 31,
      },
      {
        id: "r-001-2",
        author: { name: "María González", initials: "MG", role: "cliente", verified: false },
        content: "Soy cliente y contraté a un ceramista hace 3 meses en Ñuñoa. Me cobró $9.500/m² todo incluido (pegamento y fragüe) más el traslado. El resultado quedó perfecto. Creo que ese precio es justo.",
        time: "Hace 45 min",
        useful: 8,
      },
      {
        id: "r-001-3",
        author: { name: "Carlos Vega", initials: "CV", role: "maestro", specialty: "Ceramista", verified: false },
        content: "Para formato 60x120 con junta mínima (1mm) yo cobro $15.000/m² porque necesito amoladora de disco diamante y la precisión de corte toma el doble de tiempo. Nunca bajes de $8.000/m² en formato estándar — ya considera tu seguro y herramientas.",
        time: "Hace 30 min",
        useful: 18,
      },
      {
        id: "r-001-4",
        author: { name: "Pedro Rojas", initials: "PR", role: "maestro", specialty: "Pintor", verified: false },
        content: "No soy ceramista pero como referencia: en Las Condes y Vitacura los precios suelen ser un 20-30% más altos que el promedio RM porque los clientes tienen mayor poder adquisitivo y exigen más cuidado. Considera eso al cotizar por comuna.",
        time: "Hace 20 min",
        useful: 5,
      },
    ],
  },
  {
    id: "p-002",
    title: "Tip: cómo evitar fisuras en radier con malla acma",
    excerpt: "Después de varios años trabajando radier, aprendí que la malla acma debe quedar a 1/3 de la altura del radier, no en el fondo. Así evito la mayoría de las fisuras por contracción.",
    content: `Después de varios años trabajando radier, aprendí que la malla acma debe quedar a 1/3 de la altura del radier, no en el fondo. Así evito la mayoría de las fisuras por contracción.

El error más común que veo en la industria es poner la malla directamente sobre el terreno o sobre el radiolón. Eso es casi inútil porque el concreto trabaja por tracción en la parte inferior — si pones la malla ahí, no tiene cómo absorber los esfuerzos de contracción.

Mi técnica: uso separadores de plástico de 3 cm para dejar la malla a exactamente 1/3 del espesor total. Para un radier de 8 cm, la malla queda a 2,7 cm del fondo.

Otro punto clave: el curado. Cubro con nylon negro por 7 días mínimo. En verano con calor, también mojo el radier las primeras 48 horas para evitar la evaporación rápida que produce microfisuras superficiales.

¿Tienen algún otro truco para radier sin fisuras?`,
    category: "tips",
    author: { name: "Juan Pérez", initials: "JP", role: "maestro", specialty: "Albañil", verified: true },
    time: "Hace 5 horas",
    views: 341, useful: 67, pinned: true, solved: false,
    tags: ["radier", "albañilería", "técnica"],
    whoCanReply: "todos",
    seedReplies: [
      {
        id: "r-002-1",
        author: { name: "Manuel Soto", initials: "MS", role: "maestro", specialty: "Carpintero", verified: false },
        content: "Excelente tip Juan. Yo agrego fibras de polipropileno en la mezcla (150g por m³) — eso reduce las microfisuras superficiales un montón, especialmente en verano. El proveedor me lo enseñó y desde que lo uso no he tenido reclamos por fisuras superficiales.",
        time: "Hace 4 horas",
        useful: 24,
      },
      {
        id: "r-002-2",
        author: { name: "Sebastián Torres", initials: "ST", role: "cliente", verified: false },
        content: "Gracias por el tip. Tengo pensado hacer un radier de 60m² en mi casa. ¿Cuánto tiempo después de verter el concreto puedo poner porcelanato encima?",
        time: "Hace 3 horas",
        useful: 3,
      },
      {
        id: "r-002-3",
        author: { name: "Juan Pérez", initials: "JP", role: "maestro", specialty: "Albañil", verified: true },
        content: "@Sebastián: Mínimo 28 días para que el radier alcance su resistencia de diseño. Muchos apuran a los 14 días pero el riesgo de fisuras por carga aumenta. Si vas a poner porcelanato grande (60x120), yo esperaría 28 días sí o sí.",
        time: "Hace 2 horas",
        useful: 15,
      },
    ],
  },
  {
    id: "p-003",
    title: "¿Qué marca de termostato recomiendan para split inverter?",
    excerpt: "Tengo un cliente que quiere control inteligente para su sistema multisplit. He probado Sensibo y Tado, pero quiero saber si alguien tiene experiencia con otras marcas más asequibles.",
    content: `Tengo un cliente que quiere control inteligente para su sistema multisplit de 3 equipos (2 en dormitorios, 1 en living). He probado Sensibo y Tado en otros proyectos, pero quiero saber si alguien tiene experiencia con otras marcas más asequibles para este tipo de instalación.

El cliente quiere: programación horaria por zona, control desde el celular y preferiblemente integración con Alexa o Google Home.

Presupuesto del cliente es moderado, no quiere gastar más de $80.000 por equipo. El Tado me parece caro para lo que ofrece en Chile y el Sensibo tiene problemas con algunos modelos Carrier que he instalado.

¿Alguien ha probado los Smart IR de Tuya o los BroadLink? ¿Cómo funcionan con la app en Chile?`,
    category: "herramientas",
    author: { name: "Hernán Salazar", initials: "HS", role: "maestro", specialty: "Aire acondicionado", verified: false },
    time: "Hace 1 día",
    views: 112, useful: 14, pinned: false, solved: false,
    tags: ["aire acondicionado", "termostato", "domótica"],
    whoCanReply: "todos",
    seedReplies: [
      {
        id: "r-003-1",
        author: { name: "Diego Cáceres", initials: "DC", role: "maestro", specialty: "Electricista", verified: true },
        content: "Uso BroadLink RM4 Pro hace 2 años y funciona muy bien con Samsung y Carrier. La app Broadlink es algo torpe pero se puede integrar con Home Assistant si el cliente quiere más control. Para lo que describes, el RM4 Pro sale alrededor de $35.000 en MercadoLibre Chile y tiene base de datos de protocolos infrarrojos enorme.",
        time: "Hace 20 horas",
        useful: 19,
      },
      {
        id: "r-003-2",
        author: { name: "Francisco Bravo", initials: "FB", role: "maestro", specialty: "Electricista", verified: false },
        content: "Los Tuya Smart IR son los más baratos ($15.000-$25.000) y tienen buena compatibilidad, pero la nube de Tuya ha tenido problemas de privacidad en Europa. En Chile nadie dice nada pero si el cliente es exigente con seguridad, mejor el BroadLink que tiene opción local.",
        time: "Hace 18 horas",
        useful: 11,
      },
    ],
  },
  {
    id: "p-004",
    title: "Proyecto: ampliación de 40m² en madera, ¿piden permiso de edificación?",
    excerpt: "Tengo un cliente en Talca que quiere ampliar en madera. La municipalidad me dijo que bajo 25m² no pide permiso, pero el proyecto es de 40m². ¿Alguien ha pasado por esto?",
    content: `Tengo un cliente en Talca que quiere ampliar en madera su casa de un piso. La municipalidad de Talca me dijo inicialmente que bajo 25m² no pide permiso, pero el proyecto es de 40m².

El proyecto contempla: dormitorio + baño completo + estar pequeño. Estructura de madera 2x4 con OSB y revestimiento exterior planchas de fibrocemento.

Preguntas concretas:
1. ¿Es correcto que bajo 25m² están exentos de permiso en zona urbana?
2. ¿Qué pasa si el proyecto supera ese límite? ¿Se puede dividir en dos etapas para evitar el permiso?
3. ¿Alguien ha tramitado permiso de edificación en Talca? ¿Cuánto demora?

El cliente quiere empezar en 2 meses y está nervioso con los plazos.`,
    category: "proyectos",
    author: { name: "Manuel Soto", initials: "MS", role: "maestro", specialty: "Carpintero", verified: false },
    time: "Hace 2 días",
    views: 263, useful: 29, pinned: false, solved: true,
    tags: ["permiso", "ampliación", "madera", "Talca"],
    whoCanReply: "todos",
    seedReplies: [
      {
        id: "r-004-1",
        author: { name: "Juan Pérez", initials: "JP", role: "maestro", specialty: "Albañil", verified: true },
        content: "El artículo 5.1.2 de la OGUC establece obras que no requieren permiso: ampliaciones menores de 25m² en viviendas existentes. Para 40m² necesitas permiso sí o sí. Dividirlo en etapas para evitar el permiso es una práctica que algunos usan pero es técnicamente una evasión de la norma — si la municipalidad inspecciona puede paralizar la obra.",
        time: "Hace 2 días",
        useful: 34,
      },
      {
        id: "r-004-2",
        author: { name: "Luis Fuentes", initials: "LF", role: "maestro", specialty: "Ceramista", verified: false },
        content: "En Talca el plazo de permiso de edificación para vivienda simple suele ser 30-45 días hábiles si el expediente va completo. Lo que demora más es conseguir al arquitecto que firme el proyecto. Busca uno que conozca la municipalidad de Talca, hace la diferencia.",
        time: "Hace 1 día",
        useful: 17,
      },
      {
        id: "r-004-3",
        author: { name: "Camila Rojas", initials: "CR", role: "cliente", verified: false },
        content: "Pasé por algo similar en Linares. El permiso tardó 52 días hábiles con un arquitecto local. Al final valió la pena porque al vender la casa el comprador pidió todos los documentos al día.",
        time: "Hace 22 horas",
        useful: 9,
      },
    ],
  },
  {
    id: "p-005",
    title: "Comparativa: cañerías PPR vs PVC corrugado para agua fría",
    excerpt: "He instalado ambas en proyectos residenciales. En mi experiencia, PPR aguanta mejor la presión y no se fragiliza con el frío del sur, pero es más cara. ¿Cuál usan ustedes?",
    content: `He instalado ambas en proyectos residenciales a lo largo de Chile. En mi experiencia, PPR aguanta mejor la presión y no se fragiliza con el frío del sur, pero es más cara.

Comparativa que armé después de 6 años trabajando con ambas:

**PVC corrugado:**
- Precio: ~30% más barato
- Instalación: más rápida (uniones a presión o pegamento)
- Fragilidad: se pone quebradizo bajo 0°C — problema real en regiones IX, X, XIV
- Vida útil estimada: 25-30 años

**PPR (polipropileno random):  **
- Precio: más caro pero disponible en Sodimac y ferreterías
- Instalación: requiere termofusión (herramienta especial)
- Resistencia al frío: excelente
- Vida útil estimada: 50+ años

Para el sur de Chile (VIII para abajo) recomiendo PPR sin dudarlo. ¿Cuál usan ustedes en sus proyectos y por qué?`,
    category: "materiales",
    author: { name: "Roberto Muñoz", initials: "RM", role: "maestro", specialty: "Gasfiter", verified: true },
    time: "Hace 3 días",
    views: 498, useful: 54, pinned: false, solved: false,
    tags: ["cañerías", "materiales", "gasfitería"],
    whoCanReply: "todos",
    seedReplies: [
      {
        id: "r-005-1",
        author: { name: "Hernán Salazar", initials: "HS", role: "maestro", specialty: "Gasfiter", verified: false },
        content: "Llevo 8 años en Valdivia y cambié completamente a PPR desde 2019. Tuve dos trabajos con PVC que reventaron en invierno (bajo -2°C) y tuve que ir a reparar de urgencia un sábado a las 3am. Nunca más. El costo extra en materiales no compensa la garantía y el servicio post-venta que tengo que dar.",
        time: "Hace 3 días",
        useful: 28,
      },
      {
        id: "r-005-2",
        author: { name: "Pedro Rojas", initials: "PR", role: "maestro", specialty: "Pintor", verified: false },
        content: "No soy gasfiter pero trabajo mucho con ellos en proyectos. En Santiago (RM) veo que la mayoría sigue usando PVC sin problemas porque el frío no es tan extremo. La diferencia de presupuesto sí importa al cliente cuando estamos en obras de precio ajustado.",
        time: "Hace 2 días",
        useful: 7,
      },
    ],
  },
  {
    id: "p-006",
    title: "¿Cómo cobran cuando el cliente cambia el proyecto a mitad de obra?",
    excerpt: "Me pasa seguido que el cliente decide cambiar el diseño cuando ya compré materiales o avancé el trabajo. ¿Hay algún contrato estándar que usen para protegerse de estos cambios?",
    content: `Me pasa seguido que el cliente decide cambiar el diseño cuando ya compré materiales o avancé el trabajo. El último caso: compré 40m² de cerámica 60x60 según el plano acordado, y a mitad de instalación el cliente cambió a 80x80. Tuve que devolver la cerámica (con descuento por devolución) y recomprar.

¿Hay algún contrato estándar que usen para protegerse de estos cambios?

Lo que me gustaría tener:
1. Cláusula que indique que cambios de proyecto generan un presupuesto adicional
2. Que el cliente firme la aprobación de materiales antes de comprarlos
3. Qué hacer con materiales ya comprados si el cliente cambia de opinión

¿Alguien tiene un contrato simple que use habitualmente? No quiero algo muy formal, solo algo que me proteja básicamente.`,
    category: "consultas",
    author: { name: "Pedro Rojas", initials: "PR", role: "maestro", specialty: "Pintor", verified: false },
    time: "Hace 4 días",
    views: 374, useful: 41, pinned: false, solved: false,
    tags: ["contrato", "cambios", "presupuesto"],
    whoCanReply: "todos",
    seedReplies: [
      {
        id: "r-006-1",
        author: { name: "Roberto Muñoz", initials: "RM", role: "maestro", specialty: "Gasfiter", verified: true },
        content: "Uso un contrato simple de 1 página desde hace 4 años. Los puntos clave: (1) Todo cambio de proyecto se presupuesta por escrito antes de ejecutar. (2) Materiales aprobados por escrito por el cliente — si cambia, paga el delta. (3) Anticipo del 30% no reembolsable si el cliente desiste. Te lo paso por WhatsApp si me escribes, lo hizo un amigo abogado de construcción.",
        time: "Hace 4 días",
        useful: 45,
      },
      {
        id: "r-006-2",
        author: { name: "Ana Martínez", initials: "AM", role: "cliente", verified: false },
        content: "Soy cliente y aprecio a los maestros que piden firma en los materiales. Me ha pasado equivocarme yo misma con los colores al ver la muestra versus la cerámica real. Un proceso formal de aprobación me protege a mí también.",
        time: "Hace 3 días",
        useful: 22,
      },
      {
        id: "r-006-3",
        author: { name: "Juan Pérez", initials: "JP", role: "maestro", specialty: "Albañil", verified: true },
        content: "El contrato escrito es fundamental. Yo uso WhatsApp como evidencia: mando fotos de todos los materiales con precio antes de comprar y pido que me respondan 'Aprobado' por escrito. No es 100% legal pero ante un conflicto da evidencia clara de la aprobación.",
        time: "Hace 2 días",
        useful: 33,
      },
    ],
  },
  {
    id: "p-007",
    title: "Tip: cómo pintar sobre superficies con humedad sin que se descascare",
    excerpt: "La clave está en tratar la humedad antes de pintar, no después. Uso impermeabilizante cristalizante en los poros del muro antes de cualquier capa de base.",
    content: `La clave está en tratar la humedad antes de pintar, no después. Uso impermeabilizante cristalizante en los poros del muro antes de cualquier capa de base. Nunca más me ha descascarado.

El proceso completo que uso:

1. **Diagnóstico:** diferencio si es humedad de filtración (desde exterior) o de capilaridad (desde suelo). Esto cambia completamente el tratamiento.

2. **Para humedad de capilaridad:** aplico inyección de silicona en zócalo (técnica del corte horizontal) y luego impermeabilizante cristalizante Sika-1 o similar diluido al 50% como primera mano.

3. **Para filtración:** busco y sello el punto de entrada primero. Sin eso, cualquier pintura es temporal.

4. **La pintura:** espero 15 días después del tratamiento. Primera mano es sellador al agua, segunda base látex con aditivo antihúmedad, luego 2 manos de terminación.

El error que más veo: pintar directo sobre el muro húmedo con pintura "antihumedad". Eso no funciona — la humedad empuja la pintura desde adentro.

¿Algún colega tiene otra técnica para humedad de techo filtrado?`,
    category: "tips",
    author: { name: "Francisco Bravo", initials: "FB", role: "maestro", specialty: "Yesero", verified: false },
    time: "Hace 5 días",
    views: 522, useful: 78, pinned: false, solved: false,
    tags: ["pintura", "humedad", "técnica"],
    whoCanReply: "todos",
    seedReplies: [
      {
        id: "r-007-1",
        author: { name: "Carlos Vega", initials: "CV", role: "maestro", specialty: "Pintor", verified: true },
        content: "Para humedad de techo por filtración en losa plana uso membrana líquida Sika MultiSeal aplicada en caliente desde el exterior, luego dejo secar 72 horas antes de pintar el cielo interior. Es lo único que ha funcionado de forma permanente en los proyectos que he intervenido.",
        time: "Hace 5 días",
        useful: 36,
      },
      {
        id: "r-007-2",
        author: { name: "Luis Fuentes", initials: "LF", role: "maestro", specialty: "Ceramista", verified: false },
        content: "El punto del diagnóstico es clave. He visto maestros aplicar 5 manos de pintura antihumedad y a los 3 meses todo igual. Si no se cierra el origen, no funciona nada.",
        time: "Hace 4 días",
        useful: 19,
      },
    ],
  },
  {
    id: "p-008",
    title: "¿Vale la pena invertir en medidor láser BOSCH GLM 50?",
    excerpt: "Estoy evaluando comprar el medidor láser para presupuestar más rápido. ¿Alguien lo usa? ¿Cómo cambia el trabajo en terreno respecto a la huincha clásica?",
    content: `Estoy evaluando comprar el medidor láser BOSCH GLM 50 CX para presupuestar más rápido. El precio en Sodimac está en torno a $69.990.

¿Alguien lo usa? ¿Cómo cambia el trabajo en terreno respecto a la huincha clásica?

Mi duda principal: trabajo solo la mayoría de las veces. Con la huincha siempre necesito a alguien que ayude a sujetar el otro extremo. El láser solucionaría ese problema pero quiero saber si la precisión es real o si en la práctica hay diferencias significativas.

También me interesa el cálculo de áreas y volúmenes que dicen que trae. ¿Lo usan en la práctica para los presupuestos?`,
    category: "herramientas",
    author: { name: "Diego Cáceres", initials: "DC", role: "maestro", specialty: "Soldador", verified: false },
    time: "Hace 1 semana",
    views: 189, useful: 17, pinned: false, solved: true,
    tags: ["herramientas", "medición", "presupuesto"],
    whoCanReply: "todos",
    seedReplies: [
      {
        id: "r-008-1",
        author: { name: "Roberto Muñoz", initials: "RM", role: "maestro", specialty: "Gasfiter", verified: true },
        content: "Tengo el GLM 50 hace 3 años. Totalmente recomendado. La precisión es de ±1.5mm que para presupuesto es más que suficiente. El cálculo de área lo uso todo el tiempo: entras a una pieza, mides largo, ancho, y te calcula m² automático. Recuperé la inversión en el primer mes porque presupuesto el doble de rápido.",
        time: "Hace 6 días",
        useful: 29,
      },
      {
        id: "r-008-2",
        author: { name: "Juan Pérez", initials: "JP", role: "maestro", specialty: "Albañil", verified: true },
        content: "También tengo uno similar (Leica Disto D2). Para trabajar solo es indispensable. La única limitación: en exteriores con mucho sol el punto láser rojo es difícil de ver. En interiores perfecta.",
        time: "Hace 5 días",
        useful: 14,
      },
      {
        id: "r-008-3",
        author: { name: "Sebastián Mora", initials: "SM", role: "cliente", verified: false },
        content: "No soy maestro pero compré uno para hacer mediciones en mi departamento antes de comprar muebles. Es súper fácil de usar y la precisión es buena. Para uso profesional debe ser aún más útil.",
        time: "Hace 4 días",
        useful: 3,
      },
    ],
  },
];

export function getPost(id: string): ForumPost | undefined {
  return FORUM_POSTS.find(p => p.id === id);
}
