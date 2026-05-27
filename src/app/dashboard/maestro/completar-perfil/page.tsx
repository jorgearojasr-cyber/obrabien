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

const HORARIOS = [
  "Lunes a Viernes 08:00–18:00",
  "Lunes a Sábado 08:00–18:00",
  "Lunes a Sábado 08:00–20:00",
  "Lunes a Domingo 08:00–20:00",
  "Solo fines de semana",
  "A convenir",
];

const FORMAS_PAGO = ["Efectivo","Transferencia bancaria","Tarjeta débito/crédito","Cheque","Mercado Pago"];
const MODALIDADES  = ["50% al inicio / 50% al finalizar","Pago al finalizar","Por avance de obra","A convenir"];

const STEPS = ["01. Identidad","02. Cobertura","03. Servicio","04. Publicar"];

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
  nombre: string; rut: string;
  telefono: string; esWhatsapp: boolean;
  whatsapp: string; instagram: string; facebook: string;
  especialidades: string[];
  region: string; comunas: string[];
  horario: string; horarioCustom: string;
  descripcion: string; experiencia: number;
  formasPago: string[]; modalidades: string[];
  galeria: GaleriaItem[];
  terminos: boolean;
}

const INITIAL: FormState = {
  fotoFile:null, fotoPreview:"",
  nombre:"", rut:"",
  telefono:"", esWhatsapp:true,
  whatsapp:"", instagram:"", facebook:"",
  especialidades:[],
  region:"", comunas:[],
  horario:"", horarioCustom:"",
  descripcion:"", experiencia:1,
  formasPago:[], modalidades:[],
  galeria: Array.from({length:6}, () => ({file:null,preview:"",caption:""})),
  terminos:false,
};

