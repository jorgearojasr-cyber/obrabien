"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const DIAS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

const FORMAS_PAGO = ["Efectivo","Transferencia bancaria","Tarjeta débito/crédito","Cheque","Mercado Pago"];
const MODALIDADES  = ["50% al inicio / 50% al finalizar","Por avance de obra","Pago al finalizar","A convenir con el cliente"];

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

function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{background:"#fff",border:"1px solid var(--line)",padding:"24px",marginBottom:20}}>
      <p style={{...SL,marginBottom:16,fontSize:11,color:"var(--navy)"}}>{title}</p>
      {children}
    </div>
  );
}

// ── Form state type ───────────────────────────────────────────────────────────

type GaleriaItem = { file: File | null; preview: string; caption: string };

interface FormState {
  fotoFile: File | null; fotoPreview: string;
  nombre: string; rut: string; rutError: string;
  telefono: string; esWhatsapp: boolean;
  whatsapp: string; instagram: string; facebook: string; tiktok: string;
  especialidades: string[];
  region: string; comunas: string[];
  horarioTipo: string; horarioDesde: string; horarioHasta: string; horarioDias: string[];
  descripcion: string; experiencia: number;
  formasPago: string[]; modalidad: string;
  galeria: GaleriaItem[];
  terminos: boolean;
  autorizaPerfil: boolean;
}

const INITIAL: FormState = {
  fotoFile:null, fotoPreview:"",
  nombre:"", rut:"", rutError:"",
  telefono:PHONE_PREFIX, esWhatsapp:true,
  whatsapp:PHONE_PREFIX, instagram:"", facebook:"", tiktok:"",
  especialidades:[],
  region:"", comunas:[],
  horarioTipo:"", horarioDesde:"08:00", horarioHasta:"18:00", horarioDias:[],
  descripcion:"", experiencia:1,
  formasPago:[], modalidad:"",
  galeria: Array.from({length:6}, () => ({file:null,preview:"",caption:""})),
  terminos:false,
  autorizaPerfil:false,
};

