import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Pruebas y scripts de seguridad (hotfix 19A.1): se escriben con tipos laxos y CommonJS a propósito.
  {
    files: ["tests/**/*.{ts,js}", "scripts/**/*.{cjs,js}"],
    rules: { "@typescript-eslint/no-explicit-any": "off", "@typescript-eslint/no-require-imports": "off" },
  },
]);

export default eslintConfig;
