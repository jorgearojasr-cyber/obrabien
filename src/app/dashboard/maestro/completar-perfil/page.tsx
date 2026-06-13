"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import PasswordSection from "@/components/PasswordSection";

// ── Data ──────────────────────────────────────────────────────────────────────

const ESPECIALIDADES = [
  "Albañilería", "Gasfitería", "Electricidad", "Carpintería", "Pintura",
  "Techumbres", "Climatización / AC", "Cerrajería", "Pisos y revestimientos",
  "Impermeabilización", "Yesería", "Fierrería / Soldadura", "Plomería",
  "Instalación de cocinas", "Jardín / Paisajismo", "Demolición",
  "Instalación de ventanas", "Tabiquería / Drywall", "Fumigación",
];

const COMUNAS: Record<string, string[]> = {
  "Región Metropolitana": [
    "Santiago","Providencia","Las Condes","Vitacura","Ñuñoa","La Reina","Maipú",
    "La Florida","Pudahuel","Quilicura","Peñalolén","San Bernardo","Puente Alto",
    "Cerrillos","Lo Espejo","Renca","Recoleta","Macul","San Miguel","La Cisterna",
    "El Bosque","Pedro Aguirre Cerda","Lo Prado","Cerro Navia","Quinta Normal",
    "Independencia","Conchalí","Huechuraba","Colina","Lampa","Talagante",
    "Melipilla","Buin","Padre Hurtado","San Joaquín","Lo Barnechea",
    "La Granja","La Pintana","Estación Central","Falabella",
  ],
  "Valparaíso": [
    "Valparaíso","Viña del Mar","Quilpué","Villa Alemana","Con Con",
    "San Antonio","Quillota","Los Andes","La Ligua","Limache",
    "Olmué","Cartagena","El Quisco","El Tabo","Casablanca","Calera",
  ],
  "Biobío": [
    "Concepción","Talcahuano","Chiguayante","San Pedro de la Paz","Penco",
    "Tomé","Coronel","Lota","Los Ángeles","Arauco","Lebu","Cañete",
    "Santa Bárbara","Curanilahue","Yumbel",
  ],
  "La Araucanía": [
    "Temuco","Padre Las Casas","Villarrica","Pucón","Angol",
    "Victoria","Lautaro","Pitrufquén","Gorbea","Carahue",
  ],
  "O'Higgins": [
    "Rancagua","San Fernando","Rengo","Machalí","Graneros",
    "Cotaipo","Pichilemu","Santa Cruz","Peumo","Chimbarongo",
  ],
  "Maule": [
    "Talca","Curicó","Linares","Cauquenes","Constitución",
    "Parral","San Javier","Molina","Longaví",
  ],
  "Los Lagos": [
    "Puerto Montt","Osorno","Castro","Ancud","Puerto Varas",
    "Calbuco","Maullín","Frutillar","Los Muermos",
  ],
  "Antofagasta": ["Antofagasta","Calama","Tocopilla","Mejillones","Taltal"],
  "Coquimbo": ["La Serena","Coquimbo","Ovalle","Illapel","Vicuña","Andacollo","Los Vilos"],
  "Atacama": ["Copiapó","Vallenar","Chañaral","Caldera","Diego de Almagro"],
  "Tarapacá": ["Iquique","Alto Hospicio","Pozo Almonte","Pica"],
  "Arica y Parinacota": ["Arica","Putre","General Lagos"],
  "Ñuble": ["Chillán","San Carlos","Bulnes","Coihueco","Yungay","Quirihue"],
  "Los Ríos": ["Valdivia","La Unión","Futrono","Río Bueno","Panguipulli"],
  "Aysén": ["Coyhaique","Puerto Aysén","Chile Chico","Cochrane"],
  "Magallanes": ["Punta Arenas","Puerto Natales","Porvenir","Puerto Williams"],
};

const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

const URGENCIA_FIJAS = ["Gasfitería","Electricidad","Cerrajería","Techumbre","Instalación de ventanas"];

const URGENCIA_OTRAS = [
  "Albañilería","Carpintería","Pintura","Yesería","Fierrería / Soldadura",
  "Plomería","Instalación de cocinas","Jardín / Paisajismo","Demolición",
  "Tabiquería / Drywall","Fumigación","Instalación de pisos","Climatización / AC",
  "Instalador de cámaras","Maestro multifunción","Impermeabilización",
];

const VIDEO_DOMAINS = ["youtube.com","youtu.be","tiktok.com","instagram.com","facebook.com","fb.watch"];
function isValidVideoUrl(url: string): boolean {
  if (!url.trim()) return true;
  return VIDEO_DOMAINS.some(d => url.includes(d));
}
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
function getVideoPlatform(url: string): string | null {
  if (!url.trim()) return null;
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "facebook";
  return null;
}

const FORMAS_PAGO = ["Efectivo","Transferencia bancaria","Tarjeta débito/crédito","Cheque","Mercado Pago"];
const MODALIDADES  = ["50% inicio / 50% al finalizar","Pago total al finalizar","A convenir con el cliente"];

const STEPS = ["01. Identidad","02. Cobertura","03. Servicio","04. Publicar"];

const PHONE_PREFIX = "+56 9 ";

// ── RUT helpers ───────────────────────────────────────────────────────────────