// ── Main component ────────────────────────────────────────────────────────────

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const upd = (patch: Partial<FormState>) => setForm(p => ({...p,...patch}));

  function toggleArr(key: "especialidades"|"comunas"|"formasPago"|"horarioDias", val: string) {
    const arr = form[key] as string[];
    upd({ [key]: arr.includes(val) ? arr.filter(x=>x!==val) : [...arr,val] });
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>, handler: (f:File,url:string)=>void) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    handler(f, url);
  }

  function validate(): string[] {
    const e: string[] = [];
    if (step===0) {
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
    try {
      const res = await fetch("/api/update-profile", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          nombre:form.nombre, rut:form.rut,
          telefono:form.telefono, esWhatsapp:form.esWhatsapp,
          redes:{ whatsapp:form.whatsapp, instagram:form.instagram, facebook:form.facebook, tiktok:form.tiktok },
          especialidades:form.especialidades,
          region:form.region, comunas:form.comunas,
          horario: { tipo:form.horarioTipo, desde:form.horarioDesde, hasta:form.horarioHasta, dias:form.horarioDias },
          descripcion:form.descripcion, experiencia:form.experiencia,
          formasPago:form.formasPago, modalidad:form.modalidad,
          galeriaCount: form.galeria.filter(g=>g.file).length,
          galeriaCaptions: form.galeria.map(g=>g.caption),
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/dashboard/maestro?perfil=actualizado");
    } catch {
      setErrors(["Error al guardar. Intenta de nuevo."]);
      setSaving(false);
    }
  }

  return (
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <div className="tape-thin"/>
      <div className="wrap" style={{paddingTop:40,paddingBottom:80}}>

        {/* Back + title */}
        <div style={{marginBottom:28}}>
          <Link href="/dashboard/maestro" style={{fontSize:13,color:"var(--mute)",textDecoration:"none",fontFamily:"var(--font-jetbrains),monospace",display:"inline-flex",alignItems:"center",gap:6,marginBottom:14}}>
            ← Volver al panel
          </Link>
          <h1 style={{fontFamily:"var(--font-archivo),sans-serif",fontWeight:900,fontSize:"clamp(22px,3vw,28px)",color:"var(--navy)",margin:"0 0 4px",lineHeight:1.1}}>
            Completa tu perfil profesional
          </h1>
          <p style={{margin:0,fontSize:14,color:"var(--mute)"}}>
            Los perfiles completos reciben 4× más contactos.
          </p>
        </div>

        {/* Step indicator */}
        <div className="step-tabs">
          {STEPS.map((label,i) => (
            <div key={label}
              onClick={()=>{ if(i<step) setStep(i); }}
              className={`step-tab ${i===step?"active":i<step?"done":"upcoming"}`}
            >
              {i<step ? "✓ " : ""}{label.split(". ")[1]}
            </div>
          ))}
        </div>

        {/* Errors */}
        {errors.length>0 && (
          <div style={{background:"#FEF2F2",border:"1.5px solid #FCA5A5",padding:"12px 16px",marginBottom:20}}>
            {errors.map(e => <p key={e} style={{margin:"2px 0",color:"#DC2626",fontSize:13.5,fontWeight:600}}>{e}</p>)}
          </div>
        )}

        {/* ── STEP 1: Identidad ── */}
        {step===0 && <>

          <Section title="Foto de perfil">
            <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
              <div style={{
                width:90,height:90,borderRadius:"50%",overflow:"hidden",
                border:"2px solid var(--line)",flexShrink:0,background:"#f0f0f0",
                display:"grid",placeItems:"center",fontSize:32,
              }}>
                {form.fotoPreview
                  ? <img src={form.fotoPreview} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : "👤"}
              </div>
              <div>
                <label htmlFor="foto-perfil" style={{
                  display:"inline-block",padding:"10px 18px",border:"1.5px solid var(--navy)",
                  color:"var(--navy)",fontFamily:"var(--font-archivo),sans-serif",fontWeight:700,
                  fontSize:13,cursor:"pointer",
                }}>
                  {form.fotoPreview ? "Cambiar foto" : "Subir foto"}
                </label>
                <input id="foto-perfil" type="file" accept="image/*" style={{display:"none"}}
                  onChange={e=>pickFile(e,(f,url)=>upd({fotoFile:f,fotoPreview:url}))}/>
                <p style={{margin:"8px 0 0",fontSize:12,color:"var(--mute)"}}>JPG o PNG. Recomendado 400×400 px.</p>
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
                  inputMode="numeric"
                  onChange={e => {
                    const formatted = formatRUT(e.target.value);
                    const digits = formatted.replace(/[^0-9kK]/g, "");
                    const err = digits.length >= 2 && !validateRUT(formatted)
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

          <Section title="Redes sociales (opcional)">
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

              {/* Instagram, Facebook, TikTok */}
              {([
                {key:"instagram" as const, icon:"📸", label:"Instagram", placeholder:"@tu_usuario"},
                {key:"facebook"  as const, icon:"📘", label:"Facebook",  placeholder:"facebook.com/tu_pagina"},
                {key:"tiktok"   as const, icon:"🎵", label:"TikTok",    placeholder:"@tu_usuario"},
              ] as const).map(({key,icon,label,placeholder}) => (
                <div key={key} style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20,width:28,textAlign:"center",flexShrink:0}}>{icon}</span>
                  <div style={{flex:1}}>
                    <span style={{...SL,display:"inline-block",marginBottom:4}}>{label}</span>
                    <input style={SI} value={form[key]} placeholder={placeholder}
                      onChange={e=>upd({[key]:e.target.value})}/>
                  </div>
                </div>
              ))}
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

          <Section title="Horario de atención">
            {/* Time picker shared style */}
            {(()=>{
              const timeSI: React.CSSProperties = {...SI, width:110, paddingLeft:10, paddingRight:6};
              const timePickers = (
                <div style={{display:"flex",alignItems:"center",gap:12,marginTop:10,flexWrap:"wrap"}}>
                  <div>
                    <label style={{...SL,marginBottom:4}}>Desde</label>
                    <input type="time" value={form.horarioDesde} style={timeSI}
                      onChange={e=>upd({horarioDesde:e.target.value})}/>
                  </div>
                  <div>
                    <label style={{...SL,marginBottom:4}}>Hasta</label>
                    <input type="time" value={form.horarioHasta} style={timeSI}
                      onChange={e=>upd({horarioHasta:e.target.value})}/>
                  </div>
                </div>
              );
              return (
                <div style={{display:"flex",flexDirection:"column",gap:0}}>
                  {/* Option 1 */}
                  <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:"var(--ink)",padding:"10px 0",borderBottom:"1px solid var(--line)"}}>
                    <input type="radio" name="horarioTipo" value="semana"
                      checked={form.horarioTipo==="semana"}
                      onChange={()=>upd({horarioTipo:"semana"})}
                      style={{width:16,height:16,accentColor:"var(--navy)",cursor:"pointer",flexShrink:0}}/>
                    Lunes a Viernes
                  </label>
                  {form.horarioTipo==="semana" && (
                    <div style={{paddingLeft:26,paddingBottom:12,borderBottom:"1px solid var(--line)"}}>
                      {timePickers}
                    </div>
                  )}

                  {/* Option 2 */}
                  <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:"var(--ink)",padding:"10px 0",borderBottom:"1px solid var(--line)"}}>
                    <input type="radio" name="horarioTipo" value="finde"
                      checked={form.horarioTipo==="finde"}
                      onChange={()=>upd({horarioTipo:"finde"})}
                      style={{width:16,height:16,accentColor:"var(--navy)",cursor:"pointer",flexShrink:0}}/>
                    Fines de semana (Sáb y Dom)
                  </label>
                  {form.horarioTipo==="finde" && (
                    <div style={{paddingLeft:26,paddingBottom:12,borderBottom:"1px solid var(--line)"}}>
                      {timePickers}
                    </div>
                  )}

                  {/* Option 3 */}
                  <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:"var(--ink)",padding:"10px 0"}}>
                    <input type="radio" name="horarioTipo" value="custom"
                      checked={form.horarioTipo==="custom"}
                      onChange={()=>upd({horarioTipo:"custom"})}
                      style={{width:16,height:16,accentColor:"var(--navy)",cursor:"pointer",flexShrink:0}}/>
                    Personalizado
                  </label>
                  {form.horarioTipo==="custom" && (
                    <div style={{paddingLeft:26,paddingBottom:4}}>
                      <label style={{...SL,marginBottom:8}}>Días de atención</label>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:4}}>
                        {DIAS.map(d=>{
                          const on = form.horarioDias.includes(d);
                          return (
                            <button key={d} type="button"
                              onClick={()=>toggleArr("horarioDias",d)}
                              style={{
                                width:44, height:36, cursor:"pointer",
                                fontFamily:"var(--font-archivo),sans-serif",
                                fontWeight:700, fontSize:12,
                                border:`1.5px solid ${on?"var(--navy)":"var(--line)"}`,
                                background: on ? "var(--navy)" : "#fff",
                                color: on ? "#fff" : "var(--mute)",
                                transition:"all .12s",
                              }}>
                              {d}
                            </button>
                          );
                        })}
                      </div>
                      {timePickers}
                    </div>
                  )}
                </div>
              );
            })()}
          </Section>
        </>}

        {/* ── STEP 3: Servicio ── */}
        {step===2 && <>

          <Section title="Descripción profesional">
            <textarea value={form.descripcion}
              onChange={e=>upd({descripcion:e.target.value})}
              placeholder="Cuéntales a los clientes quién eres, qué haces y por qué eres la mejor opción. Menciona tus certificaciones o trabajos destacados…"
              maxLength={600} rows={6}
              style={{...SI,height:"auto",padding:"12px 14px",resize:"vertical",lineHeight:1.6}}/>
            <p style={{margin:"6px 0 0",fontSize:12,color:"var(--mute)",textAlign:"right"}}>
              {form.descripcion.length}/600
            </p>
          </Section>

          <Section title="Años de experiencia">
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

          <Section title="Formas de pago">
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {FORMAS_PAGO.map(fp=>(
                <label key={fp} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:"var(--ink)"}}>
                  <input type="checkbox" checked={form.formasPago.includes(fp)}
                    onChange={()=>toggleArr("formasPago",fp)}
                    style={{width:17,height:17,accentColor:"var(--navy)",cursor:"pointer"}}/>
                  {fp}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Modalidad de cobro">
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {MODALIDADES.map(m=>(
                <label key={m} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:"var(--ink)"}}>
                  <input type="radio" name="modalidad" value={m}
                    checked={form.modalidad===m}
                    onChange={()=>upd({modalidad:m})}
                    style={{width:17,height:17,accentColor:"var(--navy)",cursor:"pointer"}}/>
                  {m}
                </label>
              ))}
            </div>
          </Section>
        </>}

        {/* ── STEP 4: Galería y publicar ── */}
        {step===3 && <>

          <Section title="Galería de trabajos (hasta 6 fotos)">
            <p style={{fontSize:13,color:"var(--mute)",margin:"0 0 16px"}}>
              Sube fotos de tus mejores proyectos. Cada foto puede tener una descripción corta.
            </p>
            <div className="galeria-grid">
              {form.galeria.map((item,i)=>(
                <div key={i} style={{border:"1.5px solid var(--line)",overflow:"hidden",background:"#fafafa"}}>
                  <label htmlFor={`foto-${i}`} style={{
                    display:"block",height:140,cursor:"pointer",overflow:"hidden",
                    background:"#f0f2f5",position:"relative",
                  }}>
                    {item.preview
                      ? <img src={item.preview} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : <div style={{height:"100%",display:"grid",placeItems:"center",flexDirection:"column",gap:6}}>
                          <span style={{fontSize:28}}>📷</span>
                          <span style={{fontSize:11,color:"var(--mute)",fontFamily:"var(--font-jetbrains),monospace"}}>Foto {i+1}</span>
                        </div>
                    }
                  </label>
                  <input id={`foto-${i}`} type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>{
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = URL.createObjectURL(f);
                      const g = [...form.galeria];
                      g[i] = {...g[i],file:f,preview:url};
                      upd({galeria:g});
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

          <Section title="Términos y política">
            {/* Scrollable full terms box */}
            <div style={{
              border:"1.5px solid var(--line)", background:"#FAFAFA",
              borderRadius:2, padding:"14px 16px", marginBottom:20,
              maxHeight:220, overflowY:"auto", fontSize:13.5, color:"var(--ink-soft)", lineHeight:1.7,
            }}>
              <p style={{margin:"0 0 10px",fontFamily:"var(--font-archivo),sans-serif",fontWeight:700,color:"var(--navy)",fontSize:14}}>
                Términos de uso y política de la plataforma — OBRABIEN
              </p>
              <ol style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:8}}>
                <li>
                  <strong>Plataforma de conexión:</strong> OBRABIEN actúa exclusivamente como plataforma de conexión entre maestros y clientes. No es empleador, intermediario ni parte de los contratos de servicio.
                </li>
                <li>
                  <strong>Acuerdos directos:</strong> Los acuerdos de precio, plazo y calidad son exclusivamente entre el maestro y el cliente. OBRABIEN no interviene en dichas negociaciones.
                </li>
                <li>
                  <strong>Exención de responsabilidad:</strong> OBRABIEN no se hace responsable por trabajos mal ejecutados, disputas de pago, incumplimientos de contrato ni daños derivados de los servicios prestados entre las partes.
                </li>
                <li>
                  <strong>Veracidad de la información:</strong> El maestro declara que toda la información ingresada en su perfil (nombre, RUT, especialidades, fotografías y datos de contacto) es verídica y le pertenece.
                </li>
                <li>
                  <strong>Visibilidad del perfil:</strong> Al publicar, el maestro autoriza que su perfil sea visible públicamente en la plataforma OBRABIEN y en los resultados de búsqueda del sitio.
                </li>
                <li>
                  <strong>Moderación y suspensión:</strong> OBRABIEN puede suspender o eliminar perfiles que contengan información falsa, reportes reiterados de clientes u otras infracciones a estos términos.
                </li>
                <li>
                  <strong>Protección de datos:</strong> Los datos personales son tratados conforme a la Ley N.º 19.628 sobre protección de la vida privada de Chile. No se comparten con terceros sin consentimiento expreso del titular.
                </li>
                <li>
                  <strong>Derecho a eliminar:</strong> El maestro puede solicitar la eliminación de su perfil y sus datos personales en cualquier momento escribiendo a contacto@obrabien.cl.
                </li>
              </ol>
            </div>

            {/* Checkbox 1: términos */}
            <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:14}}>
              <input type="checkbox" checked={form.terminos}
                onChange={e=>upd({terminos:e.target.checked})}
                style={{width:18,height:18,accentColor:"var(--navy)",marginTop:2,cursor:"pointer",flexShrink:0}}/>
              <span style={{fontSize:14,color:"var(--ink)",lineHeight:1.55}}>
                He leído y acepto los{" "}
                <Link href="/terminos" style={{color:"var(--navy)",fontWeight:700}}>Términos de uso</Link>
                {" "}y entiendo que OBRABIEN no se hace responsable de los acuerdos entre maestro y cliente. *
              </span>
            </label>

            {/* Checkbox 2: visibilidad */}
            <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}}>
              <input type="checkbox" checked={form.autorizaPerfil}
                onChange={e=>upd({autorizaPerfil:e.target.checked})}
                style={{width:18,height:18,accentColor:"var(--navy)",marginTop:2,cursor:"pointer",flexShrink:0}}/>
              <span style={{fontSize:14,color:"var(--ink)",lineHeight:1.55}}>
                Autorizo que mi perfil sea visible públicamente en OBRABIEN y aparezca en los resultados de búsqueda del sitio. *
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

      </div>
    </div>
  );
}