// ── Main component ────────────────────────────────────────────────────────────

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const upd = (patch: Partial<FormState>) => setForm(p => ({...p,...patch}));

  function toggleArr(key: "especialidades"|"comunas"|"formasPago"|"modalidades", val: string) {
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
      if (!form.telefono.trim()) e.push("El teléfono es obligatorio.");
    }
    if (step===1) {
      if (form.especialidades.length===0) e.push("Selecciona al menos una especialidad.");
      if (!form.region) e.push("Selecciona tu región.");
      if (form.comunas.length===0) e.push("Selecciona al menos una comuna.");
    }
    if (step===3) {
      if (!form.terminos) e.push("Debes aceptar los términos para publicar tu perfil.");
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
          redes:{ whatsapp:form.whatsapp, instagram:form.instagram, facebook:form.facebook },
          especialidades:form.especialidades,
          region:form.region, comunas:form.comunas,
          horario: form.horario==="A convenir" ? form.horarioCustom : form.horario,
          descripcion:form.descripcion, experiencia:form.experiencia,
          formasPago:form.formasPago, modalidades:form.modalidades,
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
        <div style={{display:"flex",gap:0,marginBottom:32,border:"1px solid var(--line)",overflow:"hidden"}}>
          {STEPS.map((label,i) => (
            <div key={label} onClick={()=>{ if(i<step) setStep(i); }} style={{
              flex:1, padding:"12px 8px", textAlign:"center",
              background: i===step ? "var(--navy)" : i<step ? "var(--bg-2)" : "#fff",
              borderRight: i<STEPS.length-1 ? "1px solid var(--line)" : "none",
              cursor: i<step ? "pointer" : "default",
              fontFamily:"var(--font-jetbrains),monospace",
              fontSize:10, fontWeight:700, letterSpacing:"0.06em",
              color: i===step ? "#fff" : i<step ? "var(--orange)" : "var(--mute)",
              transition:"all .15s",
            }}>
              {i<step && "✓ "}{label.split(". ")[1]}
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
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{gridColumn:"1/-1"}}>
                <label style={SL}>Nombre completo *</label>
                <input style={SI} value={form.nombre} placeholder="Ej: Juan Pérez González"
                  onChange={e=>upd({nombre:e.target.value})}/>
              </div>
              <div>
                <label style={SL}>RUT (opcional)</label>
                <input style={SI} value={form.rut} placeholder="12.345.678-9"
                  onChange={e=>upd({rut:e.target.value})}/>
              </div>
              <div>
                <label style={SL}>Teléfono *</label>
                <input style={SI} value={form.telefono} placeholder="+56 9 1234 5678" type="tel"
                  onChange={e=>upd({telefono:e.target.value})}/>
              </div>
            </div>
            <label style={{display:"flex",alignItems:"center",gap:10,marginTop:14,cursor:"pointer"}}>
              <input type="checkbox" checked={form.esWhatsapp}
                onChange={e=>upd({esWhatsapp:e.target.checked})}
                style={{width:18,height:18,accentColor:"var(--orange)",cursor:"pointer"}}/>
              <span style={{fontSize:13.5,color:"var(--ink)"}}>
                Este número tiene <strong>WhatsApp</strong> (los clientes podrán contactarte directamente)
              </span>
            </label>
          </Section>

          <Section title="Redes sociales (opcional)">
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[
                {key:"whatsapp" as const, icon:"💬", label:"WhatsApp", placeholder:"+56 9 1234 5678"},
                {key:"instagram" as const, icon:"📸", label:"Instagram", placeholder:"@tu_usuario"},
                {key:"facebook" as const,  icon:"📘", label:"Facebook",  placeholder:"facebook.com/tu_pagina"},
              ].map(({key,icon,label,placeholder}) => (
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
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
              {HORARIOS.map(h=>(
                <label key={h} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:"var(--ink)"}}>
                  <input type="radio" name="horario" value={h} checked={form.horario===h}
                    onChange={()=>upd({horario:h})}
                    style={{width:16,height:16,accentColor:"var(--navy)",cursor:"pointer"}}/>
                  {h}
                </label>
              ))}
              <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:"var(--ink)"}}>
                <input type="radio" name="horario" value="custom" checked={form.horario==="custom"}
                  onChange={()=>upd({horario:"custom"})}
                  style={{width:16,height:16,accentColor:"var(--navy)",cursor:"pointer"}}/>
                Personalizado
              </label>
            </div>
            {form.horario==="custom" && (
              <input style={SI} value={form.horarioCustom}
                placeholder="Ej: Mar a Vie 09:00-17:00, Sáb 09:00-13:00"
                onChange={e=>upd({horarioCustom:e.target.value})}/>
            )}
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
                  <input type="checkbox" checked={form.modalidades.includes(m)}
                    onChange={()=>toggleArr("modalidades",m)}
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
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
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

          <Section title="Publicación">
            <div style={{background:"#FFF8F0",border:"1.5px solid #FED7AA",padding:"16px 18px",marginBottom:20}}>
              <p style={{margin:0,fontSize:13.5,color:"#92400E",lineHeight:1.6}}>
                <strong>Importante:</strong> Al publicar tu perfil, aceptas que OBRABIEN actúa como
                plataforma de conexión. <strong>OBRABIEN no se hace responsable de los acuerdos,
                pagos ni trabajos pactados entre maestros y clientes.</strong> Los acuerdos son
                exclusivamente entre las partes.
              </p>
            </div>
            <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}}>
              <input type="checkbox" checked={form.terminos}
                onChange={e=>upd({terminos:e.target.checked})}
                style={{width:18,height:18,accentColor:"var(--navy)",marginTop:2,cursor:"pointer",flexShrink:0}}/>
              <span style={{fontSize:14,color:"var(--ink)",lineHeight:1.55}}>
                He leído y acepto los{" "}
                <Link href="/terminos" style={{color:"var(--navy)",fontWeight:700}}>Términos de uso</Link>
                {" "}y entiendo que OBRABIEN no se hace responsable de los acuerdos entre maestro y cliente. *
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
