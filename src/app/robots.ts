import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/admin/",
        "/api/",
        "/login",
        "/registro",
        "/registro-cliente",
        "/onboarding",
        "/sso-callback",
      ],
    },
    sitemap: "https://www.obrabien.cl/sitemap.xml",
  };
}
