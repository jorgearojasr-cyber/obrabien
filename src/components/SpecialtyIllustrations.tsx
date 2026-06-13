/* eslint-disable @next/next/no-img-element */

const SLUG: Record<string, string> = {
  "Albañil":                           "albanil",
  "Gasfiter":                          "gasfiter",
  "Electricista":                      "electricista",
  "Carpintero":                        "carpintero",
  "Pintor":                            "pintor",
  "Ceramista":                         "ceramista",
  "Soldador":                          "soldador",
  "Techumbre":                         "techador",
  "Yesero":                            "yesero",
  "Drywall":                           "drywall",
  "Instalación de pisos":    "instalador-pisos",
  "Instalación de ventanas": "instalador-ventanas",
  "Instalador de cámaras":             "instalador-camaras",
  "Aire acondicionado":                "aire-acondicionado",
  "Mantención de jardines":            "mantencion-jardines",
  "Excavaciones":                      "excavaciones",
  "Paneles solares":                   "paneles-solares",
};

export function getIllustration(name: string) {
  const slug = SLUG[name] ?? "maestro-multifuncion";
  return (
    <img
      src={`/assets/specialties/${slug}.png`}
      alt={name}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}