function formatRUT(raw: string): string {
  const clean = raw.replace(/[^0-9kK]/g, "").toUpperCase().slice(0, 9);
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1);
  const verifier = clean.slice(-1);
  const dotted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${dotted}-${verifier}`;
}

function validateRUT(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const verifier = clean.slice(-1);
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const rem = 11 - (sum % 11);
  const expected = rem === 11 ? "0" : rem === 10 ? "K" : String(rem);
  return verifier === expected;
}

// ── Phone helpers ─────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  if (!raw.startsWith(PHONE_PREFIX)) return PHONE_PREFIX;
  const digits = raw.slice(PHONE_PREFIX.length).replace(/\D/g, "").slice(0, 8);
  return PHONE_PREFIX + digits;
}

function phoneComplete(val: string): boolean {
  return val.slice(PHONE_PREFIX.length).replace(/\D/g, "").length === 8;
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const SL: React.CSSProperties = {
  display:"block", fontFamily:"var(--font-jetbrains),monospace",
  fontSize:10.5, fontWeight:700, textTransform:"uppercase",
  letterSpacing:"0.1em", color:"var(--mute)", marginBottom:8,
};
const SI: React.CSSProperties = {
  width:"100%", height:48, border:"1.5px solid var(--line)",
  padding:"0 14px", fontSize:14.5, color:"var(--ink)",
  background:"#fff", outline:"none", boxSizing:"border-box", fontFamily:"inherit",
};

// ── Toggle chip ───────────────────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding:"7px 13px", cursor:"pointer", fontFamily:"var(--font-archivo),sans-serif",
      fontWeight:600, fontSize:13, transition:"all .12s",
      border:`1.5px solid ${active ? "var(--navy)" : "var(--line)"}`,
      background: active ? "var(--navy)" : "#fff",
      color: active ? "#fff" : "var(--ink-soft)",
    }}>
      {active && <span style={{marginRight:5,color:"var(--orange)"}}>✓</span>}
      {label}
    </button>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function Section({ title, children, optional }: { title:string; children:React.ReactNode; optional?: boolean }) {
  return (
    <div style={{background:"#fff",border:"1px solid var(--line)",padding:"24px",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
        <p style={{...SL,marginBottom:0,fontSize:11,color:"var(--navy)"}}>{title}</p>
        {optional && (
          <span style={{fontSize:9.5,fontWeight:600,color:"#9ca3af",fontFamily:"var(--font-jetbrains),monospace",letterSpacing:"0.06em",textTransform:"uppercase"}}>
            (Opcional)
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Form state type ───────────────────────────────────────────────────────────

type GaleriaItem = { file: File | null; preview: string; caption: string; cloudinaryUrl: string; uploading: boolean };

interface FormState {
  fotoFile: File | null; fotoPreview: string; fotoCloudinaryUrl: string; fotoUploading: boolean;
  nombre: string; rut: string; rutError: string;
  telefono: string; esWhatsapp: boolean;
  whatsapp: string; instagram: string; facebook: string; tiktok: string;
  especialidades: string[];
  region: string; comunas: string[];
  horarioDesde: string; horarioHasta: string; horarioDias: string[];
  descripcion: string; fraseDestacada: string; videoUrl: string; experiencia: number;
  formasPago: string[]; modalidades: string[];
  atiendeUrgencias: boolean; especialidadesUrgencia: string[];
  galeria: GaleriaItem[];
  comoLlego: string;
  comoLlegoOtro: string;
  referidoRut: string;
  terminos: boolean;
  autorizaPerfil: boolean;
}

const SHORT_TO_FULL: Record<string, string> = {
  "Lun":"Lunes","Mar":"Martes","Mié":"Miércoles",
  "Jue":"Jueves","Vie":"Viernes","Sáb":"Sábado","Dom":"Domingo",
};

const INITIAL: FormState = {
  fotoFile:null, fotoPreview:"", fotoCloudinaryUrl:"", fotoUploading:false,
  nombre:"", rut:"", rutError:"",
  telefono:PHONE_PREFIX, esWhatsapp:true,
  whatsapp:PHONE_PREFIX, instagram:"", facebook:"", tiktok:"",
  especialidades:[],
  region:"", comunas:[],
  horarioDesde:"08:00", horarioHasta:"18:00", horarioDias:[],
  descripcion:"", fraseDestacada:"", videoUrl:"", experiencia:1,
  formasPago:[], modalidades:[],
  atiendeUrgencias: false, especialidadesUrgencia: [],
  galeria: Array.from({length:9}, () => ({file:null,preview:"",caption:"",cloudinaryUrl:"",uploading:false})),
  comoLlego: "",
  comoLlegoOtro: "",
  referidoRut: "",
  terminos:false,
  autorizaPerfil:false,
};

// ── Pre-populate form from Supabase row ───────────────────────────────────────

type FotoRow = { id: string; url: string; descripcion: string | null };
type SocialRow = { whatsapp?: string | null; instagram?: string | null; facebook?: string | null; tiktok?: string | null } | null;
type HorarioRow2 = { tipo?: string; desde?: string; hasta?: string; dias?: string[] } | null;

function findRegionForCities(cities: string[]): string {
  for (const [region, comunas] of Object.entries(COMUNAS)) {
    if (cities.some(c => comunas.includes(c))) return region;
  }
  return "";
}

function buildGaleria(fotos: FotoRow[]): GaleriaItem[] {
  const filled = fotos.slice(0, 9).map(f => ({
    file: null,
    preview: f.url,
    caption: f.descripcion ?? "",
    cloudinaryUrl: f.url,
    uploading: false,
  }));
  while (filled.length < 9) {
    filled.push({ file: null, preview: "", caption: "", cloudinaryUrl: "", uploading: false });
  }
  return filled;
}

function populateForm(row: Record<string, unknown>, fotos: FotoRow[]): Partial<FormState> {
  const horario = row.horarios as HorarioRow2;
  const social  = row.social  as SocialRow;
  const ciudades = (row.ciudades as string[]) ?? [];

  const telefono = (() => {
    const t = (row.telefono as string) ?? "";
    if (!t) return PHONE_PREFIX;
    if (t.startsWith("+56")) return t;
    return PHONE_PREFIX + t;
  })();

  const fotoUrl = (row.foto_url as string) ?? "";

  // Prefer dias_disponibles column; fall back to horarios.dias or horario.tipo (old radio format)
  const horarioDias = (() => {
    const d = row.dias_disponibles as string[];
    if (d?.length) return d;
    const fromDias = (horario?.dias ?? []).map((x: string) => SHORT_TO_FULL[x] ?? x);
    if (fromDias.length) return fromDias;
    if (horario?.tipo === "semana") return ["Lunes","Martes","Miércoles","Jueves","Viernes"];
    if (horario?.tipo === "finde") return ["Sábado","Domingo"];
    return [];
  })();

  const modalidades = (() => {
    const mc = row.modalidad_cobro;
    if (Array.isArray(mc)) return mc as string[];
    if (typeof mc === "string" && mc) return [mc];
    return [];
  })();

  return {
    fotoPreview:       fotoUrl,
    fotoCloudinaryUrl: fotoUrl,
    nombre:       (row.nombre      as string)  ?? "",
    rut:          (row.rut         as string)  ?? "",
    rutError:     "",
    telefono,
    esWhatsapp:   (row.whatsapp    as boolean) ?? true,
    whatsapp:     social?.whatsapp ?? telefono,
    instagram:    (social?.instagram ?? "").replace(/^@+/, ""),
    facebook:     (social?.facebook  ?? "").replace(/^https?:\/\/(www\.)?facebook\.com\//, ""),
    tiktok:       (social?.tiktok    ?? "").replace(/^@+/, ""),
    especialidades: (row.especialidades as string[]) ?? [],
    region:       findRegionForCities(ciudades),
    comunas:      ciudades,
    horarioDesde: horario?.desde  ?? "08:00",
    horarioHasta: horario?.hasta  ?? "18:00",
    horarioDias,
    descripcion:     (row.descripcion     as string) ?? "",
    fraseDestacada:  (row.frase_destacada as string) ?? "",
    videoUrl:        (row.video_url       as string) ?? "",
    experiencia:     (row.anos_experiencia as number) || 1,
    formasPago:      (row.formas_pago     as string[]) ?? [],
    modalidades,
    atiendeUrgencias:      !!(row.atiende_urgencias as boolean),
    especialidadesUrgencia: (row.especialidades_urgencia as string[]) ?? [],
    galeria:      buildGaleria(fotos),
    comoLlego:     (row.como_llego      as string) ?? "",
    comoLlegoOtro: (row.como_llego_otro as string) ?? "",
    referidoRut:   (row.referido_rut    as string) ?? "",
    terminos:      true,
    autorizaPerfil: true,
  };
}

// ── Main component ────────────────────────────────────────────────────────────

type VerifState = {
  frente: string; reverso: string; selfie: string;
  frenteUploading: boolean; reversoUploading: boolean; selfieUploading: boolean;
  estado: string; sending: boolean; sent: boolean;
};

const VERIF_INITIAL: VerifState = {
  frente: "", reverso: "", selfie: "",
  frenteUploading: false, reversoUploading: false, selfieUploading: false,
  estado: "sin_enviar", sending: false, sent: false,
};

export default function CompletarPerfilPage() {
  const router = useRouter();
  const { isLoaded, user: clerkUser } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (clerkUser?.primaryEmailAddress?.emailAddress === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.replace("/admin");
    }
  }, [isLoaded, clerkUser, router]);

  const [step, setStep]             = useState(0);
  const [form, setForm]             = useState<FormState>(INITIAL);
  const [verif, setVerif]           = useState<VerifState>(VERIF_INITIAL);
  const [errors, setErrors]         = useState<string[]>([]);
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [fromMigration, setFromMigration]         = useState(false);
  const [cancelingMigration, setCancelingMigration] = useState(false);

  const [referidoChecking, setReferidoChecking] = useState(false);
  const [referidoNombre,   setReferidoNombre]   = useState<string | null>(null);
  const [referidoError,    setReferidoError]    = useState("");

  const [formasPago,     setFormasPago]     = useState<string[]>([]);
  const [modalidadCobro, setModalidadCobro] = useState<string[]>([]);
  const [urgenciaOpen,   setUrgenciaOpen]   = useState(false);
  const urgenciaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFromMigration(params.get("from") === "migration");
  }, []);

  useEffect(() => {
    fetch("/api/get-profile")
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          const fotos = (data.fotos_trabajos ?? []) as FotoRow[];
          setForm(prev => ({ ...prev, ...populateForm(data as Record<string, unknown>, fotos) }));
          setHasExistingProfile(true);
          const d = data as Record<string, unknown>;

          const rawFP = d.formas_pago;
          const rawMC = d.modalidad_cobro;
          console.log("[completar-perfil] raw formas_pago:", rawFP, "raw modalidad_cobro:", rawMC);
          console.log("[completar-perfil] modalidad_cobro type:", typeof rawMC);
          const fp = Array.isArray(rawFP) ? (rawFP as string[]) : (typeof rawFP === "string" && rawFP ? [rawFP] : []);
          let mc: string[];
          if (Array.isArray(rawMC)) {
            mc = rawMC as string[];
          } else if (typeof rawMC === "string" && rawMC) {
            try { mc = JSON.parse(rawMC); } catch { mc = [rawMC]; }
          } else {
            mc = [];
          }
          setFormasPago(fp);
          setModalidadCobro(mc);
          setVerif(v => ({
            ...v,
            frente:  (d.cedula_frente   as string) ?? "",
            reverso: (d.cedula_reverso  as string) ?? "",
            selfie:  (d.selfie_cedula   as string) ?? "",
            estado:  (d.verificacion_estado as string) ?? "sin_enviar",
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (form.comoLlego !== "Me lo recomendó un maestro" || !form.referidoRut) {
      setReferidoNombre(null);
      setReferidoError("");
      return;
    }
    const clean = form.referidoRut.replace(/[^0-9kK]/g, "");
    if (clean.length < 7) return;
    const timer = setTimeout(async () => {
      setReferidoChecking(true);
      setReferidoNombre(null);
      setReferidoError("");
      try {
        const res = await fetch(`/api/lookup-rut?rut=${encodeURIComponent(form.referidoRut)}`);
        const data = await res.json();
        if (data.found) setReferidoNombre(data.nombre);
        else setReferidoError("RUT no encontrado, pero igual guardaremos tu referido.");
      } catch {
        setReferidoError("Error al verificar el RUT.");
      } finally {
        setReferidoChecking(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.referidoRut, form.comoLlego]);

  useEffect(() => {
    if (!urgenciaOpen) return;
    function handleClick(e: MouseEvent) {
      if (urgenciaRef.current && !urgenciaRef.current.contains(e.target as Node)) {
        setUrgenciaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [urgenciaOpen]);

  const upd = (patch: Partial<FormState>) => setForm(p => ({...p,...patch}));

  function toggleArr(key: "especialidades"|"comunas"|"formasPago"|"horarioDias"|"modalidades"|"especialidadesUrgencia", val: string) {
    const arr = form[key] as string[];
    upd({ [key]: arr.includes(val) ? arr.filter(x=>x!==val) : [...arr,val] });
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>, handler: (f:File,url:string)=>void) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    handler(f, url);
  }

  async function uploadFotoPerfil(file: File) {
    upd({ fotoUploading: true });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-foto?type=perfil", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      upd({ fotoCloudinaryUrl: data.url, fotoUploading: false });
    } catch {
      upd({ fotoUploading: false });
      setErrors(["Error al subir la foto de perfil. Intenta de nuevo."]);
    }
  }

  async function uploadFoto(file: File, index: number) {
    const g = [...form.galeria];
    g[index] = { ...g[index], uploading: true };
    upd({ galeria: g });

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-foto", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const g2 = [...form.galeria];
      g2[index] = { ...g2[index], cloudinaryUrl: data.url, uploading: false };
      upd({ galeria: g2 });
    } catch {
      const g2 = [...form.galeria];
      g2[index] = { ...g2[index], uploading: false };
      upd({ galeria: g2 });
      setErrors(["Error al subir la foto. Intenta de nuevo."]);
    }
  }

  async function uploadDoc(file: File, field: "frente" | "reverso" | "selfie") {
    const loadingKey = `${field}Uploading` as keyof VerifState;
    setVerif(v => ({ ...v, [loadingKey]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-foto?type=cedula", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setVerif(v => ({ ...v, [field]: data.url, [loadingKey]: false }));
    } catch {
      setVerif(v => ({ ...v, [loadingKey]: false }));
      setErrors(["Error al subir el documento. Intenta de nuevo."]);
    }
  }

  async function enviarVerificacion() {
    if (!verif.frente || !verif.reverso || !verif.selfie) {
      setErrors(["Debes subir los 3 documentos para enviar la verificación."]);
      window.scrollTo(0, 0);
      return;
    }
    setVerif(v => ({ ...v, sending: true }));
    try {
      const res = await fetch("/api/verificacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedulaFrente: verif.frente, cedulaReverso: verif.reverso, selfieCedula: verif.selfie }),
      });
      if (!res.ok) throw new Error();
      setVerif(v => ({ ...v, sending: false, sent: true, estado: "pendiente" }));
    } catch {
      setVerif(v => ({ ...v, sending: false }));
      setErrors(["Error al enviar documentos. Intenta de nuevo."]);
      window.scrollTo(0, 0);
    }
  }

  function validate(): string[] {
    const e: string[] = [];
    if (step===0) {
      if (!form.fotoCloudinaryUrl) e.push("La foto de perfil es obligatoria.");
      if (!form.nombre.trim()) e.push("El nombre completo es obligatorio.");
      if (!form.rut.trim()) e.push("El RUT es obligatorio.");
      else if (!validateRUT(form.rut)) e.push("El RUT ingresado no es válido.");
      if (!phoneComplete(form.telefono)) e.push("Ingresa los 8 dígitos del teléfono.");
    }
    if (step===1) {
      if (form.especialidades.length===0) e.push("Selecciona al menos una especialidad.");
      if (!form.region) e.push("Selecciona tu región.");
      if (form.comunas.length===0) e.push("Selecciona al menos una comuna.");
    }
    if (step===3) {
      if (form.videoUrl.trim() && !isValidVideoUrl(form.videoUrl))
        e.push("Solo se aceptan links de YouTube, TikTok, Instagram o Facebook.");
    }
    if (step===3) {
      // Cross-check all required fields (user may have navigated via tab)
      if (!form.fotoCloudinaryUrl) e.push("Foto de perfil obligatoria — regresa al Paso 1.");
      if (!form.nombre.trim()) e.push("Nombre completo obligatorio — regresa al Paso 1.");
      if (!form.rut.trim() || !validateRUT(form.rut)) e.push("RUT válido obligatorio — regresa al Paso 1.");
      if (!phoneComplete(form.telefono)) e.push("Teléfono (8 dígitos) obligatorio — regresa al Paso 1.");
      if (form.especialidades.length===0) e.push("Al menos 1 especialidad obligatoria — regresa al Paso 2.");
      if (form.comunas.length===0) e.push("Al menos 1 ciudad de cobertura obligatoria — regresa al Paso 2.");
      if (!form.terminos) e.push("Debes aceptar los Términos de uso para publicar tu perfil.");
      if (!form.autorizaPerfil) e.push("Debes autorizar que tu perfil sea visible públicamente.");
    }
    return e;
  }

  async function handleNext() {
    const errs = validate();
    if (errs.length) { setErrors(errs); window.scrollTo(0,0); return; }
    setErrors([]);
    if (step < 3) { setStep(s=>s+1); window.scrollTo(0,0); return; }
    setSaving(true);

    // Normalize gallery: ensure all items are { url: string, descripcion: string }
    // Guards against stale state where cloudinaryUrl might be a full object instead of a string
    const fotoUrls = form.galeria
      .filter(g => g.cloudinaryUrl && typeof g.cloudinaryUrl === "string")
      .map(g => ({ url: g.cloudinaryUrl as string, descripcion: g.caption || "" }));

    const payload = {
      nombre:form.nombre, rut:form.rut,
      telefono:form.telefono, esWhatsapp:form.esWhatsapp,
      redes:{ whatsapp:form.whatsapp, instagram:form.instagram, facebook:form.facebook, tiktok:form.tiktok },
      especialidades:form.especialidades,
      region:form.region, comunas:form.comunas,
      horario: { desde:form.horarioDesde, hasta:form.horarioHasta, dias:form.horarioDias },
      diasDisponibles: form.horarioDias,
      descripcion:form.descripcion, fraseDestacada:form.fraseDestacada, videoUrl:form.videoUrl||null, experiencia:form.experiencia,
      formasPago:formasPago, modalidades:modalidadCobro,
      atiendeUrgencias: form.atiendeUrgencias,
      especialidadesUrgencia: form.especialidadesUrgencia,
      fotoUrl: form.fotoCloudinaryUrl || null,
      galeriaCount: fotoUrls.length,
      galeriaCaptions: form.galeria.map(g=>g.caption),
      fotoUrls,
      comoLlego:     form.comoLlego     || null,
      comoLlegoOtro: form.comoLlegoOtro || null,
      referidoRut:   form.referidoRut   || null,
    };

    console.log("FULL SAVE PAYLOAD:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("/api/update-profile", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let detail = "";
        try {
          const errBody = await res.json();
          detail = errBody?.supabaseError?.message || errBody?.error || "";
          console.error("[completar-perfil] save failed — status:", res.status, "body:", errBody);
        } catch {
          console.error("[completar-perfil] save failed — status:", res.status, "(no JSON body)");
        }
        throw new Error(detail);
      }
      router.push("/dashboard/maestro?perfil=actualizado");
    } catch (err) {
      const detail = err instanceof Error && err.message ? ` (${err.message})` : "";
      setErrors([`Error al guardar. Intenta de nuevo.${detail}`]);
      setSaving(false);
    }
  }

  async function handleCancelMigration() {
    setCancelingMigration(true);
    try {
      await fetch("/api/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "cliente" }),
      });
    } catch { /* still redirect */ }
    window.location.href = "/dashboard/cliente?message=cancelado";
  }

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ fontFamily: "var(--font-jetbrains),monospace", fontSize: 13, color: "var(--mute)" }}>
          Cargando perfil…
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <div className="tape-thin"/>
      <div className="wrap" style={{paddingTop:40,paddingBottom:80}}>

        {/* Back + title */}
        <div style={{marginBottom:28}}>
          <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:14, flexWrap:"wrap" }}>
            <Link href="/dashboard/maestro" style={{fontSize:13,color:"var(--mute)",textDecoration:"none",fontFamily:"var(--font-jetbrains),monospace",display:"inline-flex",alignItems:"center",gap:6}}>
              ← Volver al panel
            </Link>
            {fromMigration ? (
              <button
                type="button"
                onClick={handleCancelMigration}
                disabled={cancelingMigration}
                style={{ fontSize:13, color: cancelingMigration ? "var(--mute)" : "var(--orange)", background:"none", border:"none", cursor: cancelingMigration ? "default" : "pointer", fontFamily:"var(--font-jetbrains),monospace", padding:0 }}
              >
                {cancelingMigration ? "Revirtiendo…" : "Cancelar"}
              </button>
            ) : (
              <Link href="/dashboard/maestro" style={{ fontSize:13, color:"var(--mute)", textDecoration:"none", fontFamily:"var(--font-jetbrains),monospace" }}>
                Cancelar
              </Link>
            )}
          </div>
          <h1 style={{fontFamily:"var(--font-archivo),sans-serif",fontWeight:900,fontSize:"clamp(22px,3vw,28px)",color:"var(--navy)",margin:"0 0 4px",lineHeight:1.1}}>
            Completa tu perfil profesional
          </h1>
          <p style={{margin:0,fontSize:14,color:"var(--mute)"}}>
            Los perfiles completos reciben 4× más contactos.
          </p>
        </div>

        {/* Step indicator */}
        <div style={{marginBottom:32}}>

          {/* Progress bar */}
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{
                fontSize:11.5,fontFamily:"var(--font-jetbrains),monospace",
                color:"var(--mute)",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",
              }}>
                Paso {step+1} de {STEPS.length}
              </span>
              <span style={{
                fontSize:11.5,fontFamily:"var(--font-jetbrains),monospace",
                color:"var(--orange)",fontWeight:700,
              }}>
                {Math.round(((step+1)/STEPS.length)*100)}%
              </span>
            </div>
            <div style={{height:5,background:"var(--line)",position:"relative",overflow:"hidden"}}>
              <div style={{
                position:"absolute",top:0,left:0,height:"100%",
                background:"var(--orange)",
                width:`${((step+1)/STEPS.length)*100}%`,
                transition:"width 0.35s ease",
              }}/>
            </div>
          </div>

          {/* Tabs */}
          <div className="step-tabs">
            {STEPS.map((label,i) => {
              const name = label.split(". ")[1];
              const isCurrent = i === step;
              // Existing profile: all non-current tabs clickable; new profile: only already-visited tabs
              const isClickable = hasExistingProfile ? !isCurrent : i < step;
              const showCheck = hasExistingProfile ? !isCurrent : i < step;
              return (
                <div key={label}
                  onClick={()=>{ if(isClickable){ setStep(i); setErrors([]); window.scrollTo(0,0); } }}
                  className={`step-tab ${isCurrent?"active":showCheck?"done":"upcoming"}`}
                  style={{ cursor: isClickable ? "pointer" : undefined }}
                  title={isClickable ? `Ir a ${name}` : undefined}
                >
                  {showCheck ? `✓ ${i+1}. ${name}` : `${i+1}. ${name}`}
                </div>
              );
            })}
          </div>
        </div>

        {/* Errors */}
        {errors.length>0 && (
          <div style={{background:"#FEF2F2",border:"1.5px solid #FCA5A5",padding:"12px 16px",marginBottom:20}}>
            {errors.map(e => <p key={e} style={{margin:"2px 0",color:"#DC2626",fontSize:13.5,fontWeight:600}}>{e}</p>)}
          </div>
        )}

        {/* ── STEP 1: Identidad ── */}
        {step===0 && <>

          <Section title="Foto de perfil *">
            <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
              <div style={{
                width:90,height:90,borderRadius:"50%",overflow:"hidden",
                border:"2px solid var(--line)",flexShrink:0,background:"#f0f0f0",
                display:"grid",placeItems:"center",fontSize:32,position:"relative",
              }}>
                {form.fotoPreview
                  ? <img src={form.fotoPreview} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:form.fotoUploading?0.4:1}}/>
                  : "👤"}
                {form.fotoUploading && (
                  <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",background:"rgba(255,255,255,0.6)"}}>
                    <span style={{fontSize:10,fontFamily:"var(--font-jetbrains),monospace",color:"var(--navy)"}}>Subiendo…</span>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="foto-perfil" style={{
                  display:"inline-block",padding:"10px 18px",border:"1.5px solid var(--navy)",
                  color:"var(--navy)",fontFamily:"var(--font-archivo),sans-serif",fontWeight:700,
                  fontSize:13,cursor:form.fotoUploading?"default":"pointer",
                  opacity:form.fotoUploading?0.5:1,
                }}>
                  {form.fotoUploading ? "Subiendo…" : form.fotoPreview ? "Cambiar foto" : "Subir foto"}
                </label>
                <input id="foto-perfil" type="file" accept="image/*" style={{display:"none"}}
                  disabled={form.fotoUploading}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    upd({ fotoFile: f, fotoPreview: URL.createObjectURL(f), fotoCloudinaryUrl: "" });
                    uploadFotoPerfil(f);
                  }}/>
                {form.fotoCloudinaryUrl && !form.fotoUploading && (
                  <p style={{margin:"6px 0 0",fontSize:11.5,color:"#22c55e",fontWeight:600}}>✓ Foto guardada en la nube</p>
                )}
                <p style={{margin:"6px 0 0",fontSize:12,color:"var(--mute)"}}>JPG o PNG. Recomendado 400×400 px.</p>
              </div>
            </div>
          </Section>

          <Section title="Datos personales">
            <div className="form-grid-2">
              <div style={{gridColumn:"1/-1"}}>
                <label style={SL}>Nombre completo *</label>
                <input style={SI} value={form.nombre} placeholder="Ej: Juan Pérez González"
                  onChange={e=>upd({nombre:e.target.value})}/>
              </div>
              <div>
                <label style={SL}>RUT *</label>
                <input
                  style={{...SI, borderColor: form.rutError ? "#DC2626" : "var(--line)"}}
                  value={form.rut}
                  placeholder="12.345.678-9"
                  onChange={e => {
                    const formatted = formatRUT(e.target.value);
                    const clean = formatted.replace(/[^0-9kK]/g, "");
                    // Only validate once the user has typed enough for a plausible RUT
                    const err = clean.length >= 7 && !validateRUT(formatted)
                      ? "RUT inválido" : "";
                    upd({ rut: formatted, rutError: err });
                  }}
                />
                {form.rutError && (
                  <p style={{margin:"4px 0 0",fontSize:12,color:"#DC2626"}}>{form.rutError}</p>
                )}
              </div>
              <div>
                <label style={SL}>Teléfono *</label>
                <input
                  style={SI}
                  value={form.telefono}
                  inputMode="numeric"
                  onChange={e => {
                    const val = formatPhone(e.target.value);
                    const patch: Partial<FormState> = { telefono: val };
                    if (form.esWhatsapp) patch.whatsapp = val;
                    upd(patch);
                  }}
                />
                <p style={{margin:"4px 0 0",fontSize:11.5,color:"var(--mute)"}}>
                  {form.telefono.slice(PHONE_PREFIX.length).length}/8 dígitos
                </p>
              </div>
            </div>
            <label style={{display:"flex",alignItems:"center",gap:10,marginTop:14,cursor:"pointer"}}>
              <input type="checkbox" checked={form.esWhatsapp}
                onChange={e => {
                  const checked = e.target.checked;
                  upd({ esWhatsapp: checked, whatsapp: checked ? form.telefono : PHONE_PREFIX });
                }}
                style={{width:18,height:18,accentColor:"var(--orange)",cursor:"pointer"}}/>
              <span style={{fontSize:13.5,color:"var(--ink)"}}>
                Este número tiene <strong>WhatsApp</strong> (los clientes podrán contactarte directamente)
              </span>
            </label>
          </Section>

          <Section title="Redes sociales" optional>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* WhatsApp — synced from teléfono when checkbox on */}
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:20,width:28,textAlign:"center",flexShrink:0,paddingTop:28}}>💬</span>
                <div style={{flex:1}}>
                  <span style={{...SL,display:"inline-block",marginBottom:4}}>WhatsApp</span>
                  <input
                    style={{...SI, background: form.esWhatsapp ? "#f5f5f5" : "#fff", color: form.esWhatsapp ? "var(--mute)" : "var(--ink)"}}
                    value={form.whatsapp}
                    inputMode="numeric"
                    readOnly={form.esWhatsapp}
                    onChange={e => { if (!form.esWhatsapp) upd({ whatsapp: formatPhone(e.target.value) }); }}
                  />
                  {form.esWhatsapp && (
                    <p style={{margin:"4px 0 0",fontSize:11.5,color:"var(--orange)"}}>
                      ✓ Copiado del teléfono
                    </p>
                  )}
                </div>
              </div>

              {/* Instagram */}
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:20,width:28,textAlign:"center",flexShrink:0,paddingTop:28}}>📸</span>
                <div style={{flex:1}}>
                  <span style={{...SL,display:"inline-block",marginBottom:4}}>Instagram</span>
                  <div style={{display:"flex"}}>
                    <span style={{height:48,display:"flex",alignItems:"center",padding:"0 12px",border:"1.5px solid var(--line)",borderRight:"none",background:"var(--bg-2)",fontSize:15,color:"var(--mute)",flexShrink:0,boxSizing:"border-box"}}>@</span>
                    <input style={{...SI,borderLeft:"none",flex:1,width:"auto"}} value={form.instagram} placeholder="tu_usuario"
                      onChange={e=>upd({instagram:e.target.value.replace(/^@+/,"")})}/>
                  </div>
                  <p style={{margin:"4px 0 0",fontSize:11.5,color:"var(--mute)"}}>Solo escribe tu usuario, ej: gotitamagistral</p>
                </div>
              </div>

              {/* Facebook */}
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:20,width:28,textAlign:"center",flexShrink:0,paddingTop:28}}>📘</span>
                <div style={{flex:1}}>
                  <span style={{...SL,display:"inline-block",marginBottom:4}}>Facebook</span>
                  <input style={SI} value={form.facebook} placeholder="tu_usuario_o_pagina"
                    onChange={e=>upd({facebook:e.target.value})}/>
                  <p style={{margin:"4px 0 0",fontSize:11.5,color:"var(--mute)"}}>Solo escribe tu usuario o nombre de página</p>
                </div>
              </div>

              {/* TikTok */}
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:20,width:28,textAlign:"center",flexShrink:0,paddingTop:28}}>🎵</span>
                <div style={{flex:1}}>
                  <span style={{...SL,display:"inline-block",marginBottom:4}}>TikTok</span>
                  <div style={{display:"flex"}}>
                    <span style={{height:48,display:"flex",alignItems:"center",padding:"0 12px",border:"1.5px solid var(--line)",borderRight:"none",background:"var(--bg-2)",fontSize:15,color:"var(--mute)",flexShrink:0,boxSizing:"border-box"}}>@</span>
                    <input style={{...SI,borderLeft:"none",flex:1,width:"auto"}} value={form.tiktok} placeholder="tu_usuario"
                      onChange={e=>upd({tiktok:e.target.value.replace(/^@+/,"")})}/>
                  </div>
                  <p style={{margin:"4px 0 0",fontSize:11.5,color:"var(--mute)"}}>Solo escribe tu usuario, ej: gotitamagistral</p>
                </div>
              </div>
            </div>
          </Section>
        </>}

        {/* ── STEP 2: Cobertura ── */}
        {step===1 && <>

          <Section title="Especialidades *">
            <p style={{fontSize:13,color:"var(--mute)",margin:"0 0 14px"}}>
              Selecciona todas las que apliquen ({form.especialidades.length} seleccionadas)
            </p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {ESPECIALIDADES.map(e=>(
                <Chip key={e} label={e} active={form.especialidades.includes(e)}
                  onClick={()=>toggleArr("especialidades",e)}/>
              ))}
            </div>
          </Section>

          <Section title="Zona de cobertura *">
            <label style={SL}>Región</label>
            <select value={form.region} style={{...SI,marginBottom:16}}
              onChange={e=>upd({region:e.target.value,comunas:[]})}>
              <option value="">Selecciona tu región…</option>
              {Object.keys(COMUNAS).map(r=><option key={r} value={r}>{r}</option>)}
            </select>

            {form.region && <>
              <label style={SL}>Comunas donde trabajas *</label>
              <div style={{
                display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",
                gap:6,maxHeight:220,overflowY:"auto",padding:"12px",
                border:"1.5px solid var(--line)",background:"#fafafa",
              }}>
                {COMUNAS[form.region].map(c=>(
                  <label key={c} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13.5,color:"var(--ink)"}}>
                    <input type="checkbox" checked={form.comunas.includes(c)}
                      onChange={()=>toggleArr("comunas",c)}
                      style={{width:16,height:16,accentColor:"var(--navy)",cursor:"pointer"}}/>
                    {c}
                  </label>
                ))}
              </div>
              {form.comunas.length>0 && (
                <p style={{margin:"8px 0 0",fontSize:12,color:"var(--orange)",fontWeight:600}}>
                  {form.comunas.length} comuna{form.comunas.length>1?"s":""} seleccionada{form.comunas.length>1?"s":""}
                </p>
              )}
            </>}
          </Section>

          <Section title="Días de atención" optional>
            <p style={{fontSize:13,color:"var(--mute)",margin:"0 0 14px"}}>
              Selecciona los días que trabajas normalmente ({form.horarioDias.length} seleccionados)
            </p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {DIAS.map(d=>{
                const on = form.horarioDias.includes(d);
                return (
                  <button key={d} type="button"
                    onClick={()=>toggleArr("horarioDias",d)}
                    style={{
                      padding:"8px 14px", cursor:"pointer",
                      fontFamily:"var(--font-archivo),sans-serif",
                      fontWeight:700, fontSize:13,
                      border:`1.5px solid ${on?"var(--navy)":"var(--line)"}`,
                      background: on ? "var(--navy)" : "#fff",
                      color: on ? "#fff" : "var(--ink-soft)",
                      transition:"all .12s",
                    }}>
                    {on && <span style={{marginRight:5,color:"var(--orange)"}}>✓</span>}
                    {d}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Horario de atención" optional>
            <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <div>
                <label style={{...SL,marginBottom:4}}>Desde</label>
                <input type="time" value={form.horarioDesde}
                  style={{...SI, width:120, paddingLeft:10, paddingRight:6}}
                  onChange={e=>upd({horarioDesde:e.target.value})}/>
              </div>
              <div>
                <label style={{...SL,marginBottom:4}}>Hasta</label>
                <input type="time" value={form.horarioHasta}
                  style={{...SI, width:120, paddingLeft:10, paddingRight:6}}
                  onChange={e=>upd({horarioHasta:e.target.value})}/>
              </div>
            </div>
          </Section>
        </>}

        {/* ── STEP 3: Servicio ── */}
        {step===2 && <>

          <Section title="Descripción profesional" optional>
            <textarea value={form.descripcion}
              onChange={e=>upd({descripcion:e.target.value})}
              placeholder="Cuéntales a los clientes quién eres, qué haces y por qué eres la mejor opción. Menciona tus certificaciones o trabajos destacados…"
              maxLength={600} rows={6}
              style={{...SI,height:"auto",padding:"12px 14px",resize:"vertical",lineHeight:1.6}}/>
            <p style={{margin:"6px 0 0",fontSize:12,color:"var(--mute)",textAlign:"right"}}>
              {form.descripcion.length}/600
            </p>
          </Section>

          <Section title="Frase destacada (tarjeta digital)" optional>
            <input value={form.fraseDestacada}
              onChange={e=>upd({fraseDestacada:e.target.value})}
              placeholder='Ej: "Trabajo limpio, precio justo y entrega a tiempo."'
              maxLength={120}
              style={SI}/>
            <p style={{margin:"6px 0 0",fontSize:12,color:"var(--mute)"}}>
              {form.fraseDestacada.length}/120 · Frase corta que aparece en tu tarjeta digital
            </p>
          </Section>

          <Section title="Años de experiencia" optional>
            <div style={{display:"flex",alignItems:"center",width:160}}>
              <button type="button" onClick={()=>upd({experiencia:Math.max(1,form.experiencia-1)})}
                style={{width:48,height:48,border:"1.5px solid var(--line)",background:"#fff",fontSize:20,cursor:"pointer",color:"var(--navy)",fontWeight:700}}>
                −
              </button>
              <div style={{flex:1,height:48,border:"1.5px solid var(--line)",borderLeft:"none",borderRight:"none",display:"grid",placeItems:"center",fontFamily:"var(--font-archivo),sans-serif",fontWeight:800,fontSize:20,color:"var(--navy)"}}>
                {form.experiencia}
              </div>
              <button type="button" onClick={()=>upd({experiencia:Math.min(50,form.experiencia+1)})}
                style={{width:48,height:48,border:"1.5px solid var(--line)",background:"#fff",fontSize:20,cursor:"pointer",color:"var(--navy)",fontWeight:700}}>
                +
              </button>
            </div>
            <p style={{margin:"10px 0 0",fontSize:13,color:"var(--mute)"}}>
              {form.experiencia===1?"1 año":`${form.experiencia} años`} en el rubro
            </p>
          </Section>

          <Section title="Formas de pago" optional>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {FORMAS_PAGO.map(fp=>(
                <label key={fp} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:"var(--ink)"}}>
                  <input type="checkbox" checked={formasPago.includes(fp)}
                    onChange={()=>setFormasPago(prev=>prev.includes(fp)?prev.filter(x=>x!==fp):[...prev,fp])}
                    style={{width:17,height:17,accentColor:"var(--navy)",cursor:"pointer"}}/>
                  {fp}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Modalidad de cobro" optional>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {MODALIDADES.map(m=>(
                <label key={m} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:"var(--ink)"}}>
                  <input type="checkbox" checked={modalidadCobro.includes(m)}
                    onChange={()=>setModalidadCobro(prev=>prev.includes(m)?prev.filter(x=>x!==m):[...prev,m])}
                    style={{width:17,height:17,accentColor:"var(--navy)",cursor:"pointer"}}/>
                  {m}
                </label>
              ))}
            </div>
          </Section>

          <Section title="// Disponibilidad de urgencias" optional>
            <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:16}}>
              <input type="checkbox" checked={form.atiendeUrgencias}
                onChange={e=>upd({atiendeUrgencias:e.target.checked, especialidadesUrgencia: e.target.checked ? form.especialidadesUrgencia : []})}
                style={{width:18,height:18,accentColor:"#DC2626",cursor:"pointer",marginTop:2,flexShrink:0}}/>
              <span style={{fontSize:14,color:"var(--ink)",lineHeight:1.5}}>
                <strong>Atiendo emergencias y llamados urgentes</strong>
                <span style={{display:"block",fontSize:12.5,color:"var(--mute)",marginTop:2}}>
                  Fuera del horario habitual — tu perfil aparecerá en búsquedas de urgencia.
                </span>
              </span>
            </label>
            {form.atiendeUrgencias && (
              <div style={{paddingLeft:30}}>
                <p style={{...SL,marginBottom:10}}>Mis especialidades de urgencia:</p>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {URGENCIA_FIJAS.map(esp=>(
                    <label key={esp} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:"var(--ink)"}}>
                      <input type="checkbox" checked={form.especialidadesUrgencia.includes(esp)}
                        onChange={()=>toggleArr("especialidadesUrgencia",esp)}
                        style={{width:16,height:16,accentColor:"#DC2626",cursor:"pointer"}}/>
                      {esp}
                    </label>
                  ))}
                  <>
                    <p style={{...SL, marginTop:12, marginBottom:6, fontSize:10}}>// Otras especialidades</p>
                    <div ref={urgenciaRef} style={{position:"relative"}}>
                      {/* Trigger */}
                      <div
                        onClick={()=>setUrgenciaOpen(o=>!o)}
                        style={{
                          height:48, border:"1.5px solid var(--line)",
                          padding:"0 14px", fontSize:14, background:"#fff",
                          display:"flex", alignItems:"center", justifyContent:"space-between",
                          cursor:"pointer", userSelect:"none", color:"var(--mute)",
                        }}
                      >
                        <span>Selecciona otras especialidades…</span>
                        <span style={{fontSize:11,color:"var(--mute)"}}>{urgenciaOpen?"▲":"▼"}</span>
                      </div>
                      {/* Dropdown */}
                      {urgenciaOpen && (
                        <div style={{
                          position:"absolute", top:"100%", left:0, right:0,
                          background:"#fff", border:"1.5px solid var(--line)", borderTop:"none",
                          zIndex:200, maxHeight:240, overflowY:"auto",
                        }}>
                          {URGENCIA_OTRAS.map(esp=>{
                            const on = form.especialidadesUrgencia.includes(esp);
                            return (
                              <div
                                key={esp}
                                onClick={()=>toggleArr("especialidadesUrgencia",esp)}
                                style={{
                                  padding:"10px 14px", cursor:"pointer", fontSize:14,
                                  color:"var(--ink)", display:"flex", alignItems:"center", gap:10,
                                  background: on ? "rgba(232,108,28,0.06)" : "#fff",
                                }}
                              >
                                <span style={{
                                  width:16, height:16, flexShrink:0,
                                  border:`1.5px solid ${on?"var(--orange)":"var(--line)"}`,
                                  background: on ? "var(--orange)" : "#fff",
                                  display:"grid", placeItems:"center",
                                  color:"#fff", fontSize:11, fontWeight:700,
                                }}>
                                  {on && "✓"}
                                </span>
                                {esp}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {/* Selected chips */}
                    {form.especialidadesUrgencia.filter(e=>URGENCIA_OTRAS.includes(e)).length > 0 && (
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
                        {form.especialidadesUrgencia.filter(e=>URGENCIA_OTRAS.includes(e)).map(esp=>(
                          <span key={esp} style={{
                            display:"inline-flex", alignItems:"center", gap:5,
                            background:"var(--orange)", color:"#fff",
                            padding:"4px 10px", fontSize:12.5, fontWeight:600,
                            fontFamily:"var(--font-archivo),sans-serif",
                          }}>
                            {esp}
                            <button type="button" onClick={()=>toggleArr("especialidadesUrgencia",esp)}
                              style={{background:"none",border:"none",color:"#fff",cursor:"pointer",padding:0,fontSize:15,lineHeight:1,display:"flex",alignItems:"center"}}>
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                </div>
              </div>
            )}
          </Section>
        </>}

        {/* ── STEP 4: Galería y publicar ── */}
        {step===3 && <>

          <Section title="Galería de trabajos (hasta 9 fotos)" optional>
            <p style={{fontSize:13,color:"var(--mute)",margin:"0 0 16px"}}>
              Sube fotos de tus mejores proyectos. Cada foto puede tener una descripción corta.
            </p>
            <div className="galeria-grid">
              {form.galeria.map((item,i)=>(
                <div key={i} style={{border:"1.5px solid var(--line)",overflow:"hidden",background:"#fafafa"}}>
                  <label htmlFor={item.uploading ? undefined : `foto-${i}`} style={{
                    display:"block",height:140,cursor:item.uploading?"default":"pointer",overflow:"hidden",
                    background:"#f0f2f5",position:"relative",
                  }}>
                    {item.preview
                      ? <img src={item.preview} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:item.uploading?0.5:1}}/>
                      : <div style={{height:"100%",display:"grid",placeItems:"center",flexDirection:"column",gap:6}}>
                          <span style={{fontSize:28}}>📷</span>
                          <span style={{fontSize:11,color:"var(--mute)",fontFamily:"var(--font-jetbrains),monospace"}}>Foto {i+1}</span>
                        </div>
                    }
                    {item.uploading && (
                      <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",background:"rgba(255,255,255,0.7)"}}>
                        <span style={{fontSize:11,fontFamily:"var(--font-jetbrains),monospace",color:"var(--navy)"}}>Subiendo…</span>
                      </div>
                    )}
                    {item.cloudinaryUrl && !item.uploading && (
                      <span style={{position:"absolute",top:6,right:6,background:"#22c55e",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",fontFamily:"var(--font-jetbrains),monospace"}}>✓ SUBIDA</span>
                    )}
                  </label>
                  {item.preview && !item.uploading && (
                    <button type="button" onClick={()=>{
                      const g=[...form.galeria];
                      g[i]={file:null,preview:"",caption:"",cloudinaryUrl:"",uploading:false};
                      upd({galeria:g});
                    }} style={{position:"absolute",top:6,left:6,background:"rgba(0,0,0,0.55)",color:"#fff",border:"none",width:22,height:22,cursor:"pointer",fontSize:13,display:"grid",placeItems:"center"}}>
                      ×
                    </button>
                  )}
                  <input id={`foto-${i}`} type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>{
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = URL.createObjectURL(f);
                      const g = [...form.galeria];
                      g[i] = {...g[i], file:f, preview:url, cloudinaryUrl:"", uploading:false};
                      upd({galeria:g});
                      uploadFoto(f, i);
                    }}/>
                  <div style={{padding:"8px 10px"}}>
                    <input
                      type="text"
                      value={item.caption}
                      placeholder="Descripción (opcional)"
                      maxLength={60}
                      style={{...SI,height:36,fontSize:13,padding:"0 10px"}}
                      onChange={e=>{
                        const g=[...form.galeria];
                        g[i]={...g[i],caption:e.target.value};
                        upd({galeria:g});
                      }}/>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="// VIDEO DE TRABAJOS" optional>
            <label style={SL}>🎬 Link de video</label>
            <input value={form.videoUrl}
              onChange={e=>upd({videoUrl:e.target.value})}
              placeholder="Pega el link de YouTube, TikTok, Instagram o Facebook"
              style={SI}/>
            {form.videoUrl.trim() && !isValidVideoUrl(form.videoUrl) && (
              <p style={{margin:"6px 0 0",fontSize:12.5,color:"#DC2626"}}>
                Solo se aceptan links de YouTube, TikTok, Instagram o Facebook.
              </p>
            )}
            {/* YouTube live preview */}
            {getYouTubeId(form.videoUrl) && (
              <div style={{marginTop:12,width:256,height:144,overflow:"hidden",borderRadius:8,border:"1.5px solid var(--line)",flexShrink:0}}>
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(form.videoUrl)}`}
                  width="256"
                  height="144"
                  style={{border:"none",display:"block"}}
                  allowFullScreen
                />
              </div>
            )}
            {/* TikTok / Instagram / Facebook detection card */}
            {form.videoUrl.trim() && isValidVideoUrl(form.videoUrl) && !getYouTubeId(form.videoUrl) && getVideoPlatform(form.videoUrl) && (
              <div style={{marginTop:12,padding:"12px 16px",background:"rgba(20,55,95,0.04)",border:"1.5px solid var(--line)",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>
                  {getVideoPlatform(form.videoUrl) === "tiktok" ? "🎵" : getVideoPlatform(form.videoUrl) === "instagram" ? "📸" : "📘"}
                </span>
                <span style={{fontSize:13.5,color:"var(--ink)"}}>
                  ✓ Video de {getVideoPlatform(form.videoUrl) === "tiktok" ? "TikTok" : getVideoPlatform(form.videoUrl) === "instagram" ? "Instagram" : "Facebook"} detectado — se mostrará en tu perfil
                </span>
              </div>
            )}
            <p style={{margin:"6px 0 0",fontSize:12,color:"var(--mute)"}}>
              Muestra tu trabajo en video. Acepta links de YouTube, TikTok, Instagram y Facebook
            </p>
          </Section>

          <Section title="Verificación de identidad" optional>
            {/* Status banners */}
            {(verif.sent || verif.estado === "pendiente") && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1.5px solid #F59E0B", padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🕐</span>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#92400e" }}>
                  Documentos enviados — revisaremos tu identidad en 24–48 horas.
                </div>
              </div>
            )}
            {verif.estado === "aprobado" && (
              <div style={{ background: "rgba(34,197,94,0.08)", border: "1.5px solid #22c55e", padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#15803d" }}>Tu identidad ya está verificada.</div>
              </div>
            )}
            {verif.estado === "rechazado" && !verif.sent && (
              <div style={{ background: "rgba(239,68,68,0.07)", border: "1.5px solid #EF4444", padding: "14px 16px", marginBottom: 20, fontSize: 13.5, fontWeight: 700, color: "#b91c1c" }}>
                ❌ Verificación rechazada — sube fotos más claras y vuelve a enviar.
              </div>
            )}

            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 20px", lineHeight: 1.6 }}>
              Sube tus documentos para obtener el sello de <strong>Maestro Verificado</strong> en tu perfil.
              Esto genera más confianza y aumenta los contactos recibidos.
            </p>

            {/* Three doc upload fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {([
                { key: "frente"  as const, loadKey: "frenteUploading"  as const, label: "Cédula de identidad (frente)",  hint: "Foto frontal de tu cédula, con el número de RUT visible.", isSelfie: false },
                { key: "reverso" as const, loadKey: "reversoUploading" as const, label: "Cédula de identidad (reverso)", hint: "Foto del reverso de tu cédula.", isSelfie: false },
                { key: "selfie"  as const, loadKey: "selfieUploading"  as const, label: "Selfie sosteniendo la cédula",  hint: "Foto tuya sujetando la cédula junto a tu rostro.", isSelfie: true },
              ]).map(({ key, loadKey, label, hint, isSelfie }) => {
                const url = verif[key] as string;
                const uploading = verif[loadKey] as boolean;
                const inputId = `doc-${key}`;
                return (
                  <div key={key}>
                    <label style={SL}>{label}</label>
                    {/* Visual guide zone — entire area is the upload trigger */}
                    <label
                      htmlFor={uploading ? undefined : inputId}
                      style={{
                        display: "block",
                        position: "relative",
                        width: isSelfie ? 160 : 240,
                        height: isSelfie ? 160 : 152,
                        borderRadius: isSelfie ? "50%" : 0,
                        border: `2px dashed ${url ? "#22c55e" : "var(--line)"}`,
                        background: "#f8f9fa",
                        overflow: "hidden",
                        cursor: uploading ? "default" : "pointer",
                        marginBottom: 10,
                      }}
                    >
                      {url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: uploading ? 0.5 : 1 }} />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          {!isSelfie && (
                            <>
                              <span style={{ position: "absolute", top: 8, left: 8, width: 18, height: 18, borderTop: "2.5px solid #94a3b8", borderLeft: "2.5px solid #94a3b8" }} />
                              <span style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderTop: "2.5px solid #94a3b8", borderRight: "2.5px solid #94a3b8" }} />
                              <span style={{ position: "absolute", bottom: 8, left: 8, width: 18, height: 18, borderBottom: "2.5px solid #94a3b8", borderLeft: "2.5px solid #94a3b8" }} />
                              <span style={{ position: "absolute", bottom: 8, right: 8, width: 18, height: 18, borderBottom: "2.5px solid #94a3b8", borderRight: "2.5px solid #94a3b8" }} />
                            </>
                          )}
                          <span style={{ fontSize: isSelfie ? 28 : 22 }}>{isSelfie ? "🤳" : "🪪"}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "var(--font-jetbrains), monospace", textAlign: "center", lineHeight: 1.4, padding: "0 16px" }}>
                            {isSelfie ? "Centra tu rostro aquí" : "Centra tu cédula aquí"}
                          </span>
                        </div>
                      )}
                      {uploading && (
                        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.8)" }}>
                          <span style={{ fontSize: 11, fontFamily: "var(--font-jetbrains), monospace", color: "var(--navy)" }}>Subiendo…</span>
                        </div>
                      )}
                    </label>
                    <input
                      id={inputId}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={uploading}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) uploadDoc(f, key);
                      }}
                    />
                    {url && !uploading && (
                      <p style={{ margin: "0 0 4px", fontSize: 11.5, color: "#22c55e", fontWeight: 600 }}>✓ Foto guardada</p>
                    )}
                    <p style={{ margin: 0, fontSize: 11.5, color: "var(--mute)" }}>{hint}</p>
                  </div>
                );
              })}
            </div>

            {/* Privacy note */}
            <p style={{ margin: "20px 0 0", fontSize: 12.5, color: "var(--mute)", background: "var(--bg-2)", border: "1px solid var(--line)", padding: "10px 14px", lineHeight: 1.6 }}>
              🔒 Tus documentos son privados y solo los verá el equipo de ObraBien para verificar tu identidad.
            </p>

            {/* Submit button */}
            {verif.estado !== "aprobado" && !verif.sent && verif.estado !== "pendiente" && (
              <button
                type="button"
                onClick={enviarVerificacion}
                disabled={verif.sending || verif.frenteUploading || verif.reversoUploading || verif.selfieUploading || !verif.frente || !verif.reverso || !verif.selfie}
                style={{
                  marginTop: 20, height: 46, padding: "0 28px",
                  background: (!verif.frente || !verif.reverso || !verif.selfie || verif.sending) ? "var(--mute)" : "var(--navy)",
                  color: "#fff", border: "none",
                  fontFamily: "var(--font-archivo), sans-serif", fontWeight: 700, fontSize: 14,
                  cursor: verif.sending ? "default" : "pointer",
                }}
              >
                {verif.sending ? "Enviando…" : "Enviar documentos para verificación →"}
              </button>
            )}
          </Section>

          <Section title="¿Cómo llegaste a ObraBien?" optional>
            <div style={{marginBottom: form.comoLlego === "Me lo recomendó un maestro" ? 16 : 0}}>
              <label style={{...SL,marginBottom:8}}>¿Cómo nos conociste?</label>
              <select
                value={form.comoLlego}
                onChange={e => upd({ comoLlego: e.target.value, referidoRut: "" })}
                style={{...SI, height:48, cursor:"pointer"}}
              >
                <option value="">— Selecciona una opción —</option>
                {[
                  "Google",
                  "Facebook (Grupo Maestros de la Construcción Chile)",
                  "Instagram",
                  "TikTok",
                  "Me lo recomendó un maestro",
                  "Otro",
                ].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {form.comoLlego === "Otro" && (
              <div style={{ marginTop: 14 }}>
                <label style={{...SL,marginBottom:8}}>¿Cómo nos conociste?</label>
                <input
                  type="text"
                  value={form.comoLlegoOtro}
                  placeholder="Cuéntanos cómo llegaste a ObraBien…"
                  maxLength={200}
                  style={SI}
                  onChange={e => upd({ comoLlegoOtro: e.target.value })}
                />
              </div>
            )}

            {form.comoLlego === "Me lo recomendó un maestro" && (
              <div>
                <label style={{...SL,marginBottom:8}}>RUT del maestro que te recomendó <span style={{fontSize:9.5,fontWeight:600,color:"#9ca3af",letterSpacing:"0.06em"}}>(Opcional)</span></label>
                <input
                  type="text"
                  value={form.referidoRut}
                  placeholder="12.345.678-9"
                  maxLength={12}
                  style={SI}
                  onChange={e => {
                    const formatted = formatRUT(e.target.value);
                    upd({ referidoRut: formatted });
                  }}
                />
                {referidoChecking && (
                  <p style={{fontSize:12.5,color:"var(--mute)",marginTop:6,fontFamily:"var(--font-jetbrains),monospace"}}>
                    Buscando…
                  </p>
                )}
                {!referidoChecking && referidoNombre && (
                  <p style={{fontSize:12.5,color:"#15803d",marginTop:6,fontFamily:"var(--font-jetbrains),monospace",fontWeight:700}}>
                    ✓ {referidoNombre}
                  </p>
                )}
                {!referidoChecking && referidoError && (
                  <p style={{fontSize:12.5,color:"var(--mute)",marginTop:6,fontFamily:"var(--font-jetbrains),monospace"}}>
                    {referidoError}
                  </p>
                )}
              </div>
            )}
          </Section>

          {/* Missing required fields pre-check */}
          {(() => {
            const missing: string[] = [];
            if (!form.fotoCloudinaryUrl) missing.push("Foto de perfil (Paso 1)");
            if (!form.nombre.trim()) missing.push("Nombre completo (Paso 1)");
            if (!form.rut.trim() || !validateRUT(form.rut)) missing.push("RUT válido (Paso 1)");
            if (!phoneComplete(form.telefono)) missing.push("Teléfono completo (Paso 1)");
            if (form.especialidades.length === 0) missing.push("Al menos 1 especialidad (Paso 2)");
            if (form.comunas.length === 0) missing.push("Al menos 1 ciudad de cobertura (Paso 2)");
            if (missing.length === 0) return null;
            return (
              <div style={{
                background: "#FFF7ED", border: "1.5px solid #FED7AA",
                padding: "14px 18px", marginBottom: 20,
              }}>
                <p style={{
                  margin: "0 0 8px",
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontWeight: 700, fontSize: 13, color: "#92400e",
                }}>
                  Faltan estos campos obligatorios para publicar:
                </p>
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                  {missing.map(m => (
                    <li key={m} style={{ fontSize: 13, color: "#b45309" }}>{m}</li>
                  ))}
                </ul>
              </div>
            );
          })()}

          <Section title="Términos y política *">
            {/* Scrollable full terms box */}
            <div style={{
              border:"1.5px solid var(--line)", background:"#FAFAFA",
              borderRadius:2, padding:"14px 16px", marginBottom:20,
              maxHeight:220, overflowY:"auto", fontSize:13.5, color:"var(--ink-soft)", lineHeight:1.7,
            }}>
              <p style={{margin:"0 0 10px",fontFamily:"var(--font-archivo),sans-serif",fontWeight:700,color:"var(--navy)",fontSize:14}}>
                Términos de uso y política de la plataforma — ObraBien
              </p>
              <ol style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:8}}>
                <li>
                  <strong>Plataforma de conexión:</strong> ObraBien actúa exclusivamente como plataforma de conexión entre maestros y clientes. No es empleador, intermediario ni parte de los contratos de servicio.
                </li>
                <li>
                  <strong>Acuerdos directos:</strong> Los acuerdos de precio, plazo y calidad son exclusivamente entre el maestro y el cliente. ObraBien no interviene en dichas negociaciones.
                </li>
                <li>
                  <strong>Exención de responsabilidad:</strong> ObraBien no se hace responsable por trabajos mal ejecutados, disputas de pago, incumplimientos de contrato ni daños derivados de los servicios prestados entre las partes.
                </li>
                <li>
                  <strong>Veracidad de la información:</strong> El maestro declara que toda la información ingresada en su perfil (nombre, RUT, especialidades, fotografías y datos de contacto) es verídica y le pertenece.
                </li>
                <li>
                  <strong>Visibilidad del perfil:</strong> Al publicar, el maestro autoriza que su perfil sea visible públicamente en la plataforma ObraBien y en los resultados de búsqueda del sitio.
                </li>
                <li>
                  <strong>Moderación y suspensión:</strong> ObraBien puede suspender o eliminar perfiles que contengan información falsa, reportes reiterados de clientes u otras infracciones a estos términos.
                </li>
                <li>
                  <strong>Protección de datos:</strong> Los datos personales son tratados conforme a la Ley N.º 19.628 sobre protección de la vida privada de Chile. No se comparten con terceros sin consentimiento expreso del titular.
                </li>
                <li>
                  <strong>Derecho a eliminar:</strong> El maestro puede solicitar la eliminación de su perfil y sus datos personales en cualquier momento escribiendo a contacto@ObraBien.cl.
                </li>
              </ol>
            </div>

            {/* Checkbox 1: términos */}
            <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:14}}>
              <input type="checkbox" checked={form.terminos}
                onChange={e=>upd({terminos:e.target.checked})}
                style={{width:18,height:18,accentColor:"var(--navy)",marginTop:2,cursor:"pointer",flexShrink:0}}/>
              <span style={{fontSize:14,color:"var(--ink)",lineHeight:1.55}}>
                Acepto los{" "}
                <Link href="/terminos" target="_blank" style={{color:"var(--navy)",fontWeight:700}}>Términos y Condiciones</Link>
                {" "}y la{" "}
                <Link href="/privacidad" target="_blank" style={{color:"var(--navy)",fontWeight:700}}>Política de Privacidad</Link>
                {" "}de ObraBien. Entiendo que la plataforma no se hace responsable de los acuerdos entre maestro y cliente. *
              </span>
            </label>

            {/* Checkbox 2: visibilidad */}
            <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}}>
              <input type="checkbox" checked={form.autorizaPerfil}
                onChange={e=>upd({autorizaPerfil:e.target.checked})}
                style={{width:18,height:18,accentColor:"var(--navy)",marginTop:2,cursor:"pointer",flexShrink:0}}/>
              <span style={{fontSize:14,color:"var(--ink)",lineHeight:1.55}}>
                Autorizo que mi perfil sea visible públicamente en ObraBien y aparezca en los resultados de búsqueda del sitio. *
              </span>
            </label>
          </Section>
        </>}

        {/* Navigation */}
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginTop:8}}>
          {step>0 && (
            <button type="button" onClick={()=>{setStep(s=>s-1);setErrors([]);window.scrollTo(0,0);}}
              style={{height:48,padding:"0 24px",border:"1.5px solid var(--line)",background:"#fff",color:"var(--ink)",fontFamily:"var(--font-archivo),sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>
              ← Anterior
            </button>
          )}
          <button type="button" onClick={handleNext} disabled={saving}
            style={{height:52,padding:"0 32px",border:"none",
              background:saving?"var(--mute)":"var(--orange)",
              color:"#fff",fontFamily:"var(--font-archivo),sans-serif",fontWeight:800,
              fontSize:15,cursor:saving?"not-allowed":"pointer",transition:"background .15s"}}>
            {saving ? "Guardando…" : step<3 ? "Siguiente →" : "Publicar perfil →"}
          </button>
          <Link href="/dashboard/maestro" style={{fontSize:14,color:"var(--mute)",textDecoration:"none"}}>
            Cancelar
          </Link>
        </div>

        <div style={{marginTop:24}}>
          <PasswordSection />
        </div>

      </div>
    </div>
  );
}
