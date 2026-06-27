# SIR CRM Frontend — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el frontend del CRM SIR (Next.js 16 App Router) que consume el backend NestJS: CRM completo de ~18 recursos + dashboard de métricas, con marca SIR, BFF auth (cookies httpOnly) y UX altamente interactiva.

**Architecture:** Next 16 App Router + React 19 + Tailwind v4 + shadcn/ui. BFF con Route Handlers que guardan tokens en cookies httpOnly y proxyean al backend (refresh+retry ante 401). Patrón config-driven (ResourceTable/Form/Detail + api client tipado + hooks TanStack Query) para los CRUDs; pantallas especiales (dashboard, oportunidades kanban) a mano. Implementación faseada.

**Tech Stack:** Next.js 16.2.9, React 19.2.4, Tailwind v4, TypeScript 5, shadcn/ui, TanStack Query + Table, react-hook-form + zod, Recharts (shadcn Chart), cmdk, sonner, Vitest + Testing Library, Playwright. Gestor: npm.

## Global Constraints

- **NEXT 16 ES "NOT THE NEXT.JS YOU KNOW"**: antes de escribir CUALQUIER código Next, LEER la guía relevante en `node_modules/next/dist/docs/01-app/` (route-handlers, authentication, cookies, server-and-client-components, fetching-data, layouts-and-pages, fonts, metadata) y aplicar la API vigente; heed deprecaciones. La guía MANDA sobre el conocimiento previo.
- Gestor de paquetes: **npm**. Verificación: `npm run build` (typecheck incluido) y `npm run dev` deben pasar tras cada hito.
- UI en **español**; dinero en **Quetzales (GTQ)** y fechas con `Intl` locale `es-GT` (helpers en `lib/format`).
- Colores SOLO vía clases Tailwind de los tokens de marca SIR (definidos una vez en `app/globals.css`); **nunca hex en componentes**. Fuentes Poppins (display) + Inter (sans) vía `next/font`.
- Auth: BFF con cookies httpOnly (`sir_access`/`sir_refresh`); tokens NUNCA expuestos a JS; refresh+rotate+retry-once ante 401.
- API backend: base `SIR_API_URL` (server-side); envelope `{ok,message,data}` (el client desenvuelve `data` y lanza `Error(message)`); listas `{items,total,page,limit}`.
- Patrón config-driven para los 18 recursos (DRY); esquemas Zod espejan los DTOs del backend.
- TypeScript estricto; archivos pequeños y enfocados; sin placeholders en el plan.

---


## Fase 1 — Cimientos

### Task 1.1: Limpiar el template default de create-next-app

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Delete: `public/next.svg`, `public/vercel.svg`

**Interfaces:**
- Produces: `Home()` server component placeholder (sin assets de Vercel/Next).
- Produces: `app/globals.css` reducido a solo `@import "tailwindcss";` (los tokens reales llegan en 1.4 tras `shadcn init`).
- Produces: `RootLayout` sin las fuentes Geist (metadata/fuentes definitivas llegan en 1.5).

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` y confirma la firma vigente de `page`/`layout` en Next 16 (componente por defecto, sin APIs de request en este placeholder).**
- [ ] **Step 2: Reemplaza `app/page.tsx` por un placeholder mínimo (sin `next/image`, sin enlaces del template).**
```tsx
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-2xl font-semibold">SIR CRM</h1>
      <p className="text-sm text-muted-foreground">Sir Talent CA — plataforma interna</p>
    </main>
  );
}
```
- [ ] **Step 3: Reduce `app/globals.css` a una sola línea (se ampliará tras `shadcn init`).** El token `text-muted-foreground` usado arriba queda válido al añadir los tokens en 1.4.
```css
@import "tailwindcss";
```
- [ ] **Step 4: Limpia `app/layout.tsx` quitando Geist/Geist_Mono y dejando un esqueleto temporal en español (las fuentes y metadata finales se definen en 1.5).**
```tsx
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
```
- [ ] **Step 5: Elimina los assets del template que ya no se referencian.**
```bash
rm -f public/next.svg public/vercel.svg
```
- [ ] **Step 6: Verifica que arranca en dev sin errores de import.** Comando: `npm run build`. Esperado: `✓ Compiled successfully` y la ruta `/` listada como estática.
- [ ] **Step 7: Commit.**
```bash
git add app/page.tsx app/globals.css app/layout.tsx public/
git commit -m "chore: limpia el template default de create-next-app"
```

### Task 1.2: Instalar dependencias core (datos, forms, charts, UI utils)

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: dependencias runtime disponibles para fases siguientes: `@tanstack/react-query`, `@tanstack/react-table`, `react-hook-form`, `zod`, `@hookform/resolvers`, `recharts`, `cmdk`, `sonner`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`.

- [ ] **Step 1: Instala las dependencias fijando versiones compatibles con React 19.2.4 / Next 16.2.9 (todas tienen releases que declaran React 19 en peerDeps; npm resolverá la última compatible).**
```bash
npm install @tanstack/react-query@^5 @tanstack/react-table@^8 react-hook-form@^7 zod@^3 @hookform/resolvers@^3 recharts@^2 cmdk@^1 sonner@^2 lucide-react@^0.460 clsx@^2 tailwind-merge@^3 class-variance-authority@^0.7
```
- [ ] **Step 2: Confirma que la instalación no produjo conflictos de peer-deps con React 19.** Comando: `npm ls react react-dom`. Esperado: una sola versión `react@19.2.4` y `react-dom@19.2.4` sin `UNMET PEER DEPENDENCY`.
- [ ] **Step 3: Verifica que el proyecto sigue compilando.** Comando: `npm run build`. Esperado: `✓ Compiled successfully`.
- [ ] **Step 4: Commit.**
```bash
git add package.json package-lock.json
git commit -m "chore(deps): instala dependencias core (tanstack, rhf, zod, recharts, cmdk, sonner)"
```

### Task 1.3: Inicializar shadcn/ui para Tailwind v4 + set base de componentes

**Files:**
- Create: `components.json`
- Create: `lib/utils.ts`
- Create: `components/ui/*` (button, input, table, dialog, sheet, drawer, dropdown-menu, card, badge, skeleton, sonner, command, tabs, select, form, label)
- Modify: `app/globals.css` (shadcn reescribe los tokens base; se sustituyen por los de SIR en 1.4)
- Modify: `package.json`, `package-lock.json` (deps que añade shadcn: vaul, @radix-ui/*, tw-animate-css, etc.)

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` en `lib/utils.ts` (alias `@/lib/utils`).
- Produces: componentes shadcn bajo alias `@/components/ui/*`.
- Consumes: alias `@/*` ya configurado en `tsconfig.json` (`"paths": { "@/*": ["./*"] }`).

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` (sección Tailwind CSS) para confirmar que el flujo v4 es CSS-first (`@import "tailwindcss"`, sin `tailwind.config.js`) — shadcn debe generar tokens dentro de `globals.css`, no un config JS.**
- [ ] **Step 2: Ejecuta `shadcn init` en modo no interactivo (base color neutral; lo sobrescribimos en 1.4). Detecta Tailwind v4 / Next 16 / React 19 automáticamente.**
```bash
npx shadcn@latest init -d
```
Esperado: crea `components.json`, `lib/utils.ts` (con `cn`), reescribe `app/globals.css` con bloque de tokens + `@theme inline` + `@layer base`, e instala dependencias de soporte. Confirma el formato exacto del `globals.css` generado: en 1.4 se reemplaza el bloque de tokens.
- [ ] **Step 3: Añade el set base de componentes.**
```bash
npx shadcn@latest add -y button input table dialog sheet drawer dropdown-menu card badge skeleton sonner command tabs select form label
```
Esperado: archivos creados en `components/ui/`; `npm` añade `vaul`, `@radix-ui/*`, etc. sin conflicto de peer-deps con React 19.
- [ ] **Step 4: Verifica build (los componentes y `cn` deben tipar correctamente).** Comando: `npm run build`. Esperado: `✓ Compiled successfully`.
- [ ] **Step 5: Commit.**
```bash
git add components.json lib/utils.ts components/ui app/globals.css package.json package-lock.json
git commit -m "feat(ui): inicializa shadcn/ui para tailwind v4 y agrega componentes base"
```

### Task 1.4: Tokens de marca SIR en globals.css (`:root` HSL + `@theme inline`)

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: variables HSL triplete en `:root` (`--primary: 222 47% 20%`, etc.) + extras de marca (`--navy*`, `--teal*`).
- Produces: mapeo `@theme inline { --color-*: hsl(var(--*)) }` → clases Tailwind `bg-primary`, `text-accent`, `border`, `ring`, `bg-teal`, etc. Cero hex repetidos en componentes.
- Consumes: bloque `@theme inline`/`@layer base` que shadcn generó en 1.3 (se reescribe respetando su estructura).

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` para confirmar que `@theme inline` y `@layer base` son la vía v4 vigente, y reutiliza las directivas que shadcn escribió (`@custom-variant dark`, `@import "tw-animate-css"`) en lugar de inventarlas.**
- [ ] **Step 2: Reemplaza el cuerpo de `app/globals.css` con los tokens de SIR en formato triplete HSL + `@theme inline` con `hsl(var(--token))` (formato dictado por el spec). Conserva la línea `@import "tw-animate-css"` y `@custom-variant dark` si shadcn las generó.**
```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;
  --primary: 222 47% 20%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 20% 96%;
  --secondary-foreground: 222 47% 11%;
  --muted: 220 15% 95%;
  --muted-foreground: 220 10% 45%;
  --accent: 181 25% 47%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 15% 90%;
  --input: 220 15% 90%;
  --ring: 222 47% 20%;
  --radius: 0.75rem;
  --navy: 222 47% 20%;
  --navy-dark: 222 47% 11%;
  --navy-light: 222 30% 35%;
  --teal: 181 25% 47%;
  --teal-dark: 181 30% 35%;
  --teal-light: 181 26% 72%;
  --teal-muted: 181 20% 85%;
}

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-navy: hsl(var(--navy));
  --color-navy-dark: hsl(var(--navy-dark));
  --color-navy-light: hsl(var(--navy-light));
  --color-teal: hsl(var(--teal));
  --color-teal-dark: hsl(var(--teal-dark));
  --color-teal-light: hsl(var(--teal-light));
  --color-teal-muted: hsl(var(--teal-muted));
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --font-sans: var(--font-sans);
  --font-display: var(--font-display);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```
- [ ] **Step 3: Verifica que las clases de los tokens compilan y que el placeholder (`text-muted-foreground`) resuelve.** Comando: `npm run build`. Esperado: `✓ Compiled successfully` sin warnings de clases desconocidas.
- [ ] **Step 4: Commit.**
```bash
git add app/globals.css
git commit -m "feat(theme): aplica tokens de marca SIR (navy/teal) en globals.css"
```

### Task 1.5: Fuentes Poppins+Inter, layout en español, metadata/viewport y Providers (TanStack Query)

**Files:**
- Create: `app/providers.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `Providers({ children }: { children: React.ReactNode })` — Client Component con `QueryClientProvider` + `<Toaster />` de sonner.
- Produces: `RootLayout` con `lang="es"`, variables de fuente `--font-display` (Poppins) y `--font-sans` (Inter), `metadata` SIR y `viewport.themeColor = "#14b8a6"`.
- Consumes: `@tanstack/react-query`, `sonner` (instalados en 1.2/1.3), tokens de 1.4.

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` y `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` y aplica la API vigente: Inter es variable (sin `weight`), Poppins NO es variable (requiere `weight: [...]`); ambas con `variable` + `display: 'swap'`.**
- [ ] **Step 2: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` y `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-viewport.md`: usa el objeto estático `metadata: Metadata` y un export separado `viewport: Viewport` para `themeColor` (no va dentro de `metadata` en Next 16).**
- [ ] **Step 3: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` y crea `app/providers.tsx` como entry point de cliente (`'use client'` en la primera línea), con un único `QueryClient` memorizado vía `useState`.**
```tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
```
- [ ] **Step 4: Reescribe `app/layout.tsx` con las fuentes, `lang="es"`, `metadata`, `viewport` y `<Providers>`.**
```tsx
import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SIR CRM",
    template: "%s · SIR CRM",
  },
  description: "Plataforma interna de Sir Talent CA — staffing y RRHH.",
  applicationName: "SIR CRM",
};

export const viewport: Viewport = {
  themeColor: "#14b8a6",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```
- [ ] **Step 5: Verifica que las fuentes se descargan en build y el layout tipa.** Comando: `npm run build`. Esperado: `✓ Compiled successfully` (sin errores de `next/font` ni de `Viewport`/`Metadata`).
- [ ] **Step 6: Commit.**
```bash
git add app/layout.tsx app/providers.tsx
git commit -m "feat(theme): configura Poppins+Inter, metadata SIR y Providers (tanstack query)"
```

### Task 1.6: Helpers de formato (Quetzales / fechas es-GT) + setup Vitest y test

**Files:**
- Create: `lib/format/index.ts`
- Create: `lib/format/format.test.ts`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (script `test`, devDeps de Vitest/Testing Library)
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `formatCurrency(value: number): string` (GTQ, locale `es-GT`); `formatNumber(value: number): string`; `formatPercent(value: number, fractionDigits?: number): string` (recibe fracción 0–1); `formatDate(value: string | number | Date): string`; `formatDateTime(value: string | number | Date): string`.
- Consumes: `Intl.NumberFormat` / `Intl.DateTimeFormat` (locale `es-GT`).

- [ ] **Step 1: Instala el runner y Testing Library compatibles con React 19 / Next 16 (Vitest + jsdom + plugin-react).**
```bash
npm install -D vitest@^3 @vitejs/plugin-react@^4 jsdom@^25 @testing-library/react@^16 @testing-library/dom@^10 @testing-library/jest-dom@^6
```
Esperado: instala sin `UNMET PEER DEPENDENCY` contra React 19. (`@testing-library/react@16` declara soporte React 19.)
- [ ] **Step 2: Crea `vitest.setup.ts` (matchers de jest-dom para fases con componentes).**
```ts
import "@testing-library/jest-dom/vitest";
```
- [ ] **Step 3: Crea `vitest.config.ts` con `@vitejs/plugin-react`, entorno `jsdom`, alias `@` y setup.**
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
  },
});
```
- [ ] **Step 4: Crea `lib/format/index.ts`.**
```ts
const LOCALE = "es-GT";

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat(LOCALE);

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" });

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(value: string | number | Date): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | number | Date): string {
  return dateTimeFormatter.format(new Date(value));
}
```
- [ ] **Step 5: Crea `lib/format/format.test.ts` (aserciones tolerantes al ICU del entorno).**
```ts
import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
} from "./index";

describe("formato es-GT", () => {
  it("formatea Quetzales con separador de miles y 2 decimales", () => {
    const out = formatCurrency(1500);
    expect(out).toMatch(/Q/i);
    expect(out).toMatch(/1[.,\s]?500/);
    expect(out).toMatch(/00$/);
  });

  it("formatea números con separador de miles", () => {
    expect(formatNumber(12345)).toMatch(/12[.,\s]?345/);
  });

  it("formatea porcentaje desde una fracción 0–1", () => {
    const out = formatPercent(0.25);
    expect(out).toContain("25");
    expect(out).toContain("%");
  });

  it("formatea una fecha ISO sin lanzar y con el año", () => {
    expect(formatDate("2026-06-27")).toContain("2026");
  });
});
```
- [ ] **Step 6: Añade el script `test` a `package.json` (`"test": "vitest run"`).** Aplica la edición sobre el bloque `"scripts"`.
- [ ] **Step 7: Corre la suite.** Comando: `npm test`. Esperado: `Test Files  1 passed (1)` y `Tests  4 passed (4)`.
- [ ] **Step 8: Verifica que el build sigue limpio (los archivos de test no deben romper el typecheck de Next).** Comando: `npm run build`. Esperado: `✓ Compiled successfully`.
- [ ] **Step 9: Commit.**
```bash
git add lib/format vitest.config.ts vitest.setup.ts package.json package-lock.json
git commit -m "feat(format): helpers de Quetzales y fechas es-GT con Vitest"
```

### Task 1.7: `.env.example` y verificación final del build

**Files:**
- Create: `.env.example`

**Interfaces:**
- Produces: `.env.example` documentando `SIR_API_URL` (server-side) y la nota de `NODE_ENV` para cookies `Secure` en producción (fase 2).

- [ ] **Step 1: Confirma que `.env*` está ignorado pero `.env.example` se versiona.** Comando: `git check-ignore .env.example`. Esperado: sin salida (no ignorado); el patrón `.env*` del `.gitignore` no afecta porque se añade explícitamente, pero valida con el siguiente paso que `git add -f` no sea necesario. Si la salida muestra `.env.example`, usa `git add -f` en el commit.
- [ ] **Step 2: Crea `.env.example`.**
```bash
# URL base del backend NestJS (server-side, NO expuesta al cliente).
# El BFF (route handlers/proxy) adjunta el Bearer; el frontend nunca ve tokens del backend.
SIR_API_URL=http://localhost:3000/api

# production => cookies de sesión con Secure (lo gestiona el BFF en fase 2).
NODE_ENV=development
```
- [ ] **Step 3: Verificación final de cimientos: build de producción + suite de tests.** Comandos:
```bash
npm run build
npm test
```
Esperado: `✓ Compiled successfully` con la ruta `/` listada, y `Tests  4 passed (4)`.
- [ ] **Step 4: Commit (usa `-f` solo si el Step 1 marcó `.env.example` como ignorado).**
```bash
git add -f .env.example
git commit -m "chore(env): documenta SIR_API_URL en .env.example"
```


## Fase 2 — BFF Auth + Shell

### Task 2.1: Configurar Vitest (Next 16 + React 19) y tipos base del API

**Files:**
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `test/stubs/server-only.ts`
- Create: `lib/api/types.ts`
- Create: `.env.example`
- Test: `test/lib/api/unwrap.test.ts`
- Modify: `package.json` (scripts de test)

**Interfaces:**
- Produces: `interface ApiSuccess<T> { ok: true; message: string; data: T }`
- Produces: `interface ApiFailure { ok: false; message: string; path?: string }`
- Produces: `type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure`
- Produces: `interface Paginated<T> { items: T[]; total: number; page: number; limit: number }`
- Produces: `class ApiError extends Error { status: number; path?: string }`
- Produces: `function unwrap<T>(envelope: ApiEnvelope<T> | null, status: number): T`

- [ ] **Step 1: Instalar dependencias de prueba.** Comando exacto:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```
Esperado: `added N packages` sin errores de peer-deps bloqueantes (React 19 soportado).

- [ ] **Step 2: Registrar scripts de test.** Comando:
```bash
npm pkg set scripts.test="vitest run" scripts.test:watch="vitest"
```
Esperado: sin salida; `package.json` queda con `"test"` y `"test:watch"`.

- [ ] **Step 3: Stub de `server-only` para Vitest.** Vitest no es un bundler de servidor de Next; los módulos con `import 'server-only'` lanzarían al importarse en node, así que se aliasa a un módulo vacío. `test/stubs/server-only.ts`:
```ts
export {}
```

- [ ] **Step 4: Config de Vitest** (alias `@` + alias del stub). `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      'server-only': resolve(__dirname, 'test/stubs/server-only.ts'),
    },
  },
})
```

- [ ] **Step 5: Setup de Testing Library.** `test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Tipos y `unwrap` del API** (puros, sin `server-only`). `lib/api/types.ts`:
```ts
export interface ApiSuccess<T> {
  ok: true
  message: string
  data: T
}

export interface ApiFailure {
  ok: false
  message: string
  path?: string
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export class ApiError extends Error {
  readonly status: number
  readonly path?: string

  constructor(message: string, status: number, path?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.path = path
  }
}

/** Desenvuelve el envelope del backend; lanza ApiError(message) en error. */
export function unwrap<T>(envelope: ApiEnvelope<T> | null, status: number): T {
  if (envelope && envelope.ok) {
    return envelope.data
  }
  const message = envelope?.message ?? 'Error de red'
  const path = envelope && !envelope.ok ? envelope.path : undefined
  throw new ApiError(message, status, path)
}
```

- [ ] **Step 7: `.env.example`** (solo env server-side; tokens viven en cookies httpOnly). `.env.example`:
```bash
# Base del backend NestJS (server-side, prefijo /api incluido)
SIR_API_URL=http://localhost:3000/api
```

- [ ] **Step 8: Test del unwrap.** `test/lib/api/unwrap.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { ApiError, unwrap, type ApiEnvelope } from '@/lib/api/types'

describe('unwrap', () => {
  it('devuelve data en éxito', () => {
    const env: ApiEnvelope<{ id: string }> = { ok: true, message: 'ok', data: { id: '1' } }
    expect(unwrap(env, 200)).toEqual({ id: '1' })
  })

  it('lanza ApiError con message del backend', () => {
    const env: ApiEnvelope<unknown> = { ok: false, message: 'Credenciales inválidas', path: '/auth/login' }
    try {
      unwrap(env, 401)
      throw new Error('no lanzó')
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).message).toBe('Credenciales inválidas')
      expect((e as ApiError).status).toBe(401)
      expect((e as ApiError).path).toBe('/auth/login')
    }
  })

  it('lanza con mensaje por defecto si el envelope es null', () => {
    expect(() => unwrap(null, 500)).toThrow('Error de red')
  })
})
```

- [ ] **Step 9: Verificar.** Comando:
```bash
npm run test
```
Esperado: `Test Files 1 passed`, `Tests 3 passed`.

- [ ] **Step 10: Commit.** Comando:
```bash
git add vitest.config.ts test/setup.ts test/stubs/server-only.ts test/lib/api/unwrap.test.ts lib/api/types.ts .env.example package.json package-lock.json
git commit -m "test: configura Vitest y agrega tipos base del API (envelope/unwrap)"
```

---

### Task 2.2: Helpers de cookies de sesión (httpOnly)

**Files:**
- Create: `lib/auth/cookie-names.ts`
- Create: `lib/auth/cookies.ts`

**Interfaces:**
- Produces: `const ACCESS_COOKIE = 'sir_access'`, `const REFRESH_COOKIE = 'sir_refresh'` (en `cookie-names.ts`, sin `server-only` para que `proxy.ts` los importe sin arrastrar `next/headers`)
- Produces: `function getAccessToken(): Promise<string | undefined>`
- Produces: `function getRefreshToken(): Promise<string | undefined>`
- Produces: `function setAuthCookies(accessToken: string, refreshToken: string): Promise<void>`
- Produces: `function clearAuthCookies(): Promise<void>`
- Consumes: `cookies()` de `next/headers` (Next 16)

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md` y usa la API vigente.** Confirmado: en Next 16 `cookies()` es **async** (`const store = await cookies()`); `store.set(name, value, options)` y `store.delete(name)` solo son válidos en Route Handler o Server Function (no en render de Server Component) — por eso `set/clear` se invocarán desde route handlers y, en `serverFetch`, dentro de `try/catch`.

- [ ] **Step 2: Constantes de cookie aisladas.** `lib/auth/cookie-names.ts`:
```ts
export const ACCESS_COOKIE = 'sir_access'
export const REFRESH_COOKIE = 'sir_refresh'
```

- [ ] **Step 3: Helpers server-side.** `lib/auth/cookies.ts`:
```ts
import 'server-only'
import { cookies } from 'next/headers'
import { ACCESS_COOKIE, REFRESH_COOKIE } from './cookie-names'

export { ACCESS_COOKIE, REFRESH_COOKIE }

const isProd = process.env.NODE_ENV === 'production'
const ACCESS_MAX_AGE = 60 * 15 // 15 min
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

const baseOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
} as const

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value
}

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const store = await cookies()
  store.set(ACCESS_COOKIE, accessToken, { ...baseOptions, maxAge: ACCESS_MAX_AGE })
  store.set(REFRESH_COOKIE, refreshToken, { ...baseOptions, maxAge: REFRESH_MAX_AGE })
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
}
```

- [ ] **Step 4: Commit.** Comando:
```bash
git add lib/auth/cookie-names.ts lib/auth/cookies.ts
git commit -m "feat(auth): helpers de cookies httpOnly de sesión (sir_access/sir_refresh)"
```

---

### Task 2.3: `serverFetch` + rotación de refresh (TDD)

**Files:**
- Create: `lib/auth/refresh.ts`
- Create: `lib/api/server-fetch.ts`
- Test: `test/lib/auth/refresh.test.ts`
- Test: `test/lib/api/server-fetch.test.ts`

**Interfaces:**
- Produces: `function refreshSession(): Promise<string | null>` (llama `POST {SIR_API_URL}/auth/refresh`, rota ambas cookies, devuelve nuevo access o `null` y limpia cookies en fallo)
- Produces: `interface ServerFetchOptions extends Omit<RequestInit, 'body'> { body?: unknown; params?: Record<string, string | number | boolean | undefined | null> }`
- Produces: `interface ServerResponse<T> { status: number; envelope: ApiEnvelope<T> | null }`
- Produces: `function serverRequest<T>(path: string, init?: ServerFetchOptions): Promise<ServerResponse<T>>` (Bearer + reintento único tras refresh)
- Produces: `function serverFetch<T>(path: string, init?: ServerFetchOptions): Promise<T>` (serverRequest + unwrap)
- Consumes: `getAccessToken`, `getRefreshToken`, `setAuthCookies`, `clearAuthCookies` (Task 2.2), `unwrap`/`ApiError` (Task 2.1)

- [ ] **Step 1 (TDD): test de `refreshSession`.** `test/lib/auth/refresh.test.ts`:
```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/cookies', () => ({
  getRefreshToken: vi.fn(),
  setAuthCookies: vi.fn(),
  clearAuthCookies: vi.fn(),
}))

import { clearAuthCookies, getRefreshToken, setAuthCookies } from '@/lib/auth/cookies'
import { refreshSession } from '@/lib/auth/refresh'

const fetchMock = vi.fn()

beforeEach(() => {
  process.env.SIR_API_URL = 'http://api.test/api'
  vi.stubGlobal('fetch', fetchMock)
  vi.mocked(getRefreshToken).mockReset()
  vi.mocked(setAuthCookies).mockReset()
  vi.mocked(clearAuthCookies).mockReset()
  fetchMock.mockReset()
})

afterEach(() => vi.unstubAllGlobals())

describe('refreshSession', () => {
  it('devuelve null sin llamar al backend si no hay refresh token', async () => {
    vi.mocked(getRefreshToken).mockResolvedValue(undefined)
    expect(await refreshSession()).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rota ambas cookies y devuelve el nuevo access en éxito', async () => {
    vi.mocked(getRefreshToken).mockResolvedValue('old-refresh')
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, message: 'ok', data: { accessToken: 'A2', refreshToken: 'R2' } }),
    })
    const token = await refreshSession()
    expect(token).toBe('A2')
    expect(setAuthCookies).toHaveBeenCalledWith('A2', 'R2')
    expect(clearAuthCookies).not.toHaveBeenCalled()
  })

  it('limpia cookies y devuelve null si el refresh falla', async () => {
    vi.mocked(getRefreshToken).mockResolvedValue('old-refresh')
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ ok: false, message: 'expirado' }),
    })
    expect(await refreshSession()).toBeNull()
    expect(clearAuthCookies).toHaveBeenCalledOnce()
    expect(setAuthCookies).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Implementar `refreshSession`.** `lib/auth/refresh.ts`:
```ts
import 'server-only'
import { clearAuthCookies, getRefreshToken, setAuthCookies } from './cookies'
import type { ApiEnvelope } from '@/lib/api/types'

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

/**
 * Llama POST {SIR_API_URL}/auth/refresh con sir_refresh, rota ambas cookies y
 * devuelve el nuevo accessToken. Devuelve null (y limpia cookies) si falla.
 * Los writes van en try/catch porque cookies().set lanza durante el render de un
 * Server Component; en ese contexto el token igual sirve para el reintento en vuelo.
 */
export async function refreshSession(): Promise<string | null> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return null

  const res = await fetch(`${process.env.SIR_API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  })

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<AuthTokens> | null

  if (!res.ok || !envelope || !envelope.ok) {
    await safeClear()
    return null
  }

  try {
    await setAuthCookies(envelope.data.accessToken, envelope.data.refreshToken)
  } catch {
    // Contexto de render: no se puede persistir; el token se usa para el reintento.
  }
  return envelope.data.accessToken
}

async function safeClear(): Promise<void> {
  try {
    await clearAuthCookies()
  } catch {
    // ignorar en contextos no mutables
  }
}
```

- [ ] **Step 3: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md` y `08-caching.md` y usa la API vigente.** Para datos dinámicos por request, usa `fetch(..., { cache: 'no-store' })` (no cachear datos de sesión).

- [ ] **Step 4: Test de `serverRequest`/`serverFetch`** (reintento tras 401 + unwrap). `test/lib/api/server-fetch.test.ts`:
```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/cookies', () => ({ getAccessToken: vi.fn() }))
vi.mock('@/lib/auth/refresh', () => ({ refreshSession: vi.fn() }))

import { getAccessToken } from '@/lib/auth/cookies'
import { refreshSession } from '@/lib/auth/refresh'
import { serverFetch } from '@/lib/api/server-fetch'
import { ApiError } from '@/lib/api/types'

const fetchMock = vi.fn()

beforeEach(() => {
  process.env.SIR_API_URL = 'http://api.test/api'
  vi.stubGlobal('fetch', fetchMock)
  vi.mocked(getAccessToken).mockReset()
  vi.mocked(refreshSession).mockReset()
  fetchMock.mockReset()
})

afterEach(() => vi.unstubAllGlobals())

const jsonRes = (status: number, body: unknown) => ({
  status,
  json: async () => body,
})

describe('serverFetch', () => {
  it('adjunta Bearer y devuelve data desenvuelta', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('A1')
    fetchMock.mockResolvedValue(jsonRes(200, { ok: true, message: 'ok', data: { id: '7' } }))
    const data = await serverFetch<{ id: string }>('/auth/me')
    expect(data).toEqual({ id: '7' })
    const [, init] = fetchMock.mock.calls[0]
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer A1')
  })

  it('ante 401 refresca y reintenta UNA vez con el nuevo token', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('A1')
    vi.mocked(refreshSession).mockResolvedValue('A2')
    fetchMock
      .mockResolvedValueOnce(jsonRes(401, { ok: false, message: 'no auth' }))
      .mockResolvedValueOnce(jsonRes(200, { ok: true, message: 'ok', data: 42 }))
    const data = await serverFetch<number>('/metrics/overview')
    expect(data).toBe(42)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect((fetchMock.mock.calls[1][1].headers as Headers).get('Authorization')).toBe('Bearer A2')
  })

  it('lanza ApiError 401 si el refresh falla', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('A1')
    vi.mocked(refreshSession).mockResolvedValue(null)
    fetchMock.mockResolvedValue(jsonRes(401, { ok: false, message: 'no auth' }))
    await expect(serverFetch('/clients')).rejects.toBeInstanceOf(ApiError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 5: Implementar `server-fetch.ts`.** `lib/api/server-fetch.ts`:
```ts
import 'server-only'
import { getAccessToken } from '@/lib/auth/cookies'
import { refreshSession } from '@/lib/auth/refresh'
import { ApiError, unwrap, type ApiEnvelope } from './types'

const BASE = process.env.SIR_API_URL

export interface ServerFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
}

export interface ServerResponse<T> {
  status: number
  envelope: ApiEnvelope<T> | null
}

function buildUrl(path: string, params?: ServerFetchOptions['params']): string {
  const url = new URL(`${BASE}${path.startsWith('/') ? path : `/${path}`}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function rawFetch(url: string, token: string | undefined, init: ServerFetchOptions): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let body: BodyInit | undefined
  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(init.body)
  }

  return fetch(url, { ...init, headers, body, cache: 'no-store' })
}

export async function serverRequest<T>(path: string, init: ServerFetchOptions = {}): Promise<ServerResponse<T>> {
  const url = buildUrl(path, init.params)
  const token = await getAccessToken()
  let res = await rawFetch(url, token, init)

  if (res.status === 401) {
    const newToken = await refreshSession()
    if (newToken) {
      res = await rawFetch(url, newToken, init)
    }
  }

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<T> | null
  return { status: res.status, envelope }
}

export async function serverFetch<T>(path: string, init: ServerFetchOptions = {}): Promise<T> {
  const { status, envelope } = await serverRequest<T>(path, init)
  if (!envelope) throw new ApiError('Respuesta inválida del servidor', status)
  return unwrap(envelope, status)
}
```

- [ ] **Step 6: Verificar.** Comando:
```bash
npm run test
```
Esperado: `Test Files 3 passed`, todos los tests de refresh y server-fetch en verde.

- [ ] **Step 7: Commit.** Comando:
```bash
git add lib/auth/refresh.ts lib/api/server-fetch.ts test/lib/auth/refresh.test.ts test/lib/api/server-fetch.test.ts
git commit -m "feat(api): serverFetch con Bearer y rotacion de refresh ante 401"
```

---

### Task 2.4: `clientFetch` (same-origin hacia el proxy)

**Files:**
- Create: `lib/api/client.ts`

**Interfaces:**
- Produces: `interface ClientFetchOptions extends Omit<RequestInit, 'body'> { body?: unknown; params?: Record<string, string | number | boolean | undefined | null> }`
- Produces: `function clientFetch<T>(path: string, init?: ClientFetchOptions): Promise<T>` (pega a `/api/proxy/<path>`, manda cookies httpOnly automáticamente, desenvuelve envelope)
- Consumes: `unwrap`/`ApiError` (Task 2.1)

- [ ] **Step 1: Implementar `client.ts`** (sin `server-only`; lo usan Client Components vía TanStack Query). `lib/api/client.ts`:
```ts
import { ApiError, unwrap, type ApiEnvelope } from './types'

export interface ClientFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
}

function buildPath(path: string, params?: ClientFetchOptions['params']): string {
  const base = `/api/proxy${path.startsWith('/') ? path : `/${path}`}`
  if (!params) return base
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) qs.set(key, String(value))
  }
  const search = qs.toString()
  return search ? `${base}?${search}` : base
}

export async function clientFetch<T>(path: string, init: ClientFetchOptions = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  let body: BodyInit | undefined
  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(init.body)
  }

  const res = await fetch(buildPath(path, init.params), {
    ...init,
    headers,
    body,
    credentials: 'same-origin',
  })

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<T> | null
  if (res.status === 401) {
    throw new ApiError(envelope?.message ?? 'No autenticado', 401)
  }
  if (!envelope) throw new ApiError('Respuesta inválida del servidor', res.status)
  return unwrap(envelope, res.status)
}
```

- [ ] **Step 2: Commit.** Comando:
```bash
git add lib/api/client.ts
git commit -m "feat(api): clientFetch same-origin hacia el proxy del BFF"
```

---

### Task 2.5: Route Handlers de auth (login / refresh / logout)

**Files:**
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/refresh/route.ts`
- Create: `app/api/auth/logout/route.ts`

**Interfaces:**
- Produces: `POST /api/auth/login` body `{ username, password }` → setea cookies, responde `{ ok, message, data: null }`
- Produces: `POST /api/auth/refresh` → rota cookies vía `refreshSession`
- Produces: `POST /api/auth/logout` → llama backend logout + limpia cookies
- Consumes: `setAuthCookies`, `getAccessToken`, `clearAuthCookies` (2.2), `refreshSession` (2.3)

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` y usa la API vigente.** Confirmado: handlers se exportan por método (`export async function POST(request: Request)`); `POST` no se cachea; usar `NextResponse.json`. `cookies().set` es válido aquí (Route Handler).

- [ ] **Step 2: Login handler.** `app/api/auth/login/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { setAuthCookies } from '@/lib/auth/cookies'
import type { ApiEnvelope } from '@/lib/api/types'

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export async function POST(request: Request) {
  const credentials = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null

  if (!credentials?.username || !credentials?.password) {
    return NextResponse.json({ ok: false, message: 'Usuario y contraseña son obligatorios' }, { status: 400 })
  }

  const res = await fetch(`${process.env.SIR_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: credentials.username, password: credentials.password }),
    cache: 'no-store',
  })

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<AuthTokens> | null

  if (!res.ok || !envelope || !envelope.ok) {
    return NextResponse.json(
      { ok: false, message: envelope?.message ?? 'Credenciales inválidas' },
      { status: res.status >= 400 ? res.status : 401 },
    )
  }

  await setAuthCookies(envelope.data.accessToken, envelope.data.refreshToken)
  return NextResponse.json({ ok: true, message: 'Sesión iniciada', data: null })
}
```

- [ ] **Step 3: Refresh handler.** `app/api/auth/refresh/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { refreshSession } from '@/lib/auth/refresh'

export async function POST() {
  const token = await refreshSession()
  if (!token) {
    return NextResponse.json({ ok: false, message: 'Sesión expirada' }, { status: 401 })
  }
  return NextResponse.json({ ok: true, message: 'Sesión renovada', data: null })
}
```

- [ ] **Step 4: Logout handler.** `app/api/auth/logout/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { clearAuthCookies, getAccessToken } from '@/lib/auth/cookies'

export async function POST() {
  const token = await getAccessToken()
  if (token) {
    await fetch(`${process.env.SIR_API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }).catch(() => undefined)
  }
  await clearAuthCookies()
  return NextResponse.json({ ok: true, message: 'Sesión cerrada', data: null })
}
```

- [ ] **Step 5: Commit.** Comando:
```bash
git add app/api/auth/login/route.ts app/api/auth/refresh/route.ts app/api/auth/logout/route.ts
git commit -m "feat(auth): route handlers BFF login/refresh/logout con cookies httpOnly"
```

---

### Task 2.6: Proxy genérico `app/api/proxy/[...path]`

**Files:**
- Create: `app/api/proxy/[...path]/route.ts`

**Interfaces:**
- Produces: `GET|POST|PUT|PATCH|DELETE /api/proxy/<...path>` → reenvía a `{SIR_API_URL}/<...path>` con Bearer + refresh, relaya envelope y status del backend tal cual
- Consumes: `serverRequest`, `ServerFetchOptions` (2.3)

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` (sección Route Context Helper) y usa la API vigente.** Confirmado: para `[...path]` se tipa el contexto con el helper global `RouteContext<'/api/proxy/[...path]'>` y `ctx.params` es **async** (`await ctx.params`), con `path: string[]`. Los tipos se generan en `next dev`/`next build`/`next typegen`.

- [ ] **Step 2: Handler que relaya envelope+status.** `app/api/proxy/[...path]/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { serverRequest, type ServerFetchOptions } from '@/lib/api/server-fetch'

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH'])

async function handle(request: Request, ctx: RouteContext<'/api/proxy/[...path]'>) {
  const { path } = await ctx.params
  const segments = path.join('/')
  const search = new URL(request.url).search
  const target = `/${segments}${search}`

  const init: ServerFetchOptions = { method: request.method }
  if (METHODS_WITH_BODY.has(request.method)) {
    init.body = await request.json().catch(() => undefined)
  }

  const { status, envelope } = await serverRequest(target, init)
  if (!envelope) {
    return NextResponse.json({ ok: false, message: 'Respuesta inválida del servidor' }, { status })
  }
  return NextResponse.json(envelope, { status })
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
```

- [ ] **Step 3: Verificar typegen.** Comando:
```bash
npx next typegen
```
Esperado: genera tipos sin error; `RouteContext<'/api/proxy/[...path]'>` queda resuelto.

- [ ] **Step 4: Commit.** Comando:
```bash
git add app/api/proxy/[...path]/route.ts
git commit -m "feat(api): proxy [...path] que relaya el backend con auth+refresh"
```

---

### Task 2.7: Protección de rutas (Next 16 usa `proxy.ts`, no `middleware.ts`)

**Files:**
- Create: `proxy.ts` (raíz del proyecto)

**Interfaces:**
- Produces: redirección optimista por presencia de cookie de sesión: sin sesión → `/login?redirect=<path>`; con sesión en `/login` o `/` → `/dashboard`
- Consumes: `ACCESS_COOKIE`, `REFRESH_COOKIE` desde `cookie-names.ts` (sin `server-only`)

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` y la guía `02-guides/authentication.md` (sección "Optimistic checks with Proxy") y usa la API vigente.** Confirmado (BREAKING Next 16): `middleware.ts` está **deprecado y renombrado a `proxy.ts`**; el archivo va en la **raíz** (nivel de `app/`), exporta función `proxy(request: NextRequest)` (default o nombrada) + `config.matcher`; corre en runtime Node.js. La comprobación debe ser **optimista** (solo leer la cookie, sin llamadas a DB/backend) porque corre en cada ruta, incluidas prefetch. Se importan solo las constantes (no `next/headers`) para mantener el bundle del proxy liviano.

- [ ] **Step 2: Implementar `proxy.ts`.** `proxy.ts`:
```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth/cookie-names'

const PUBLIC_PATHS = ['/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE)
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = hasSession ? '/dashboard' : '/login'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (hasSession && isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Excluye API (incluido /api/auth y /api/proxy), assets de _next y archivos con extensión.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
```

- [ ] **Step 3: Commit.** Comando:
```bash
git add proxy.ts
git commit -m "feat(auth): proxy.ts (Next 16) protege rutas por cookie de sesion"
```

---

### Task 2.8: Login — esquema Zod (TDD), página y formulario

**Files:**
- Create: `lib/auth/login-schema.ts`
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/login/login-form.tsx`
- Test: `test/lib/auth/login-schema.test.ts`

**Interfaces:**
- Produces: `const loginSchema: z.ZodType` con `{ username: string(min 1), password: string(min 1) }`
- Produces: `type LoginInput = z.infer<typeof loginSchema>`
- Consumes: route handler `POST /api/auth/login` (2.5); componentes shadcn `form`, `input`, `button`, `label`, `sonner`; `useRouter` de `next/navigation`

- [ ] **Step 1: Instalar deps de formulario + componentes shadcn necesarios** (idempotente; algunos pueden venir de Fase 1). Comando:
```bash
npm install react-hook-form @hookform/resolvers zod sonner
npx shadcn@latest add button input label form sonner
```
Esperado: componentes creados en `components/ui/` (button, input, label, form, sonner) sin sobrescribir tokens de marca.

- [ ] **Step 2 (TDD): test del esquema.** `test/lib/auth/login-schema.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { loginSchema } from '@/lib/auth/login-schema'

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    expect(loginSchema.safeParse({ username: 'admin', password: 'secret' }).success).toBe(true)
  })

  it('rechaza usuario vacío', () => {
    const r = loginSchema.safeParse({ username: '  ', password: 'secret' })
    expect(r.success).toBe(false)
  })

  it('rechaza contraseña vacía', () => {
    expect(loginSchema.safeParse({ username: 'admin', password: '' }).success).toBe(false)
  })
})
```

- [ ] **Step 3: Esquema.** `lib/auth/login-schema.ts`:
```ts
import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export type LoginInput = z.infer<typeof loginSchema>
```

- [ ] **Step 4: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` (sección searchParams) y `03-api-reference/01-directives/use-client.md` y usa la API vigente.** Confirmado: en Next 16 `searchParams` de una page es **`Promise`** (`await searchParams`); el formulario interactivo va en un Client Component con `'use client'`.

- [ ] **Step 5: Layout del grupo auth** (centrado, fondo de marca). `app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      {children}
    </div>
  )
}
```

- [ ] **Step 6: Página de login** (Server Component que lee `searchParams`). `app/(auth)/login/page.tsx`:
```tsx
import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams
  const target = redirect && redirect.startsWith('/') ? redirect : '/dashboard'
  return <LoginForm redirectTo={target} />
}
```

- [ ] **Step 7: Formulario cliente (RHF + Zod + shadcn + sonner).** `app/(auth)/login/login-form.tsx`:
```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { loginSchema, type LoginInput } from '@/lib/auth/login-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  async function onSubmit(values: LoginInput) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      credentials: 'same-origin',
    })
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    if (!res.ok) {
      toast.error(body?.message ?? 'No se pudo iniciar sesión')
      return
    }
    router.replace(redirectTo)
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 space-y-1 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
          SIR CRM
        </h1>
        <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input autoComplete="username" autoFocus {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
```

- [ ] **Step 8: Verificar tests.** Comando:
```bash
npm run test
```
Esperado: incluye `login-schema.test.ts` con 3 tests en verde.

- [ ] **Step 9: Commit.** Comando:
```bash
git add lib/auth/login-schema.ts "app/(auth)" test/lib/auth/login-schema.test.ts components/ui package.json package-lock.json
git commit -m "feat(auth): pantalla de login con RHF+Zod contra el BFF"
```

---

### Task 2.9: Sesión del usuario — roles, nav, DAL `getMe` y hooks `useMe`/`useLogout` (TDD roles/nav)

**Files:**
- Create: `lib/auth/types.ts`
- Create: `lib/auth/roles.ts`
- Create: `lib/auth/nav.ts`
- Create: `lib/auth/me.ts`
- Create: `lib/api/hooks/use-me.ts`
- Create: `lib/api/hooks/use-logout.ts`
- Test: `test/lib/auth/nav.test.ts`

**Interfaces:**
- Produces: `interface Me { id: string; username: string; roles: MeRole[]; employee: MeEmployee | null }` (espeja `GET /auth/me`)
- Produces: `function hasRole(me, role): boolean`, `function isAdmin(me): boolean`
- Produces: `interface NavItem`, `interface NavGroup`, `const NAV_GROUPS`, `function visibleGroups(isAdmin: boolean): NavGroup[]`, `function labelForHref(pathname: string): string`
- Produces: `const getMe = cache(() => Promise<Me>)` (redirige a `/login` en 401)
- Produces: `function useMe()` (TanStack Query, key `['me']`), `function useLogout()`
- Consumes: `serverFetch` (2.3), `clientFetch` (2.4), `lucide-react`, `@tanstack/react-query`

- [ ] **Step 1: Instalar TanStack Query + iconos** (idempotente; Fase 1 ya pudo instalarlos y montar el `QueryProvider` en `app/layout.tsx`). Comando:
```bash
npm install @tanstack/react-query lucide-react
```
Esperado: paquetes presentes. Nota: este plan asume que el `QueryClientProvider` ya está montado por Fase 1; si no, montarlo en `app/layout.tsx` antes de usar los hooks.

- [ ] **Step 2: Tipos de `Me`** (campos espejan `GET /auth/me` del backend; confirmar contra el DTO real). `lib/auth/types.ts`:
```ts
export interface MeRole {
  id: string
  name: string
}

export interface MeEmployee {
  id: string
  firstName: string
  lastName: string
}

export interface Me {
  id: string
  username: string
  roles: MeRole[]
  employee: MeEmployee | null
}
```

- [ ] **Step 3: Helpers de rol** (puros, reutilizables en server/cliente/tests). `lib/auth/roles.ts`:
```ts
import type { Me } from './types'

export function hasRole(me: Pick<Me, 'roles'>, role: string): boolean {
  return me.roles.some((r) => r.name.toLowerCase() === role.toLowerCase())
}

export function isAdmin(me: Pick<Me, 'roles'>): boolean {
  return hasRole(me, 'admin')
}
```

- [ ] **Step 4: Config de navegación + filtrado por rol.** `lib/auth/nav.ts`:
```ts
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Contact,
  FileText,
  GitBranch,
  IdCard,
  Inbox,
  Key,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  Shield,
  Tags,
  Target,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavAccess = 'auth' | 'admin'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  access: NavAccess
}

export interface NavGroup {
  label: string
  access: NavAccess
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'General',
    access: 'auth',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, access: 'auth' }],
  },
  {
    label: 'Comercial',
    access: 'auth',
    items: [
      { label: 'Oportunidades', href: '/opportunities', icon: Target, access: 'auth' },
      { label: 'Clientes', href: '/clients', icon: Building2, access: 'auth' },
      { label: 'Contactos', href: '/client-contacts', icon: Contact, access: 'auth' },
      { label: 'Requests', href: '/contact-requests', icon: Inbox, access: 'auth' },
    ],
  },
  {
    label: 'Reclutamiento',
    access: 'auth',
    items: [
      { label: 'Candidatos', href: '/candidates', icon: Users, access: 'auth' },
      { label: 'Aplicaciones', href: '/applications', icon: FileText, access: 'auth' },
      { label: 'Placements', href: '/placements', icon: CheckCircle2, access: 'auth' },
    ],
  },
  {
    label: 'Catálogos',
    access: 'admin',
    items: [
      { label: 'Sectores', href: '/sectors', icon: Layers, access: 'admin' },
      { label: 'Áreas', href: '/position-areas', icon: LayoutGrid, access: 'admin' },
      { label: 'Etapas', href: '/pipeline-stages', icon: GitBranch, access: 'admin' },
      { label: 'Tipos de contacto', href: '/contact-types', icon: Tags, access: 'admin' },
    ],
  },
  {
    label: 'Admin',
    access: 'admin',
    items: [
      { label: 'Usuarios', href: '/users', icon: User, access: 'admin' },
      { label: 'Roles', href: '/roles', icon: Shield, access: 'admin' },
      { label: 'Permisos', href: '/permissions', icon: Key, access: 'admin' },
      { label: 'Empleados', href: '/employees', icon: IdCard, access: 'admin' },
    ],
  },
]

const visible = (access: NavAccess, admin: boolean) => access === 'auth' || admin

export function visibleGroups(admin: boolean): NavGroup[] {
  return NAV_GROUPS.filter((g) => visible(g.access, admin))
    .map((g) => ({ ...g, items: g.items.filter((i) => visible(i.access, admin)) }))
    .filter((g) => g.items.length > 0)
}

export function labelForHref(pathname: string): string {
  const first = `/${pathname.split('/').filter(Boolean)[0] ?? ''}`
  for (const group of NAV_GROUPS) {
    const match = group.items.find((i) => i.href === first)
    if (match) return match.label
  }
  return 'Inicio'
}

// Marca Briefcase como usado para enlaces futuros de detalle comercial.
export const FALLBACK_ICON = Briefcase
```

- [ ] **Step 5 (TDD): test de nav/roles.** `test/lib/auth/nav.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { labelForHref, visibleGroups } from '@/lib/auth/nav'
import { hasRole, isAdmin } from '@/lib/auth/roles'
import type { Me } from '@/lib/auth/types'

const base: Pick<Me, 'roles'> = { roles: [{ id: '1', name: 'auth' }] }
const admin: Pick<Me, 'roles'> = { roles: [{ id: '2', name: 'ADMIN' }] }

describe('roles', () => {
  it('hasRole es case-insensitive', () => {
    expect(hasRole(admin, 'admin')).toBe(true)
    expect(hasRole(base, 'admin')).toBe(false)
  })
  it('isAdmin detecta el rol admin', () => {
    expect(isAdmin(admin)).toBe(true)
    expect(isAdmin(base)).toBe(false)
  })
})

describe('visibleGroups', () => {
  it('oculta Catálogos y Admin a no-admin', () => {
    const labels = visibleGroups(false).map((g) => g.label)
    expect(labels).toContain('Comercial')
    expect(labels).not.toContain('Admin')
    expect(labels).not.toContain('Catálogos')
  })
  it('muestra todos los grupos a admin', () => {
    const labels = visibleGroups(true).map((g) => g.label)
    expect(labels).toContain('Admin')
    expect(labels).toContain('Catálogos')
  })
})

describe('labelForHref', () => {
  it('mapea la ruta al label de nav', () => {
    expect(labelForHref('/opportunities')).toBe('Oportunidades')
    expect(labelForHref('/clients/123')).toBe('Clientes')
  })
})
```

- [ ] **Step 6: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/02-guides/authentication.md` (sección "Creating a Data Access Layer (DAL)") y usa la API vigente.** Confirmado: centralizar la verificación de sesión en un `getMe()` memoizado con React `cache` y redirigir con `redirect()` de `next/navigation` en 401. DAL `lib/auth/me.ts`:
```ts
import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { serverFetch } from '@/lib/api/server-fetch'
import { ApiError } from '@/lib/api/types'
import type { Me } from './types'

export const getMe = cache(async (): Promise<Me> => {
  try {
    return await serverFetch<Me>('/auth/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login')
    }
    throw error
  }
})
```

- [ ] **Step 7: Hook `useMe`.** `lib/api/hooks/use-me.ts`:
```ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { clientFetch } from '@/lib/api/client'
import type { Me } from '@/lib/auth/types'

export const ME_QUERY_KEY = ['me'] as const

export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => clientFetch<Me>('/auth/me'),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
```

- [ ] **Step 8: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` y usa la API vigente.** Confirmado: hooks de cliente requieren `'use client'`; `useRouter` viene de `next/navigation`. Hook `useLogout`. `lib/api/hooks/use-logout.ts`:
```ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    },
    onSettled: () => {
      queryClient.clear()
      router.replace('/login')
      router.refresh()
    },
  })
}
```

- [ ] **Step 9: Verificar tests.** Comando:
```bash
npm run test
```
Esperado: `nav.test.ts` (7 tests) en verde junto a los previos.

- [ ] **Step 10: Commit.** Comando:
```bash
git add lib/auth/types.ts lib/auth/roles.ts lib/auth/nav.ts lib/auth/me.ts lib/api/hooks/use-me.ts lib/api/hooks/use-logout.ts test/lib/auth/nav.test.ts package.json package-lock.json
git commit -m "feat(auth): DAL getMe, roles, config de nav y hooks useMe/useLogout"
```

---

### Task 2.10: App shell — sidebar + topbar + menú de usuario y verificación de build

**Files:**
- Create: `components/layout/nav-links.tsx`
- Create: `components/layout/sidebar.tsx`
- Create: `components/layout/mobile-nav.tsx`
- Create: `components/layout/user-menu.tsx`
- Create: `components/layout/topbar.tsx`
- Create: `app/(app)/layout.tsx`
- Create: `app/(app)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `getMe` (2.9, server), `isAdmin` (2.9), `visibleGroups`/`labelForHref`/`NAV_GROUPS` (2.9), `useLogout` (2.9), componentes shadcn `dropdown-menu`, `avatar`, `sheet`, `separator`, `breadcrumb`, `button`
- Produces: `app/(app)/layout.tsx` (Server Component: `getMe` → pasa `isAdmin` serializable a `Sidebar`/`MobileNav` y `me` a `Topbar`)

- [ ] **Step 1: Componentes shadcn del shell.** Comando:
```bash
npx shadcn@latest add dropdown-menu avatar sheet separator breadcrumb
```
Esperado: archivos en `components/ui/` (dropdown-menu, avatar, sheet, separator, breadcrumb).

- [ ] **Step 2: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` y usa la API vigente.** Confirmado: **no se puede pasar un componente función (los iconos `LucideIcon`) como prop de un Server Component a un Client Component** (no serializable). Por eso `NAV_GROUPS` se importa **dentro** de los componentes cliente; al boundary solo cruza `isAdmin: boolean` y el objeto plano `me`.

- [ ] **Step 3: Lista de navegación (cliente, DRY; usa `usePathname`).** `components/layout/nav-links.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { visibleGroups } from '@/lib/auth/nav'

export function NavLinks({
  admin,
  onNavigate,
}: {
  admin: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const groups = visibleGroups(admin)

  return (
    <nav className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          {group.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'flex items-center gap-3 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground'
                    : 'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary'
                }
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
```

- [ ] **Step 4: Sidebar de escritorio.** `components/layout/sidebar.tsx`:
```tsx
'use client'

import { NavLinks } from './nav-links'

export function Sidebar({ admin }: { admin: boolean }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-primary">
          SIR CRM
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <NavLinks admin={admin} />
      </div>
    </aside>
  )
}
```

- [ ] **Step 5: Navegación móvil (Sheet).** `components/layout/mobile-nav.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { NavLinks } from './nav-links'

export function MobileNav({ admin }: { admin: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="font-[family-name:var(--font-display)] text-primary">
            SIR CRM
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto p-3">
          <NavLinks admin={admin} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 6: Menú de usuario (logout).** `components/layout/user-menu.tsx`:
```tsx
'use client'

import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/lib/api/hooks/use-logout'
import type { Me } from '@/lib/auth/types'

function initials(me: Me): string {
  if (me.employee) return `${me.employee.firstName[0] ?? ''}${me.employee.lastName[0] ?? ''}`.toUpperCase()
  return me.username.slice(0, 2).toUpperCase()
}

export function UserMenu({ me }: { me: Me }) {
  const logout = useLogout()
  const displayName = me.employee
    ? `${me.employee.firstName} ${me.employee.lastName}`
    : me.username

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-accent text-accent-foreground">{initials(me)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{me.roles.map((r) => r.name).join(', ')}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={logout.isPending}
          onSelect={(e) => {
            e.preventDefault()
            logout.mutate()
          }}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 7: Topbar (breadcrumbs + slot de command palette + menú usuario).** `components/layout/topbar.tsx`:
```tsx
'use client'

import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { labelForHref } from '@/lib/auth/nav'
import type { Me } from '@/lib/auth/types'
import { MobileNav } from './mobile-nav'
import { UserMenu } from './user-menu'

export function Topbar({ me, admin }: { me: Me; admin: boolean }) {
  const pathname = usePathname()
  const current = labelForHref(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
      <MobileNav admin={admin} />
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">SIR CRM</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{current}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        {/* Slot del command palette (⌘K) — se cablea en Fase 8. */}
        <div className="hidden items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground lg:flex">
          <Search className="size-4" />
          <span>Buscar…</span>
          <kbd className="ml-2 rounded bg-muted px-1.5 text-xs">⌘K</kbd>
        </div>
        <UserMenu me={me} />
      </div>
    </header>
  )
}
```

- [ ] **Step 8: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` y usa la API vigente.** Layout del grupo `(app)` como Server Component async que ejecuta el DAL `getMe`. `app/(app)/layout.tsx`:
```tsx
import { getMe } from '@/lib/auth/me'
import { isAdmin } from '@/lib/auth/roles'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe()
  const admin = isAdmin(me)

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <Sidebar admin={admin} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar me={me} admin={admin} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Página dashboard mínima** (para que el shell renderice y el flujo de login aterrice; el contenido real es Fase 4). `app/(app)/dashboard/page.tsx`:
```tsx
import { getMe } from '@/lib/auth/me'

export default async function DashboardPage() {
  const me = await getMe()
  const name = me.employee ? me.employee.firstName : me.username

  return (
    <section className="space-y-2">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
        Hola, {name}
      </h1>
      <p className="text-muted-foreground">
        Bienvenido al CRM de SIR. El tablero de métricas se construye en la siguiente fase.
      </p>
    </section>
  )
}
```

- [ ] **Step 10: Verificar build (typecheck incluido) y tests.** Comandos:
```bash
npm run test
npm run build
```
Esperado: `npm run test` con todos los archivos en verde; `npm run build` finaliza con "Compiled successfully" y la ruta `/dashboard` y los handlers `/api/auth/*` y `/api/proxy/[...path]` listados sin errores de tipo.

- [ ] **Step 11: Commit.** Comando:
```bash
git add components/layout "app/(app)" components/ui package.json package-lock.json
git commit -m "feat(shell): app shell con sidebar/topbar por rol y dashboard inicial"
```


## Fase 3 — Patrones reutilizables

### Task 3.1: Configurar Vitest + Testing Library (Next 16 / React 19)

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (scripts + devDependencies)
- Create: `lib/test/query-wrapper.tsx`

**Interfaces:**
- Produces: `createQueryWrapper(): { wrapper: ({children}) => JSX, client: QueryClient }` para tests de hooks.
- Consumes: alias `@/*` del `tsconfig.json` del template (paths `"@/*": ["./*"]`).

- [ ] **Step 1: Instalar el toolchain de test compatible con React 19 / Next 16.** Comando exacto:
```bash
npm i -D vitest@^3 @vitejs/plugin-react@^5 vite-tsconfig-paths@^5 jsdom@^25 @testing-library/react@^16 @testing-library/dom@^10 @testing-library/user-event@^14 @testing-library/jest-dom@^6
```
Esperado: `added N packages` sin errores de peer-deps (Testing Library 16 declara soporte React 19).

- [ ] **Step 2: Crear `vitest.config.ts`** (jsdom + alias `@/` vía `vite-tsconfig-paths`; CSS desactivado para velocidad):
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
  },
});
```

- [ ] **Step 3: Crear `vitest.setup.ts`** (matchers jest-dom + cleanup automático):
```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Añadir scripts a `package.json`** (bloque `"scripts"`):
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Crear `lib/test/query-wrapper.tsx`** (QueryClient aislado, sin reintentos, para tests de hooks):
```tsx
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function createQueryWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { wrapper, client };
}
```
Nota: `@tanstack/react-query` se instala en la Task 3.3; este archivo compila al integrarse esa dependencia (orden de tareas respetado).

- [ ] **Step 6: Verificar que el runner arranca.** Comando:
```bash
npx vitest run --reporter=basic
```
Esperado: `No test files found` (aún no hay tests) y **exit 0** — confirma config válida.

- [ ] **Step 7: Commit.**
```bash
git add vitest.config.ts vitest.setup.ts vitest.setup.ts lib/test/query-wrapper.tsx package.json package-lock.json
git commit -m "chore(test): configurar Vitest + Testing Library para Next 16 / React 19"
```

---

### Task 3.2: `lib/api` — tipos del envelope, `Paginated<T>` y client tipado (unwrap) [TDD]

**Files:**
- Create: `lib/api/types.ts`
- Create: `lib/api/client.ts`
- Create: `lib/api/resource-client.ts`
- Test: `lib/api/client.test.ts`
- Test: `lib/api/resource-client.test.ts`

**Interfaces:**
- Produces:
  - `type ApiEnvelope<T> = ApiSuccess<T> | ApiError`; `interface Paginated<T> { items: T[]; total: number; page: number; limit: number }`; `interface ListParams { page?: number; limit?: number; [k: string]: string | number | boolean | undefined }`.
  - `apiFetch<T>(path: string, init?: RequestInit): Promise<T>` — desenvuelve `data`, lanza `Error(message)` en `ok:false` o respuesta inválida.
  - `createResourceClient<T, C = Partial<T>, U = Partial<T>>(base: string): ResourceClient<T, C, U>` con `list / one / create / update / remove / action`.
- Consumes: route handler same-origin `app/api/proxy/[...path]/route.ts` (Fase 2). El client NO conoce tokens (cookies httpOnly del BFF).

- [ ] **Step 1 (Next): Lee `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md` y `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`** y confirma el patrón de `fetch` de cliente same-origin hacia route handlers y la opción vigente para datos dinámicos (no-cache). Aplica la API que indique la guía sobre lo de memoria.

- [ ] **Step 2: Escribir tests del unwrap (rojo).** En `lib/api/client.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./client";

function mockFetchOnce(status: number, json: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ status, json: async () => json }) as unknown as Response),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("apiFetch", () => {
  it("desenvuelve data en éxito", async () => {
    mockFetchOnce(200, { ok: true, message: "ok", data: { id: 1 } });
    await expect(apiFetch<{ id: number }>("clients/1")).resolves.toEqual({ id: 1 });
  });

  it("lanza Error(message) cuando ok:false", async () => {
    mockFetchOnce(400, { ok: false, message: "Credenciales inválidas", path: "/x" });
    await expect(apiFetch("clients")).rejects.toThrow("Credenciales inválidas");
  });

  it("lanza si el cuerpo no es un envelope válido", async () => {
    mockFetchOnce(200, { foo: "bar" });
    await expect(apiFetch("clients")).rejects.toThrow("Respuesta no válida del servidor");
  });

  it("antepone el prefijo del proxy a la ruta", async () => {
    const spy = vi.fn(async () => ({ status: 200, json: async () => ({ ok: true, message: "", data: 1 }) }) as unknown as Response);
    vi.stubGlobal("fetch", spy);
    await apiFetch("clients?page=2");
    expect(spy.mock.calls[0][0]).toBe("/api/proxy/clients?page=2");
  });
});
```

- [ ] **Step 3: Implementar `lib/api/types.ts`:**
```ts
export interface ApiSuccess<T> {
  ok: true;
  message: string;
  data: T;
}

export interface ApiError {
  ok: false;
  message: string;
  path: string;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type ListParams = {
  page?: number;
  limit?: number;
} & Record<string, string | number | boolean | undefined>;
```

- [ ] **Step 4: Implementar `lib/api/client.ts`** (same-origin → proxy; unwrap; `Error(message)`):
```ts
import type { ApiError, ApiEnvelope, ApiSuccess, ListParams } from "./types";

const PROXY_BASE = "/api/proxy";

export function buildQuery(params?: ListParams): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${PROXY_BASE}/${path.replace(/^\/+/, "")}`;
  const res = await fetch(url, {
    cache: "no-store",
    credentials: "same-origin",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error("Respuesta no válida del servidor");
  }

  const env = body as Partial<ApiEnvelope<T>>;
  if (!env || typeof env.ok !== "boolean") {
    throw new Error("Respuesta no válida del servidor");
  }
  if (!env.ok) {
    throw new Error((env as ApiError).message || "Error desconocido");
  }
  return (env as ApiSuccess<T>).data;
}
```
Nota: confirma `cache: "no-store"` (o el equivalente vigente) contra la guía leída en el Step 1; si Next 16 recomienda otra forma para datos dinámicos en client fetch, manda la guía.

- [ ] **Step 5: Tests del resource-client (rojo) en `lib/api/resource-client.test.ts`:**
```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { createResourceClient } from "./resource-client";

interface Client { id: number; name: string }

function spyFetch(json: unknown) {
  const spy = vi.fn(async () => ({ status: 200, json: async () => json }) as unknown as Response);
  vi.stubGlobal("fetch", spy);
  return spy;
}

afterEach(() => vi.unstubAllGlobals());

describe("createResourceClient", () => {
  const clients = createResourceClient<Client>("clients");

  it("list arma la query de paginación y devuelve Paginated", async () => {
    const spy = spyFetch({ ok: true, message: "", data: { items: [], total: 0, page: 2, limit: 20 } });
    const res = await clients.list({ page: 2, limit: 20, sectorId: 5 });
    expect(spy.mock.calls[0][0]).toBe("/api/proxy/clients?page=2&limit=20&sectorId=5");
    expect(res.page).toBe(2);
  });

  it("create envía POST con body JSON", async () => {
    const spy = spyFetch({ ok: true, message: "", data: { id: 1, name: "ACME" } });
    await clients.create({ name: "ACME" });
    const init = spy.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ name: "ACME" }));
  });

  it("update usa PATCH en /:id y remove usa DELETE", async () => {
    const spy = spyFetch({ ok: true, message: "", data: { id: 1, name: "X" } });
    await clients.update(1, { name: "X" });
    expect((spy.mock.calls[0][1] as RequestInit).method).toBe("PATCH");
    expect(spy.mock.calls[0][0]).toBe("/api/proxy/clients/1");
    await clients.remove(1);
    expect((spy.mock.calls[1][1] as RequestInit).method).toBe("DELETE");
  });

  it("action llama subruta con método dado", async () => {
    const spy = spyFetch({ ok: true, message: "", data: { id: 1, name: "X" } });
    await clients.action("1/handle", "PATCH", { note: "ok" });
    expect(spy.mock.calls[0][0]).toBe("/api/proxy/clients/1/handle");
    expect((spy.mock.calls[0][1] as RequestInit).method).toBe("PATCH");
  });
});
```

- [ ] **Step 6: Implementar `lib/api/resource-client.ts`:**
```ts
import { apiFetch, buildQuery } from "./client";
import type { ListParams, Paginated } from "./types";

export type Id = string | number;
export type HttpMethod = "POST" | "PATCH" | "PUT" | "DELETE";

export interface ResourceClient<T, C = Partial<T>, U = Partial<T>> {
  base: string;
  list: (params?: ListParams) => Promise<Paginated<T>>;
  one: (id: Id) => Promise<T>;
  create: (dto: C) => Promise<T>;
  update: (id: Id, dto: U) => Promise<T>;
  remove: (id: Id) => Promise<void>;
  action: <R = T>(path: string, method?: HttpMethod, body?: unknown) => Promise<R>;
}

export function createResourceClient<T, C = Partial<T>, U = Partial<T>>(
  base: string,
): ResourceClient<T, C, U> {
  const root = base.replace(/^\/+|\/+$/g, "");
  return {
    base: root,
    list: (params) => apiFetch<Paginated<T>>(`${root}${buildQuery(params)}`),
    one: (id) => apiFetch<T>(`${root}/${id}`),
    create: (dto) => apiFetch<T>(root, { method: "POST", body: JSON.stringify(dto) }),
    update: (id, dto) => apiFetch<T>(`${root}/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
    remove: (id) => apiFetch<void>(`${root}/${id}`, { method: "DELETE" }),
    action: (path, method = "PATCH", body) =>
      apiFetch(`${root}/${path.replace(/^\/+/, "")}`, {
        method,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
  };
}
```

- [ ] **Step 7: Verde.** Comando:
```bash
npx vitest run lib/api
```
Esperado: `Test Files 2 passed`, todos los casos en verde.

- [ ] **Step 8: Commit.**
```bash
git add lib/api/types.ts lib/api/client.ts lib/api/resource-client.ts lib/api/client.test.ts lib/api/resource-client.test.ts
git commit -m "feat(api): client tipado same-origin con unwrap de envelope y resource-client"
```

---

### Task 3.3: `lib/api` — factory de hooks TanStack Query con invalidación [TDD]

**Files:**
- Create: `lib/api/query-keys.ts`
- Create: `lib/api/hooks.ts`
- Test: `lib/api/hooks.test.tsx`
- Modify: `package.json` (dependencia `@tanstack/react-query`)

**Interfaces:**
- Produces:
  - `resourceKeys(key: string)` → `{ all, lists, list(params), details, detail(id) }`.
  - `createResourceHooks<T, C, U>(key, client)` → `{ keys, useList(params), useOne(id), useCreate(), useUpdate(), useRemove(), useAction<R>(opts) }`.
- Consumes: `ResourceClient<T,C,U>` (Task 3.2); `QueryClientProvider` global (Fase 1) o `createQueryWrapper` (Task 3.1) en tests.

- [ ] **Step 1: Instalar TanStack Query (compatible React 19).**
```bash
npm i @tanstack/react-query@^5
```
Esperado: `added N packages` (v5 soporta React 19).

- [ ] **Step 2: Implementar `lib/api/query-keys.ts`:**
```ts
import type { ListParams } from "./types";
import type { Id } from "./resource-client";

export function resourceKeys(key: string) {
  const all = [key] as const;
  return {
    all,
    lists: () => [...all, "list"] as const,
    list: (params?: ListParams) => [...all, "list", params ?? {}] as const,
    details: () => [...all, "detail"] as const,
    detail: (id: Id) => [...all, "detail", String(id)] as const,
  };
}

export type ResourceKeys = ReturnType<typeof resourceKeys>;
```

- [ ] **Step 3: Tests de hooks (rojo) en `lib/api/hooks.test.tsx`** (usa `createQueryWrapper` + client mockeado, sin red real):
```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@/lib/test/query-wrapper";
import { createResourceHooks } from "./hooks";
import type { ResourceClient } from "./resource-client";

interface Sector { id: number; name: string }

function fakeClient(): ResourceClient<Sector> {
  return {
    base: "sectors",
    list: vi.fn(async () => ({ items: [{ id: 1, name: "A" }], total: 1, page: 1, limit: 20 })),
    one: vi.fn(async () => ({ id: 1, name: "A" })),
    create: vi.fn(async (dto) => ({ id: 2, ...(dto as Sector) })),
    update: vi.fn(async (id, dto) => ({ id: Number(id), ...(dto as Sector) })),
    remove: vi.fn(async () => undefined),
    action: vi.fn(async () => ({ id: 1, name: "A" })),
  };
}

describe("createResourceHooks", () => {
  let client: ResourceClient<Sector>;
  beforeEach(() => { client = fakeClient(); });

  it("useList devuelve Paginated", async () => {
    const hooks = createResourceHooks<Sector>("sectors", client);
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => hooks.useList({ page: 1, limit: 20 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
    expect(client.list).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it("useCreate invalida las listas tras éxito", async () => {
    const hooks = createResourceHooks<Sector>("sectors", client);
    const { wrapper, client: qc } = createQueryWrapper();
    const spy = vi.spyOn(qc, "invalidateQueries");
    const { result } = renderHook(() => hooks.useCreate(), { wrapper });
    await act(async () => { await result.current.mutateAsync({ name: "Nuevo" }); });
    expect(client.create).toHaveBeenCalledWith({ name: "Nuevo" });
    expect(spy).toHaveBeenCalledWith({ queryKey: hooks.keys.lists() });
  });

  it("useRemove invalida listas y detalle", async () => {
    const hooks = createResourceHooks<Sector>("sectors", client);
    const { wrapper, client: qc } = createQueryWrapper();
    const spy = vi.spyOn(qc, "invalidateQueries");
    const { result } = renderHook(() => hooks.useRemove(), { wrapper });
    await act(async () => { await result.current.mutateAsync(1); });
    expect(spy).toHaveBeenCalledWith({ queryKey: hooks.keys.all });
  });

  it("useAction ejecuta la subruta e invalida", async () => {
    const hooks = createResourceHooks<Sector>("sectors", client);
    const { wrapper, client: qc } = createQueryWrapper();
    const spy = vi.spyOn(qc, "invalidateQueries");
    const { result } = renderHook(
      () => hooks.useAction<Sector>({ buildPath: (id: number) => `${id}/win`, method: "PATCH" }),
      { wrapper },
    );
    await act(async () => { await result.current.mutateAsync({ id: 1, body: { amount: 10 } }); });
    expect(client.action).toHaveBeenCalledWith("1/win", "PATCH", { amount: 10 });
    expect(spy).toHaveBeenCalledWith({ queryKey: hooks.keys.all });
  });
});
```

- [ ] **Step 4 (Next): Lee `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`** y confirma el formato vigente del directive `'use client'`. `lib/api/hooks.ts` se consume desde componentes cliente; no necesita la directiva en sí, pero los consumidores sí — déjalo documentado.

- [ ] **Step 5: Implementar `lib/api/hooks.ts`:**
```ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { resourceKeys } from "./query-keys";
import type { ResourceClient, Id, HttpMethod } from "./resource-client";
import type { ListParams, Paginated } from "./types";

export interface ActionVars {
  id: Id;
  body?: unknown;
}

export interface UseActionOptions {
  buildPath: (id: Id) => string;
  method?: HttpMethod;
}

export function createResourceHooks<T, C = Partial<T>, U = Partial<T>>(
  key: string,
  client: ResourceClient<T, C, U>,
) {
  const keys = resourceKeys(key);

  function useList(params?: ListParams): UseQueryResult<Paginated<T>, Error> {
    return useQuery({
      queryKey: keys.list(params),
      queryFn: () => client.list(params),
      placeholderData: (prev) => prev,
    });
  }

  function useOne(id: Id | undefined): UseQueryResult<T, Error> {
    return useQuery({
      queryKey: keys.detail(id ?? "nil"),
      queryFn: () => client.one(id as Id),
      enabled: id !== undefined && id !== null,
    });
  }

  function useCreate(): UseMutationResult<T, Error, C> {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (dto: C) => client.create(dto),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.lists() }),
    });
  }

  function useUpdate(): UseMutationResult<T, Error, { id: Id; dto: U }> {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, dto }) => client.update(id, dto),
      onSuccess: (_data, vars) => {
        qc.invalidateQueries({ queryKey: keys.lists() });
        qc.invalidateQueries({ queryKey: keys.detail(vars.id) });
      },
    });
  }

  function useRemove(): UseMutationResult<void, Error, Id> {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: Id) => client.remove(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
  }

  function useAction<R = T>(opts: UseActionOptions): UseMutationResult<R, Error, ActionVars> {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, body }: ActionVars) =>
        client.action<R>(opts.buildPath(id), opts.method ?? "PATCH", body),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
  }

  return { keys, useList, useOne, useCreate, useUpdate, useRemove, useAction };
}

export type ResourceHooks<T, C = Partial<T>, U = Partial<T>> = ReturnType<
  typeof createResourceHooks<T, C, U>
>;
```

- [ ] **Step 6: Verde.**
```bash
npx vitest run lib/api/hooks.test.tsx
```
Esperado: `Test Files 1 passed`, 4 tests en verde.

- [ ] **Step 7: Commit.**
```bash
git add lib/api/query-keys.ts lib/api/hooks.ts lib/api/hooks.test.tsx package.json package-lock.json
git commit -m "feat(api): factory de hooks TanStack Query con invalidacion por recurso"
```

---

### Task 3.4: Instalar primitivas shadcn/ui para el patrón de recurso

**Files:**
- Modify: `package.json`, `components.json` (generados por shadcn)
- Create: `components/ui/{table,button,input,label,dialog,sheet,drawer,dropdown-menu,badge,skeleton,select,form,card}.tsx`

**Interfaces:**
- Produces: primitivas shadcn importables como `@/components/ui/<name>`.
- Consumes: shadcn ya inicializado y tokens de marca aplicados (Fase 1); TanStack Table/RHF/Zod/sonner instalados aquí.

- [ ] **Step 1: Instalar libs de cliente del patrón (versiones compatibles React 19 / Next 16).**
```bash
npm i @tanstack/react-table@^8 react-hook-form@^7 @hookform/resolvers@^3 zod@^3 sonner@^2 lucide-react@^0.4
```
Esperado: `added N packages`. Verifica que `zod` resuelva a `^3.24+` (compatible con `@hookform/resolvers@^3`); si el resolver exige otra versión, manda lo que el resolver soporte.

- [ ] **Step 2: Añadir las primitivas shadcn que consumen los componentes de recurso.**
```bash
npx shadcn@latest add table button input label dialog sheet drawer dropdown-menu badge skeleton select form card
```
Esperado: shadcn escribe cada archivo en `components/ui/` y confirma `Done`. Si pregunta por overwrite de existentes, mantener los ya presentes de Fase 1.

- [ ] **Step 3: Verificar typecheck/compilación tras la instalación.**
```bash
npm run build
```
Esperado: build de Next OK (incluye typecheck). Si shadcn instaló una versión de `cmdk`/peer incompatible, fija la que compile y vuelve a construir.

- [ ] **Step 4: Commit.**
```bash
git add components/ui package.json package-lock.json components.json
git commit -m "chore(ui): primitivas shadcn y libs (table/rhf/zod/sonner) para patron de recurso"
```

---

### Task 3.5: `ResourceTable<T>` (TanStack Table + DataTable shadcn) [TDD]

**Files:**
- Create: `components/resource/resource-table.tsx`
- Create: `components/resource/row-actions.tsx`
- Test: `components/resource/resource-table.test.tsx`

**Interfaces:**
- Produces:
  - `interface ResourceTableProps<T> { columns: ColumnDef<T, unknown>[]; data: T[]; total: number; page: number; limit: number; onPageChange(page:number): void; isLoading?: boolean; isError?: boolean; errorMessage?: string; search?: string; onSearchChange?(v:string): void; searchPlaceholder?: string; sorting?: SortingState; onSortingChange?(s:SortingState): void; onView?(row:T): void; onEdit?(row:T): void; onDelete?(row:T): void; emptyMessage?: string }`
  - `function ResourceTable<T>(props: ResourceTableProps<T>): JSX.Element`
- Consumes: primitivas `@/components/ui/*` (Task 3.4); paginación **offset controlada** por el padre (estado/query), `manualPagination`.

- [ ] **Step 1 (Next): Lee `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`** y aplica la forma vigente de `'use client'` al inicio del componente (interactivo: estado de Table, handlers).

- [ ] **Step 2: Tests de comportamiento (rojo) en `components/resource/resource-table.test.tsx`:**
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { ResourceTable } from "./resource-table";

interface Row { id: number; name: string }
const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Nombre" },
];
const data: Row[] = [
  { id: 1, name: "ACME" },
  { id: 2, name: "Globex" },
];

function base(overrides = {}) {
  return { columns, data, total: 40, page: 1, limit: 20, onPageChange: vi.fn(), ...overrides };
}

describe("ResourceTable", () => {
  it("renderiza encabezados y filas", () => {
    render(<ResourceTable {...base()} />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("ACME")).toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
  });

  it("muestra skeleton en loading (sin filas de datos)", () => {
    render(<ResourceTable {...base({ data: [], isLoading: true })} />);
    expect(screen.queryByText("ACME")).not.toBeInTheDocument();
    expect(screen.getByTestId("resource-table-skeleton")).toBeInTheDocument();
  });

  it("muestra estado vacío", () => {
    render(<ResourceTable {...base({ data: [], total: 0, emptyMessage: "Sin clientes" })} />);
    expect(screen.getByText("Sin clientes")).toBeInTheDocument();
  });

  it("muestra estado de error", () => {
    render(<ResourceTable {...base({ data: [], isError: true, errorMessage: "Falló la carga" })} />);
    expect(screen.getByText("Falló la carga")).toBeInTheDocument();
  });

  it("calcula páginas por offset y dispara onPageChange", () => {
    const onPageChange = vi.fn();
    render(<ResourceTable {...base({ page: 1, onPageChange })} />);
    expect(screen.getByText(/Página 1 de 2/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("deshabilita Anterior en la primera página", () => {
    render(<ResourceTable {...base({ page: 1 })} />);
    expect(screen.getByRole("button", { name: /Anterior/i })).toBeDisabled();
  });

  it("propaga búsqueda", () => {
    const onSearchChange = vi.fn();
    render(<ResourceTable {...base({ onSearchChange, searchPlaceholder: "Buscar" })} />);
    fireEvent.change(screen.getByPlaceholderText("Buscar"), { target: { value: "ac" } });
    expect(onSearchChange).toHaveBeenCalledWith("ac");
  });

  it("invoca acciones de fila", () => {
    const onEdit = vi.fn();
    render(<ResourceTable {...base({ onEdit })} />);
    fireEvent.click(screen.getAllByLabelText("Acciones de fila")[0]);
    fireEvent.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(data[0]);
  });
});
```

- [ ] **Step 3: Implementar `components/resource/row-actions.tsx`:**
```tsx
"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RowActionsProps<T> {
  row: T;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function RowActions<T>({ row, onView, onEdit, onDelete }: RowActionsProps<T>) {
  if (!onView && !onEdit && !onDelete) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Acciones de fila">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && <DropdownMenuItem onClick={() => onView(row)}>Ver</DropdownMenuItem>}
        {onEdit && <DropdownMenuItem onClick={() => onEdit(row)}>Editar</DropdownMenuItem>}
        {onDelete && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(row)}
          >
            Borrar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 4: Implementar `components/resource/resource-table.tsx`** (paginación offset controlada; orden manual; skeleton/empty/error; búsqueda):
```tsx
"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RowActions } from "./row-actions";

export interface ResourceTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyMessage?: string;
}

export function ResourceTable<T>({
  columns,
  data,
  total,
  page,
  limit,
  onPageChange,
  isLoading,
  isError,
  errorMessage,
  search,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  sorting,
  onSortingChange,
  onView,
  onEdit,
  onDelete,
  emptyMessage = "Sin resultados.",
}: ResourceTableProps<T>) {
  const hasRowActions = Boolean(onView || onEdit || onDelete);
  const pageCount = Math.max(1, Math.ceil(total / limit));

  const table = useReactTable({
    data,
    columns,
    state: { sorting: sorting ?? [] },
    onSortingChange: (updater) => {
      if (!onSortingChange) return;
      const next = typeof updater === "function" ? updater(sorting ?? []) : updater;
      onSortingChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
  });

  const colSpan = columns.length + (hasRowActions ? 1 : 0);

  return (
    <div className="space-y-4">
      {onSearchChange && (
        <Input
          value={search ?? ""}
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      )}

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
                {hasRowActions && <TableHead className="w-12" />}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow data-testid="resource-table-skeleton">
                <TableCell colSpan={colSpan}>
                  <div className="space-y-2 py-2">
                    {Array.from({ length: Math.min(limit, 8) }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center text-destructive">
                  {errorMessage ?? "Ocurrió un error al cargar los datos."}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  {hasRowActions && (
                    <TableCell className="text-right">
                      <RowActions
                        row={row.original}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} resultado(s) · Página {page} de {pageCount}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verde.**
```bash
npx vitest run components/resource/resource-table.test.tsx
```
Esperado: `Test Files 1 passed`, 8 tests en verde.

- [ ] **Step 6: Commit.**
```bash
git add components/resource/resource-table.tsx components/resource/row-actions.tsx components/resource/resource-table.test.tsx
git commit -m "feat(resource): ResourceTable con paginacion offset, busqueda, orden y estados"
```

---

### Task 3.6: `ResourceForm<T>` (RHF + Zod en Dialog/Sheet) [TDD]

**Files:**
- Create: `components/resource/field-config.ts`
- Create: `components/resource/resource-form.tsx`
- Test: `components/resource/resource-form.test.tsx`

**Interfaces:**
- Produces:
  - `type FieldType = "text" | "number" | "email" | "textarea" | "select" | "switch"`
  - `interface FieldConfig { name: string; label: string; type?: FieldType; placeholder?: string; options?: { label: string; value: string | number }[]; description?: string }`
  - `interface ResourceFormProps<S extends ZodType> { open: boolean; onOpenChange(open:boolean): void; title: string; schema: S; fields: FieldConfig[]; defaultValues: DefaultValues<TypeOf<S>>; submitLabel?: string; container?: "dialog" | "sheet"; onSubmit(values: TypeOf<S>): Promise<void> }`
  - `function ResourceForm<S>(props): JSX.Element`
- Consumes: `react-hook-form`, `@hookform/resolvers/zod`, `zod`, `sonner` (toast en error de API), primitivas `@/components/ui/{form,input,select,dialog,sheet,button,label,textarea?}`.

- [ ] **Step 1 (Next): Lee `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`** y aplica `'use client'` (form interactivo con estado y handlers de submit).

- [ ] **Step 2: Asegurar primitiva `textarea` y `switch` de shadcn (si faltan).**
```bash
npx shadcn@latest add textarea switch
```
Esperado: archivos en `components/ui/`. Si ya existen, mantener.

- [ ] **Step 3: Implementar `components/resource/field-config.ts`:**
```ts
export type FieldType = "text" | "number" | "email" | "textarea" | "select" | "switch";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldConfig {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  options?: FieldOption[];
  description?: string;
}
```

- [ ] **Step 4: Tests (rojo) en `components/resource/resource-form.test.tsx`** (validación Zod + submit + toast en error de API):
```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { toast } from "sonner";
import { ResourceForm } from "./resource-form";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
});
const fields = [
  { name: "name", label: "Nombre" },
  { name: "description", label: "Descripción", type: "textarea" as const },
];

function setup(onSubmit: (v: unknown) => Promise<void>) {
  return render(
    <ResourceForm
      open
      onOpenChange={() => {}}
      title="Nuevo sector"
      schema={schema}
      fields={fields}
      defaultValues={{ name: "", description: "" }}
      onSubmit={onSubmit}
    />,
  );
}

describe("ResourceForm", () => {
  it("muestra error de validación de Zod y no llama onSubmit", async () => {
    const onSubmit = vi.fn(async () => {});
    setup(onSubmit);
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    expect(await screen.findByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envía valores válidos", async () => {
    const onSubmit = vi.fn(async () => {});
    setup(onSubmit);
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Tecnología" } });
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Tecnología" }),
      ),
    );
  });

  it("muestra toast con el message del API si onSubmit rechaza", async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error("Nombre duplicado");
    });
    setup(onSubmit);
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "X" } });
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Nombre duplicado"));
  });
});
```

- [ ] **Step 5: Implementar `components/resource/resource-form.tsx`** (Dialog por defecto, Sheet opcional; render por `FieldType`; toast en error):
```tsx
"use client";

import { useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TypeOf, ZodType } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { FieldConfig } from "./field-config";

export interface ResourceFormProps<S extends ZodType> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  schema: S;
  fields: FieldConfig[];
  defaultValues: DefaultValues<TypeOf<S>>;
  submitLabel?: string;
  container?: "dialog" | "sheet";
  onSubmit: (values: TypeOf<S>) => Promise<void>;
}

export function ResourceForm<S extends ZodType>({
  open,
  onOpenChange,
  title,
  schema,
  fields,
  defaultValues,
  submitLabel = "Guardar",
  container = "dialog",
  onSubmit,
}: ResourceFormProps<S>) {
  const form = useForm<TypeOf<S>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function handleSubmit(values: TypeOf<S>) {
    try {
      await onSubmit(values);
      onOpenChange(false);
      form.reset(defaultValues);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar.");
    }
  }

  const body = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as never}
            render={({ field: rhf }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
                <FormControl>{renderControl(field, rhf)}</FormControl>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (container === "sheet") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">{body}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}

type RhfField = {
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  name: string;
};

function renderControl(field: FieldConfig, rhf: RhfField) {
  const id = field.name;
  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          id={id}
          placeholder={field.placeholder}
          value={(rhf.value as string) ?? ""}
          onChange={rhf.onChange}
          onBlur={rhf.onBlur}
        />
      );
    case "switch":
      return (
        <Switch
          id={id}
          checked={Boolean(rhf.value)}
          onCheckedChange={rhf.onChange}
        />
      );
    case "select":
      return (
        <Select value={rhf.value != null ? String(rhf.value) : ""} onValueChange={rhf.onChange}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={field.placeholder ?? "Seleccionar…"} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "number":
      return (
        <Input
          id={id}
          type="number"
          placeholder={field.placeholder}
          value={(rhf.value as number | string) ?? ""}
          onChange={(e) => rhf.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          onBlur={rhf.onBlur}
        />
      );
    default:
      return (
        <Input
          id={id}
          type={field.type === "email" ? "email" : "text"}
          placeholder={field.placeholder}
          value={(rhf.value as string) ?? ""}
          onChange={rhf.onChange}
          onBlur={rhf.onBlur}
        />
      );
  }
}
```
Nota: confirma la firma exacta de `zodResolver` contra la versión instalada de `@hookform/resolvers` (en `^3` es `zodResolver(schema)`); si el resolver instalado exige otra firma, manda la versión instalada.

- [ ] **Step 6: Verde.**
```bash
npx vitest run components/resource/resource-form.test.tsx
```
Esperado: `Test Files 1 passed`, 3 tests en verde.

- [ ] **Step 7: Commit.**
```bash
git add components/resource/field-config.ts components/resource/resource-form.tsx components/resource/resource-form.test.tsx
git commit -m "feat(resource): ResourceForm RHF+Zod en Dialog/Sheet con toast de error de API"
```

---

### Task 3.7: `ResourceDetail<T>` (Drawer)

**Files:**
- Create: `components/resource/resource-detail.tsx`
- Test: `components/resource/resource-detail.test.tsx`

**Interfaces:**
- Produces:
  - `interface DetailField<T> { label: string; render: (row: T) => ReactNode }`
  - `interface ResourceDetailProps<T> { open: boolean; onOpenChange(open:boolean): void; title: string; row: T | null | undefined; fields: DetailField<T>[]; isLoading?: boolean; footer?: ReactNode }`
  - `function ResourceDetail<T>(props): JSX.Element`
- Consumes: `@/components/ui/{drawer,skeleton}`.

- [ ] **Step 1 (Next): Lee `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`** y aplica `'use client'` (Drawer interactivo).

- [ ] **Step 2: Test (rojo) en `components/resource/resource-detail.test.tsx`:**
```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResourceDetail } from "./resource-detail";

interface Row { id: number; name: string; sector: string }

describe("ResourceDetail", () => {
  const fields = [
    { label: "Nombre", render: (r: Row) => r.name },
    { label: "Sector", render: (r: Row) => r.sector },
  ];

  it("renderiza pares etiqueta/valor cuando hay row", () => {
    render(
      <ResourceDetail
        open
        onOpenChange={() => {}}
        title="Cliente"
        row={{ id: 1, name: "ACME", sector: "Tecnología" }}
        fields={fields}
      />,
    );
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("ACME")).toBeInTheDocument();
    expect(screen.getByText("Tecnología")).toBeInTheDocument();
  });

  it("muestra skeleton en loading", () => {
    render(
      <ResourceDetail open onOpenChange={() => {}} title="Cliente" row={null} fields={fields} isLoading />,
    );
    expect(screen.getByTestId("resource-detail-skeleton")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Implementar `components/resource/resource-detail.tsx`:**
```tsx
"use client";

import type { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";

export interface DetailField<T> {
  label: string;
  render: (row: T) => ReactNode;
}

export interface ResourceDetailProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  row: T | null | undefined;
  fields: DetailField<T>[];
  isLoading?: boolean;
  footer?: ReactNode;
}

export function ResourceDetail<T>({
  open,
  onOpenChange,
  title,
  row,
  fields,
  isLoading,
  footer,
}: ResourceDetailProps<T>) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-4">
          {isLoading || !row ? (
            <div data-testid="resource-detail-skeleton" className="space-y-3">
              {Array.from({ length: fields.length || 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <dl className="grid gap-3">
              {fields.map((field) => (
                <div key={field.label} className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                  <dt className="text-sm font-medium text-muted-foreground">{field.label}</dt>
                  <dd className="col-span-2 text-sm text-foreground">{field.render(row)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
}
```

- [ ] **Step 4: Verde.**
```bash
npx vitest run components/resource/resource-detail.test.tsx
```
Esperado: `Test Files 1 passed`, 2 tests en verde.

- [ ] **Step 5: Commit.**
```bash
git add components/resource/resource-detail.tsx components/resource/resource-detail.test.tsx
git commit -m "feat(resource): ResourceDetail en Drawer con pares etiqueta/valor y skeleton"
```

---

### Task 3.8: `lib/resources/createResource(config)` + `ResourceView` ensamblador [TDD]

**Files:**
- Create: `lib/resources/types.ts`
- Create: `lib/resources/create-resource.ts`
- Create: `components/resource/resource-view.tsx`
- Test: `lib/resources/create-resource.test.tsx`
- Create: `lib/resources/__fixtures__/sectors.resource.ts` (recurso de ejemplo para tests)

**Interfaces:**
- Produces:
  - `interface ResourceConfig<T, S extends ZodType> { key: string; label: string; singular: string; endpoint: string; access: "admin" | "auth"; columns: ColumnDef<T, unknown>[]; formSchema: S; formFields: FieldConfig[]; detailFields: DetailField<T>[]; emptyFormValues: DefaultValues<TypeOf<S>>; searchParam?: string; defaultLimit?: number }`
  - `function createResource<T, S>(config): ResourceDescriptor<T, S>` con `{ config, client, hooks }`.
  - `function ResourceView<T, S>({ resource }: { resource: ResourceDescriptor<T, S> }): JSX.Element` — orquesta `ResourceTable` + `ResourceForm` (crear/editar) + `ResourceDetail` con estado de página/búsqueda/diálogos sobre los hooks.
- Consumes: Tasks 3.2 (`createResourceClient`), 3.3 (`createResourceHooks`), 3.5/3.6/3.7 (componentes), `sonner` para confirmación de borrado.

- [ ] **Step 1 (Next): Lee `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`** y aplica `'use client'` a `ResourceView` (estado + hooks de TanStack Query). `create-resource.ts` es puro (sin directiva).

- [ ] **Step 2: Implementar `lib/resources/types.ts`:**
```ts
import type { ColumnDef } from "@tanstack/react-table";
import type { DefaultValues } from "react-hook-form";
import type { TypeOf, ZodType } from "zod";
import type { FieldConfig } from "@/components/resource/field-config";
import type { DetailField } from "@/components/resource/resource-detail";
import type { ResourceClient } from "@/lib/api/resource-client";
import type { ResourceHooks } from "@/lib/api/hooks";

export interface ResourceConfig<T, S extends ZodType> {
  key: string;
  label: string;
  singular: string;
  endpoint: string;
  access: "admin" | "auth";
  columns: ColumnDef<T, unknown>[];
  formSchema: S;
  formFields: FieldConfig[];
  detailFields: DetailField<T>[];
  emptyFormValues: DefaultValues<TypeOf<S>>;
  searchParam?: string;
  defaultLimit?: number;
}

export interface ResourceDescriptor<T, S extends ZodType> {
  config: ResourceConfig<T, S>;
  client: ResourceClient<T, TypeOf<S>, Partial<TypeOf<S>>>;
  hooks: ResourceHooks<T, TypeOf<S>, Partial<TypeOf<S>>>;
}
```

- [ ] **Step 3: Implementar `lib/resources/create-resource.ts`:**
```ts
import type { TypeOf, ZodType } from "zod";
import { createResourceClient } from "@/lib/api/resource-client";
import { createResourceHooks } from "@/lib/api/hooks";
import type { ResourceConfig, ResourceDescriptor } from "./types";

export function createResource<T, S extends ZodType>(
  config: ResourceConfig<T, S>,
): ResourceDescriptor<T, S> {
  const client = createResourceClient<T, TypeOf<S>, Partial<TypeOf<S>>>(config.endpoint);
  const hooks = createResourceHooks<T, TypeOf<S>, Partial<TypeOf<S>>>(config.key, client);
  return { config, client, hooks };
}
```

- [ ] **Step 4: Implementar `components/resource/resource-view.tsx`** (ensamblador genérico que consumen las páginas de recurso):
```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { TypeOf, ZodType } from "zod";
import { Button } from "@/components/ui/button";
import { ResourceTable } from "./resource-table";
import { ResourceForm } from "./resource-form";
import { ResourceDetail } from "./resource-detail";
import type { ResourceDescriptor } from "@/lib/resources/types";
import type { ListParams } from "@/lib/api/types";

export function ResourceView<T extends { id: string | number }, S extends ZodType>({
  resource,
}: {
  resource: ResourceDescriptor<T, S>;
}) {
  const { config, hooks } = resource;
  const limit = config.defaultLimit ?? 20;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [detailRow, setDetailRow] = useState<T | null>(null);

  const params: ListParams = { page, limit };
  if (search && config.searchParam) params[config.searchParam] = search;

  const list = hooks.useList(params);
  const create = hooks.useCreate();
  const update = hooks.useUpdate();
  const remove = hooks.useRemove();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(row: T) {
    setEditing(row);
    setFormOpen(true);
  }

  async function handleSubmit(values: TypeOf<S>) {
    if (editing) {
      await update.mutateAsync({ id: editing.id, dto: values });
      toast.success(`${config.singular} actualizado.`);
    } else {
      await create.mutateAsync(values);
      toast.success(`${config.singular} creado.`);
    }
  }

  async function handleDelete(row: T) {
    try {
      await remove.mutateAsync(row.id);
      toast.success(`${config.singular} eliminado.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">{config.label}</h1>
        <Button onClick={openCreate}>Nuevo</Button>
      </div>

      <ResourceTable<T>
        columns={config.columns}
        data={list.data?.items ?? []}
        total={list.data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        isLoading={list.isLoading}
        isError={list.isError}
        errorMessage={list.error?.message}
        search={config.searchParam ? search : undefined}
        onSearchChange={config.searchParam ? setSearch : undefined}
        searchPlaceholder={`Buscar ${config.label.toLowerCase()}…`}
        emptyMessage={`No hay ${config.label.toLowerCase()}.`}
        onView={setDetailRow}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <ResourceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? `Editar ${config.singular}` : `Nuevo ${config.singular}`}
        schema={config.formSchema}
        fields={config.formFields}
        defaultValues={editing ? (editing as never) : config.emptyFormValues}
        onSubmit={handleSubmit}
      />

      <ResourceDetail<T>
        open={detailRow != null}
        onOpenChange={(open) => !open && setDetailRow(null)}
        title={config.singular}
        row={detailRow}
        fields={config.detailFields}
      />
    </div>
  );
}
```

- [ ] **Step 5: Recurso de ejemplo `lib/resources/__fixtures__/sectors.resource.ts`** (espeja un DTO simple del backend):
```ts
import { z } from "zod";
import { createResource } from "../create-resource";

export interface Sector {
  id: number;
  name: string;
  description?: string;
}

export const sectorSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
});

export const sectorsResource = createResource<Sector, typeof sectorSchema>({
  key: "sectors",
  label: "Sectores",
  singular: "Sector",
  endpoint: "sectors",
  access: "admin",
  searchParam: "search",
  columns: [
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "description", header: "Descripción" },
  ],
  formSchema: sectorSchema,
  formFields: [
    { name: "name", label: "Nombre" },
    { name: "description", label: "Descripción", type: "textarea" },
  ],
  detailFields: [
    { label: "Nombre", render: (r) => r.name },
    { label: "Descripción", render: (r) => r.description ?? "—" },
  ],
  emptyFormValues: { name: "", description: "" },
});
```

- [ ] **Step 6: Tests (rojo) en `lib/resources/create-resource.test.tsx`** (descriptor correcto + render del ensamblador con fetch mockeado):
```tsx
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@/lib/test/query-wrapper";
import { ResourceView } from "@/components/resource/resource-view";
import { sectorsResource, sectorSchema } from "./__fixtures__/sectors.resource";

function mockList(items: unknown[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      status: 200,
      json: async () => ({
        ok: true,
        message: "",
        data: { items, total: items.length, page: 1, limit: 20 },
      }),
    }) as unknown as Response),
  );
}
afterEach(() => vi.unstubAllGlobals());

describe("createResource", () => {
  it("ensambla descriptor con client, hooks y config", () => {
    expect(sectorsResource.config.key).toBe("sectors");
    expect(sectorsResource.client.base).toBe("sectors");
    expect(typeof sectorsResource.hooks.useList).toBe("function");
  });

  it("el formSchema valida los DTOs del backend", () => {
    expect(sectorSchema.safeParse({ name: "" }).success).toBe(false);
    expect(sectorSchema.safeParse({ name: "Tecnología" }).success).toBe(true);
  });

  it("ResourceView lista filas del recurso vía hooks", async () => {
    mockList([{ id: 1, name: "Tecnología", description: "TI" }]);
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={sectorsResource} />, { wrapper });
    expect(await screen.findByText("Tecnología")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/1 resultado/)).toBeInTheDocument());
  });

  it("ResourceView muestra encabezado y botón Nuevo", async () => {
    mockList([]);
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={sectorsResource} />, { wrapper });
    expect(screen.getByRole("heading", { name: "Sectores" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nuevo" })).toBeInTheDocument();
    expect(await screen.findByText("No hay sectores.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Verde + suite completa de la fase.**
```bash
npx vitest run
```
Esperado: todos los archivos de test de `lib/api`, `lib/resources` y `components/resource` en verde.

- [ ] **Step 8: Gate de compilación de la fase.**
```bash
npm run build
```
Esperado: build de Next OK (typecheck incluido), sin errores de tipos en los patrones.

- [ ] **Step 9: Commit.**
```bash
git add lib/resources components/resource/resource-view.tsx
git commit -m "feat(resource): createResource config-driven + ResourceView ensamblando tabla/form/detail"
```


## Fase 4 — Dashboard

I have the full backend metrics contract and the Next 16 docs I need. Here are the Phase 4 tasks.

### Task 4.1: Tipos y hooks de métricas (lib/api/metrics)

**Files:**
- Create: `lib/api/metrics-types.ts`
- Create: `lib/api/metrics.ts`
- Create: `lib/api/metrics-query.ts`
- Test: `lib/api/__tests__/metrics-query.test.ts`

**Interfaces:**
- Consumes: `apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T>` desde `lib/api/client.ts` (Fase 3 — desenvuelve `{ok,message,data}` y lanza `Error(message)`; pega contra el route handler same-origin `/api/proxy/<path>`).
- Consumes: `useQuery` de `@tanstack/react-query`.
- Produces:
  - `type MetricsFilters = { from?: string; to?: string; sectorId?: number; areaId?: number; clientId?: number; responsibleEmployeeId?: number; recruiterId?: number; stageId?: number; status?: 'open' | 'won' | 'lost' }`
  - `buildMetricsQuery(filters: MetricsFilters): Record<string, string>`
  - `metricsKeys` (factory de query keys) y los hooks `useOverview()`, `useCommercial(f)`, `usePipeline(f)`, `useContacts(f)`, `useRequests(f)`, `useRecruitmentFunnel(f)`, `usePlacements(f)`, `useChartByClient(f)`, `useChartBySector(f)`, `useChartByArea(f)`.
  - Tipos de respuesta: `OverviewMetrics`, `CommercialMetrics`, `PipelineStageMetric[]`, `ContactMetric[]`, `RequestsMetrics`, `RecruitmentFunnelStage[]`, `PlacementMetric[]`, `ChartDatum[]`.

- [ ] **Step 1: Definir tipos espejo del backend** en `metrics-types.ts` (shapes exactos de `MetricsService`: `commercial` devuelve `conversionWonTotal`/`conversionWonProposals`/`weightedValue`/`wonValue`/`proposalsSent`/`proposalsAmount`/`totalOpportunities`/`totalWon`; `pipeline` array `{stageId,stageName,sortOrder,count,amount}`; charts `{clientId|sectorId|areaId, clientName|sectorName|areaName, opportunities, won, amount}`).

```ts
// lib/api/metrics-types.ts
export type OpportunityStatus = 'open' | 'won' | 'lost';

export interface MetricsFilters {
  from?: string;
  to?: string;
  sectorId?: number;
  areaId?: number;
  clientId?: number;
  responsibleEmployeeId?: number;
  recruiterId?: number;
  stageId?: number;
  status?: OpportunityStatus;
}

export interface OverviewMetrics {
  clients: number;
  openOpportunities: number;
  pipelineValue: number;
  activeCandidates: number;
  placementsThisMonth: number;
  pendingRequests: number;
}

export interface CommercialMetrics {
  totalOpportunities: number;
  totalWon: number;
  conversionWonTotal: number;
  conversionWonProposals: number;
  proposalsSent: number;
  proposalsAmount: number;
  wonValue: number;
  weightedValue: number;
}

export interface PipelineStageMetric {
  stageId: number;
  stageName: string;
  sortOrder: number;
  count: number;
  amount: number;
}

export interface ContactMetric {
  employeeId: number;
  contactTypeId: number | null;
  contactTypeName: string | null;
  direction: string;
  count: number;
  totalCallLength: number;
  avgCallLength: number;
}

export interface RequestsMetrics {
  total: number;
  handled: number;
  handleRate: number;
  converted: number;
  conversionRate: number;
  avgResponseSeconds: number;
}

export interface RecruitmentFunnelStage {
  stage: string;
  count: number;
}

export interface PlacementMetric {
  recruiterId: number;
  clientId: number;
  count: number;
  totalFee: number;
  avgTimeToFillSeconds: number;
}

export interface ChartDatum {
  clientId?: number | null;
  sectorId?: number | null;
  areaId?: number | null;
  clientName?: string | null;
  sectorName?: string | null;
  areaName?: string | null;
  opportunities: number;
  won: number;
  amount: number;
}
```

- [ ] **Step 2: Función pura `buildMetricsQuery`** en `metrics-query.ts` — omite claves `undefined`/`''`, convierte números a string, deja pasar solo claves conocidas (evita inyectar params no soportados por `MetricsFilterDto`).

```ts
// lib/api/metrics-query.ts
import type { MetricsFilters } from './metrics-types';

const KEYS: (keyof MetricsFilters)[] = [
  'from', 'to', 'sectorId', 'areaId', 'clientId',
  'responsibleEmployeeId', 'recruiterId', 'stageId', 'status',
];

export function buildMetricsQuery(filters: MetricsFilters): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of KEYS) {
    const value = filters[key];
    if (value === undefined || value === null || value === '') continue;
    out[key] = String(value);
  }
  return out;
}
```

- [ ] **Step 3: TDD `buildMetricsQuery`** — Test antes del hook layer (lógica pura, sin red).

```ts
// lib/api/__tests__/metrics-query.test.ts
import { describe, expect, it } from 'vitest';
import { buildMetricsQuery } from '../metrics-query';

describe('buildMetricsQuery', () => {
  it('omite valores vacíos y undefined', () => {
    expect(buildMetricsQuery({ from: '', sectorId: undefined })).toEqual({});
  });
  it('serializa números a string', () => {
    expect(buildMetricsQuery({ sectorId: 3, clientId: 12 })).toEqual({
      sectorId: '3', clientId: '12',
    });
  });
  it('ignora claves no soportadas', () => {
    expect(buildMetricsQuery({ status: 'won', foo: 1 } as never)).toEqual({
      status: 'won',
    });
  });
});
```

- [ ] **Step 4: Hooks TanStack Query** en `metrics.ts` — un helper `metricsQuery(path, key, filters)` DRY que llama `apiGet` con `buildMetricsQuery`; cada hook lo envuelve. `overview` no recibe filtros (el controller lo ignora).

```ts
// lib/api/metrics.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from './client';
import { buildMetricsQuery } from './metrics-query';
import type {
  ChartDatum, CommercialMetrics, ContactMetric, MetricsFilters,
  OverviewMetrics, PipelineStageMetric, PlacementMetric,
  RecruitmentFunnelStage, RequestsMetrics,
} from './metrics-types';

export const metricsKeys = {
  all: ['metrics'] as const,
  one: (name: string, filters: MetricsFilters) =>
    ['metrics', name, filters] as const,
};

function useMetric<T>(name: string, path: string, filters: MetricsFilters) {
  return useQuery({
    queryKey: metricsKeys.one(name, filters),
    queryFn: () => apiGet<T>(`metrics/${path}`, buildMetricsQuery(filters)),
  });
}

export const useOverview = () =>
  useQuery({
    queryKey: metricsKeys.one('overview', {}),
    queryFn: () => apiGet<OverviewMetrics>('metrics/overview'),
  });

export const useCommercial = (f: MetricsFilters) =>
  useMetric<CommercialMetrics>('commercial', 'commercial', f);
export const usePipeline = (f: MetricsFilters) =>
  useMetric<PipelineStageMetric[]>('pipeline', 'pipeline', f);
export const useContacts = (f: MetricsFilters) =>
  useMetric<ContactMetric[]>('contacts', 'contacts', f);
export const useRequests = (f: MetricsFilters) =>
  useMetric<RequestsMetrics>('requests', 'requests', f);
export const useRecruitmentFunnel = (f: MetricsFilters) =>
  useMetric<RecruitmentFunnelStage[]>('recruitment-funnel', 'recruitment/funnel', f);
export const usePlacements = (f: MetricsFilters) =>
  useMetric<PlacementMetric[]>('placements', 'placements', f);
export const useChartByClient = (f: MetricsFilters) =>
  useMetric<ChartDatum[]>('chart-by-client', 'charts/by-client', f);
export const useChartBySector = (f: MetricsFilters) =>
  useMetric<ChartDatum[]>('chart-by-sector', 'charts/by-sector', f);
export const useChartByArea = (f: MetricsFilters) =>
  useMetric<ChartDatum[]>('chart-by-area', 'charts/by-area', f);
```

- [ ] **Step 5: Verificar typecheck.** Comando: `npx tsc --noEmit`. Esperado: sin errores (si `apiGet` aún no existe en Fase 3, este paso confirma la firma consumida).
- [ ] **Step 6: Correr test.** Comando: `npx vitest run lib/api/__tests__/metrics-query.test.ts`. Esperado: `3 passed`.
- [ ] **Step 7: Commit.** Comando: `git add lib/api/metrics-types.ts lib/api/metrics.ts lib/api/metrics-query.ts lib/api/__tests__/metrics-query.test.ts && git commit -m "feat(metrics): tipos y hooks de métricas con filtros comunes"`.

---

### Task 4.2: Estado de filtros del dashboard en URL (searchParams)

**Files:**
- Create: `lib/dashboard/filters.ts`
- Create: `lib/dashboard/use-dashboard-filters.ts`
- Test: `lib/dashboard/__tests__/filters.test.ts`

**Interfaces:**
- Consumes: `MetricsFilters` de `lib/api/metrics-types.ts`; `useRouter`, `usePathname`, `useSearchParams` de `next/navigation`.
- Produces:
  - `parseFilters(params: URLSearchParams | Record<string,string|undefined>): MetricsFilters` (coerción numérica + validación de `status`).
  - `filtersToSearchParams(filters: MetricsFilters): URLSearchParams`.
  - `useDashboardFilters(): { filters: MetricsFilters; setFilter: <K extends keyof MetricsFilters>(key: K, value: MetricsFilters[K]) => void; setFilters: (next: MetricsFilters) => void; reset: () => void }`.

- [ ] **Step 1: Funciones puras `parseFilters` / `filtersToSearchParams`** en `filters.ts` — números via `Number.parseInt` descartando `NaN`/`<1` (espeja `@Min(1)` del DTO), `status` solo si ∈ `['open','won','lost']`, `from`/`to` como string.

```ts
// lib/dashboard/filters.ts
import type { MetricsFilters, OpportunityStatus } from '@/lib/api/metrics-types';

const NUM_KEYS = [
  'sectorId', 'areaId', 'clientId',
  'responsibleEmployeeId', 'recruiterId', 'stageId',
] as const;
const STATUSES: OpportunityStatus[] = ['open', 'won', 'lost'];

type ParamLike = URLSearchParams | Record<string, string | undefined>;

function read(params: ParamLike, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  return params[key];
}

export function parseFilters(params: ParamLike): MetricsFilters {
  const out: MetricsFilters = {};
  for (const key of NUM_KEYS) {
    const raw = read(params, key);
    if (raw === undefined) continue;
    const n = Number.parseInt(raw, 10);
    if (Number.isInteger(n) && n >= 1) out[key] = n;
  }
  const from = read(params, 'from');
  const to = read(params, 'to');
  if (from) out.from = from;
  if (to) out.to = to;
  const status = read(params, 'status');
  if (status && STATUSES.includes(status as OpportunityStatus)) {
    out.status = status as OpportunityStatus;
  }
  return out;
}

export function filtersToSearchParams(filters: MetricsFilters): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    sp.set(key, String(value));
  }
  return sp;
}
```

- [ ] **Step 2: TDD de las funciones puras** (round-trip, coerción, descarte de inválidos).

```ts
// lib/dashboard/__tests__/filters.test.ts
import { describe, expect, it } from 'vitest';
import { filtersToSearchParams, parseFilters } from '../filters';

describe('parseFilters', () => {
  it('coacciona enteros >= 1 y descarta inválidos', () => {
    expect(parseFilters({ sectorId: '3', clientId: '0', areaId: 'x' }))
      .toEqual({ sectorId: 3 });
  });
  it('acepta status válido y rechaza otros', () => {
    expect(parseFilters({ status: 'won' })).toEqual({ status: 'won' });
    expect(parseFilters({ status: 'pending' })).toEqual({});
  });
  it('round-trip con filtersToSearchParams', () => {
    const f = { sectorId: 2, status: 'open' as const, from: '2026-01-01' };
    expect(parseFilters(filtersToSearchParams(f))).toEqual(f);
  });
});
```

- [ ] **Step 3: Lee `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` y usa la API vigente** — `useSearchParams` es hook de Client Component (read-only `URLSearchParams`), el patrón de actualización es `router.push(pathname + '?' + params.toString())` con `useRouter`/`usePathname`. El componente que lo use debe ir bajo `<Suspense>` (build de producción lo exige).
- [ ] **Step 4: Hook `useDashboardFilters`** (Client) que deriva `filters` de `useSearchParams` via `parseFilters`, y muta URL con `router.replace` (sin scroll) preservando historial mínimo.

```tsx
// lib/dashboard/use-dashboard-filters.ts
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { MetricsFilters } from '@/lib/api/metrics-types';
import { filtersToSearchParams, parseFilters } from './filters';

export function useDashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const apply = useCallback(
    (next: MetricsFilters) => {
      const qs = filtersToSearchParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setFilter = useCallback(
    <K extends keyof MetricsFilters>(key: K, value: MetricsFilters[K]) => {
      const next = { ...filters };
      if (value === undefined || value === null || (value as unknown) === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      apply(next);
    },
    [filters, apply],
  );

  const reset = useCallback(() => apply({}), [apply]);

  return { filters, setFilter, setFilters: apply, reset };
}
```

- [ ] **Step 5: Correr test.** Comando: `npx vitest run lib/dashboard/__tests__/filters.test.ts`. Esperado: `3 passed`.
- [ ] **Step 6: Commit.** Comando: `git add lib/dashboard/filters.ts lib/dashboard/use-dashboard-filters.ts lib/dashboard/__tests__/filters.test.ts && git commit -m "feat(dashboard): estado de filtros en URL con searchParams"`.

---

### Task 4.3: Formato de KPIs (GTQ, %, compacto)

**Files:**
- Modify: `lib/format/index.ts` (añade `formatPercent`, `formatCompactNumber`, `formatDuration`)
- Create: `lib/dashboard/kpis.ts`
- Test: `lib/format/__tests__/format-kpi.test.ts`
- Test: `lib/dashboard/__tests__/kpis.test.ts`

**Interfaces:**
- Consumes: `formatGTQ(value: number): string` de `lib/format` (Fase 1/3, locale `es-GT`, moneda `GTQ`).
- Produces:
  - `formatPercent(ratio: number, fractionDigits?: number): string` (recibe ratio 0–1, devuelve `'42%'`).
  - `formatCompactNumber(value: number): string`.
  - `formatDuration(seconds: number): string`.
  - `buildKpis(c: CommercialMetrics): KpiItem[]` con `type KpiItem = { key: string; label: string; value: string; hint?: string }`.

- [ ] **Step 1: Helpers de formato** en `lib/format/index.ts` con `Intl.NumberFormat('es-GT', ...)` (no hardcodear strings de moneda; reusar el patrón de `formatGTQ`).

```ts
// lib/format/index.ts (añadir)
export function formatPercent(ratio: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number.isFinite(ratio) ? ratio : 0);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('es-GT', { notation: 'compact' }).format(value);
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  if (days > 0) return `${days} d ${hours} h`;
  const mins = Math.floor((seconds % 3_600) / 60);
  return hours > 0 ? `${hours} h ${mins} min` : `${mins} min`;
}
```

- [ ] **Step 2: `buildKpis`** en `lib/dashboard/kpis.ts` — mapea las 6 KPI del spec desde `CommercialMetrics` (total oportunidades, ventas won, conversión %, Quetzales ganados, forecast ponderado, propuestas enviadas).

```ts
// lib/dashboard/kpis.ts
import type { CommercialMetrics } from '@/lib/api/metrics-types';
import { formatGTQ, formatPercent } from '@/lib/format';

export interface KpiItem {
  key: string;
  label: string;
  value: string;
  hint?: string;
}

export function buildKpis(c: CommercialMetrics): KpiItem[] {
  return [
    { key: 'total', label: 'Oportunidades', value: String(c.totalOpportunities) },
    { key: 'won', label: 'Ventas ganadas', value: String(c.totalWon) },
    {
      key: 'conversion',
      label: 'Conversión',
      value: formatPercent(c.conversionWonTotal),
      hint: `${formatPercent(c.conversionWonProposals)} sobre propuestas`,
    },
    { key: 'wonValue', label: 'Quetzales ganados', value: formatGTQ(c.wonValue) },
    { key: 'forecast', label: 'Forecast ponderado', value: formatGTQ(c.weightedValue) },
    {
      key: 'proposals',
      label: 'Propuestas enviadas',
      value: String(c.proposalsSent),
      hint: formatGTQ(c.proposalsAmount),
    },
  ];
}
```

- [ ] **Step 3: TDD formato + KPIs.**

```ts
// lib/format/__tests__/format-kpi.test.ts
import { describe, expect, it } from 'vitest';
import { formatDuration, formatPercent } from '../index';

describe('formatPercent', () => {
  it('convierte ratio a porcentaje', () => {
    expect(formatPercent(0.42)).toBe('42%');
  });
  it('protege contra NaN', () => {
    expect(formatPercent(Number.NaN)).toBe('0%');
  });
});

describe('formatDuration', () => {
  it('muestra días y horas', () => {
    expect(formatDuration(90_000)).toBe('1 d 1 h');
  });
  it('devuelve guion para 0', () => {
    expect(formatDuration(0)).toBe('—');
  });
});
```

```ts
// lib/dashboard/__tests__/kpis.test.ts
import { describe, expect, it } from 'vitest';
import { buildKpis } from '../kpis';

const sample = {
  totalOpportunities: 10, totalWon: 4, conversionWonTotal: 0.4,
  conversionWonProposals: 0.5, proposalsSent: 8, proposalsAmount: 50000,
  wonValue: 120000, weightedValue: 30000,
};

describe('buildKpis', () => {
  it('produce 6 KPIs con conversión en porcentaje', () => {
    const kpis = buildKpis(sample);
    expect(kpis).toHaveLength(6);
    expect(kpis.find((k) => k.key === 'conversion')?.value).toBe('40%');
  });
});
```

- [ ] **Step 4: Correr tests.** Comando: `npx vitest run lib/format/__tests__/format-kpi.test.ts lib/dashboard/__tests__/kpis.test.ts`. Esperado: `4 passed`.
- [ ] **Step 5: Commit.** Comando: `git add lib/format/index.ts lib/dashboard/kpis.ts lib/format/__tests__/format-kpi.test.ts lib/dashboard/__tests__/kpis.test.ts && git commit -m "feat(dashboard): helpers de formato y derivación de KPIs"`.

---

### Task 4.4: Instalar componentes shadcn para dashboard (chart, select, etc.)

**Files:**
- Create: `components/ui/chart.tsx`, `components/ui/card.tsx`, `components/ui/select.tsx`, `components/ui/popover.tsx`, `components/ui/calendar.tsx`, `components/ui/skeleton.tsx`, `components/ui/badge.tsx`, `components/ui/separator.tsx` (vía shadcn CLI)
- Modify: `package.json` / `package-lock.json` (recharts, react-day-picker, date-fns)

**Interfaces:**
- Produces: `ChartContainer`, `ChartConfig`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent` de `components/ui/chart`; primitives `Card`, `Select`, `Popover`, `Calendar`, `Skeleton`, `Badge`, `Separator`.

- [ ] **Step 1: Añadir componentes shadcn** (incluye `chart`, que instala Recharts como dependencia y genera `components/ui/chart.tsx`). Comando: `npx shadcn@latest add chart card select popover calendar skeleton badge separator`. Esperado: archivos creados en `components/ui/` y `recharts`/`react-day-picker`/`date-fns` añadidos. Marca: confirmar que la versión de `recharts` resuelta compila con React 19 (build de Step 3).
- [ ] **Step 2: Verificar Recharts instalado.** Comando: `npm ls recharts react-day-picker date-fns`. Esperado: las tres listadas sin `UNMET`.
- [ ] **Step 3: Build de humo.** Comando: `npm run build`. Esperado: compila sin errores de tipos en los nuevos componentes ui.
- [ ] **Step 4: Commit.** Comando: `git add components/ui package.json package-lock.json && git commit -m "chore(ui): componentes shadcn chart/select/calendar para dashboard"`.

---

### Task 4.5: Barra de filtros del dashboard (cliente)

**Files:**
- Create: `components/dashboard/dashboard-filters.tsx`
- Create: `components/dashboard/filter-select.tsx`
- Create: `components/dashboard/date-range-filter.tsx`

**Interfaces:**
- Consumes: `useDashboardFilters` (4.2); hooks de catálogo `useList(resource, params)` de Fase 3 que devuelven `{ data?: { items: Array<{ id: number; name: string }> } }` para `sectors`, `position-areas`, `clients`, `employees`, `pipeline-stages`; primitives `Select`, `Popover`, `Calendar`, `Button`, `Badge`.
- Produces: `<DashboardFilters />` (Client Component) que lee/escribe el estado de filtros en la URL.

- [ ] **Step 1: Lee `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` y aplica el boundary vigente** — todos los componentes de esta tarea usan `useDashboardFilters`/`useState`/eventos, por lo que llevan `'use client'` en la primera línea.
- [ ] **Step 2: `FilterSelect` reutilizable** (DRY: un select tipado para sector/área/cliente/responsable/etapa/estado) — opción "Todos" que limpia el filtro; opciones desde un array `{ value, label }`.

```tsx
// components/dashboard/filter-select.tsx
'use client';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export interface FilterOption {
  value: string;
  label: string;
}

const ALL = '__all__';

export function FilterSelect({
  placeholder, value, options, onChange,
}: {
  placeholder: string;
  value: number | string | undefined;
  options: FilterOption[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Select
      value={value === undefined ? ALL : String(value)}
      onValueChange={(v) => onChange(v === ALL ? undefined : v)}
    >
      <SelectTrigger className="w-44">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}: todos</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 3: `DateRangeFilter`** con `Popover` + `Calendar` (modo `range`, locale es) que escribe `from`/`to` en formato ISO `yyyy-MM-dd` (compatible con `@IsDateString` del DTO). Usa `date-fns/format` y `react-day-picker`. Colores solo via clases token (`text-muted-foreground`, `bg-accent`).
- [ ] **Step 4: `DashboardFilters`** — compone `DateRangeFilter` + seis `FilterSelect` poblados desde los hooks de catálogo (`useList('sectors',{limit:200})`, `'position-areas'`, `'clients'`, `'employees'`, `'pipeline-stages'` con `{active:true}`), más botón "Limpiar" que llama `reset()`. Cada cambio invoca `setFilter(key, value ? Number(value) : undefined)` (status queda string). Layout `flex flex-wrap gap-2` con sticky superior.

```tsx
// components/dashboard/dashboard-filters.tsx (extracto clave)
'use client';

import { useDashboardFilters } from '@/lib/dashboard/use-dashboard-filters';
import { useList } from '@/lib/api/hooks';
import { FilterSelect } from './filter-select';
import { DateRangeFilter } from './date-range-filter';
import { Button } from '@/components/ui/button';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Abiertas' },
  { value: 'won', label: 'Ganadas' },
  { value: 'lost', label: 'Perdidas' },
];

export function DashboardFilters() {
  const { filters, setFilter, reset } = useDashboardFilters();
  const sectors = useList('sectors', { limit: 200 });
  const areas = useList('position-areas', { limit: 200 });
  const clients = useList('clients', { limit: 200 });
  const employees = useList('employees', { limit: 200 });
  const stages = useList('pipeline-stages', { active: true, limit: 200 });

  const opts = (items?: { id: number; name: string }[]) =>
    (items ?? []).map((i) => ({ value: String(i.id), label: i.name }));
  const num = (v: string | undefined) => (v ? Number(v) : undefined);

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 py-3 backdrop-blur">
      <DateRangeFilter
        from={filters.from}
        to={filters.to}
        onChange={(from, to) => { setFilter('from', from); setFilter('to', to); }}
      />
      <FilterSelect placeholder="Sector" value={filters.sectorId}
        options={opts(sectors.data?.items)}
        onChange={(v) => setFilter('sectorId', num(v))} />
      <FilterSelect placeholder="Área" value={filters.areaId}
        options={opts(areas.data?.items)}
        onChange={(v) => setFilter('areaId', num(v))} />
      <FilterSelect placeholder="Cliente" value={filters.clientId}
        options={opts(clients.data?.items)}
        onChange={(v) => setFilter('clientId', num(v))} />
      <FilterSelect placeholder="Responsable" value={filters.responsibleEmployeeId}
        options={opts(employees.data?.items)}
        onChange={(v) => setFilter('responsibleEmployeeId', num(v))} />
      <FilterSelect placeholder="Etapa" value={filters.stageId}
        options={opts(stages.data?.items)}
        onChange={(v) => setFilter('stageId', num(v))} />
      <FilterSelect placeholder="Estado" value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(v) => setFilter('status', v as never)} />
      <Button variant="ghost" size="sm" onClick={reset}>Limpiar</Button>
    </div>
  );
}
```

- [ ] **Step 5: Typecheck.** Comando: `npx tsc --noEmit`. Esperado: sin errores (confirma firma consumida de `useList`).
- [ ] **Step 6: Commit.** Comando: `git add components/dashboard/dashboard-filters.tsx components/dashboard/filter-select.tsx components/dashboard/date-range-filter.tsx && git commit -m "feat(dashboard): barra de filtros comunes con date range y selects de catálogo"`.

---

### Task 4.6: KPI cards con skeletons

**Files:**
- Create: `components/dashboard/kpi-cards.tsx`
- Create: `components/dashboard/kpi-card.tsx`
- Test: `components/dashboard/__tests__/kpi-cards.test.tsx`

**Interfaces:**
- Consumes: `useCommercial` (4.1), `buildKpis`/`KpiItem` (4.3), `Card`, `Skeleton`.
- Produces: `<KpiCards />` (Client Component) que reacciona a los filtros de la URL.

- [ ] **Step 1: `KpiCard` presentacional** (`'use client'` no necesario; puede ser server-safe pero se importa en árbol cliente) — `Card` con `label`, `value` grande en `font-display`, `hint` en `text-muted-foreground`.
- [ ] **Step 2: `KpiCards`** (`'use client'`) — lee filtros con `useDashboardFilters`, llama `useCommercial(filters)`; en `isPending` muestra 6 `Skeleton`; en `isError` muestra `<p className="text-destructive">`; en éxito mapea `buildKpis(data)`. Grid `grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4`.

```tsx
// components/dashboard/kpi-cards.tsx (extracto)
'use client';

import { useCommercial } from '@/lib/api/metrics';
import { useDashboardFilters } from '@/lib/dashboard/use-dashboard-filters';
import { buildKpis } from '@/lib/dashboard/kpis';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from './kpi-card';

export function KpiCards() {
  const { filters } = useDashboardFilters();
  const { data, isPending, isError, error } = useCommercial(filters);

  if (isError) {
    return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {isPending || !data
        ? Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4"><Skeleton className="h-16 w-full" /></Card>
          ))
        : buildKpis(data).map((kpi) => <KpiCard key={kpi.key} {...kpi} />)}
    </div>
  );
}
```

- [ ] **Step 3: Lee `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` y confirma el boundary** — `KpiCards` consume hooks de React Query, va en árbol `'use client'`; test representativo renderiza con `QueryClientProvider` y `useCommercial` mockeado.
- [ ] **Step 4: Test representativo** (mock de `@/lib/api/metrics` y `use-dashboard-filters`; verifica que rinden los 6 labels y el valor de conversión).

```tsx
// components/dashboard/__tests__/kpi-cards.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dashboard/use-dashboard-filters', () => ({
  useDashboardFilters: () => ({ filters: {} }),
}));
vi.mock('@/lib/api/metrics', () => ({
  useCommercial: () => ({
    isPending: false, isError: false,
    data: {
      totalOpportunities: 10, totalWon: 4, conversionWonTotal: 0.4,
      conversionWonProposals: 0.5, proposalsSent: 8, proposalsAmount: 5000,
      wonValue: 120000, weightedValue: 30000,
    },
  }),
}));

import { KpiCards } from '../kpi-cards';

describe('KpiCards', () => {
  it('muestra los KPIs comerciales', () => {
    render(<KpiCards />);
    expect(screen.getByText('Conversión')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('Quetzales ganados')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Correr test.** Comando: `npx vitest run components/dashboard/__tests__/kpi-cards.test.tsx`. Esperado: `1 passed`.
- [ ] **Step 6: Commit.** Comando: `git add components/dashboard/kpi-cards.tsx components/dashboard/kpi-card.tsx components/dashboard/__tests__/kpi-cards.test.tsx && git commit -m "feat(dashboard): KPI cards con skeletons y test representativo"`.

---

### Task 4.7: Gráficas del dashboard (Recharts via shadcn Chart)

**Files:**
- Create: `components/dashboard/chart-card.tsx`
- Create: `components/dashboard/bar-metric-chart.tsx`
- Create: `components/dashboard/pipeline-chart.tsx`
- Create: `components/dashboard/dimension-charts.tsx`
- Create: `components/dashboard/contacts-chart.tsx`
- Create: `components/dashboard/recruitment-funnel-chart.tsx`
- Create: `components/dashboard/placements-chart.tsx`
- Test: `components/dashboard/__tests__/bar-metric-chart.test.tsx`

**Interfaces:**
- Consumes: hooks de 4.1 (`usePipeline`, `useChartByClient/Sector/Area`, `useContacts`, `useRecruitmentFunnel`, `usePlacements`); `useDashboardFilters`; `ChartContainer`/`ChartConfig`/`ChartTooltip`/`ChartTooltipContent`/`ChartLegend` de `components/ui/chart`; `Card`, `Skeleton`.
- Produces: una gráfica de barras genérica `<BarMetricChart>` y wrappers por métrica (todos `'use client'`).

- [ ] **Step 1: `ChartCard` envoltura** (`Card` + título + estados loading/empty/error) DRY para todas las gráficas — `isPending`→`Skeleton h-64`; arreglo vacío→empty state "Sin datos para los filtros"; error→`text-destructive`.
- [ ] **Step 2: `BarMetricChart` genérico** sobre `ChartContainer` + Recharts `BarChart` — props `data`, `categoryKey` (eje X), `series: { key: string; label: string; colorVar: string }[]`. Colores **solo** via CSS vars de token (`--color-<series>` mapeado en `ChartConfig` a `hsl(var(--primary))`/`hsl(var(--accent))`); cero hex.

```tsx
// components/dashboard/bar-metric-chart.tsx (extracto)
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart';

export interface BarSeries { key: string; label: string }

export function BarMetricChart<T extends Record<string, unknown>>({
  data, categoryKey, series,
}: { data: T[]; categoryKey: string; series: BarSeries[] }) {
  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [
      s.key,
      { label: s.label, color: i === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))' },
    ]),
  );
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={4} />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
```

- [ ] **Step 3: Wrappers por métrica** (cada uno lee `filters` con `useDashboardFilters`, llama su hook, envuelve en `ChartCard` + `BarMetricChart`):
  - `PipelineChart`: `usePipeline`, `categoryKey='stageName'`, series `count` (Oportunidades) y `amount` (Monto Q).
  - `DimensionCharts`: tres `ChartCard` (by-client/by-sector/by-area) con `categoryKey` `clientName|sectorName|areaName`, series `opportunities`/`won`.
  - `ContactsChart`: `useContacts`, agrupa por `contactTypeName` sumando `count` (transform en cliente, función pura local `groupContacts`).
  - `RecruitmentFunnelChart`: `useRecruitmentFunnel`, `categoryKey='stage'`, serie `count`.
  - `PlacementsChart`: `usePlacements`, agrupa por `recruiterId` sumando `count`/`totalFee`.
- [ ] **Step 4: Test representativo** de `BarMetricChart` (render con datos mock dentro de un contenedor con tamaño; verificar que monta sin throw y que ResponsiveContainer recibe data). Mockear `recharts` `ResponsiveContainer` para jsdom si hace falta dimensiones.

```tsx
// components/dashboard/__tests__/bar-metric-chart.test.tsx
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('recharts', async (orig) => {
  const actual = await orig<typeof import('recharts')>();
  return { ...actual, ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
    <div style={{ width: 600, height: 300 }}>{children}</div> };
});

import { BarMetricChart } from '../bar-metric-chart';

describe('BarMetricChart', () => {
  it('renderiza sin errores con datos', () => {
    const { container } = render(
      <BarMetricChart
        data={[{ stageName: 'Lead', count: 5 }]}
        categoryKey="stageName"
        series={[{ key: 'count', label: 'Oportunidades' }]}
      />,
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
```

- [ ] **Step 5: Correr test.** Comando: `npx vitest run components/dashboard/__tests__/bar-metric-chart.test.tsx`. Esperado: `1 passed`.
- [ ] **Step 6: Commit.** Comando: `git add components/dashboard/chart-card.tsx components/dashboard/bar-metric-chart.tsx components/dashboard/pipeline-chart.tsx components/dashboard/dimension-charts.tsx components/dashboard/contacts-chart.tsx components/dashboard/recruitment-funnel-chart.tsx components/dashboard/placements-chart.tsx components/dashboard/__tests__/bar-metric-chart.test.tsx && git commit -m "feat(dashboard): gráficas Recharts via shadcn Chart con tokens de marca"`.

---

### Task 4.8: Página del dashboard (Server Component + Suspense)

**Files:**
- Create: `app/(app)/dashboard/page.tsx`
- Create: `app/(app)/dashboard/dashboard-content.tsx`
- Create: `app/(app)/dashboard/loading.tsx`

**Interfaces:**
- Consumes: `DashboardFilters` (4.5), `KpiCards` (4.6), todos los charts (4.7).
- Produces: ruta `/dashboard` dentro del grupo `(app)` (protegida por el middleware de Fase 2).

- [ ] **Step 1: Lee `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` (sección "Rendering with search params") y `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` (sección "Prerendering")** — en Next 16 el prop `searchParams` de page es `Promise<...>` (await), y todo componente cliente que use `useSearchParams` debe ir bajo `<Suspense>`. El page Server Component hace `await searchParams` para optar a dynamic rendering y envuelve el contenido cliente en `<Suspense>`.
- [ ] **Step 2: `DashboardContent`** (`'use client'`) — compone `DashboardFilters`, `KpiCards`, `PipelineChart`, `DimensionCharts`, `ContactsChart`, `RecruitmentFunnelChart`, `PlacementsChart` en un grid responsive. Todo reacciona a la URL via `useDashboardFilters`.

```tsx
// app/(app)/dashboard/dashboard-content.tsx (extracto)
'use client';

import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { PipelineChart } from '@/components/dashboard/pipeline-chart';
import { DimensionCharts } from '@/components/dashboard/dimension-charts';
import { ContactsChart } from '@/components/dashboard/contacts-chart';
import { RecruitmentFunnelChart } from '@/components/dashboard/recruitment-funnel-chart';
import { PlacementsChart } from '@/components/dashboard/placements-chart';

export function DashboardContent() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardFilters />
      <KpiCards />
      <div className="grid gap-6 xl:grid-cols-2">
        <PipelineChart />
        <RecruitmentFunnelChart />
        <ContactsChart />
        <PlacementsChart />
      </div>
      <DimensionCharts />
    </div>
  );
}
```

- [ ] **Step 3: `page.tsx`** Server Component — `await searchParams` (para forzar dynamic rendering ligado al request, evita el bailout de prerender por `useSearchParams`), título `font-display`, y `<Suspense>` alrededor de `DashboardContent`.

```tsx
// app/(app)/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardContent } from './dashboard-content';

export const metadata = { title: 'Dashboard — SIR CRM' };

export default async function DashboardPage(props: PageProps<'/dashboard'>) {
  await props.searchParams;
  return (
    <section className="space-y-6 p-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">Dashboard</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando métricas…</p>}>
        <DashboardContent />
      </Suspense>
    </section>
  );
}
```

- [ ] **Step 4: `loading.tsx`** con skeletons (grid de KPI + 2 charts) para el segmento. Solo `Skeleton` y tokens.
- [ ] **Step 5: Build (typecheck incluido).** Comando: `npm run build`. Esperado: compila; `/dashboard` aparece como ruta dinámica (ƒ) sin error de "Missing Suspense boundary with useSearchParams".
- [ ] **Step 6: Smoke en dev.** Comando: `npm run dev` y abrir `/dashboard`. Esperado: filtros recalculan KPIs/charts al cambiar la URL; skeletons durante carga.
- [ ] **Step 7: Commit.** Comando: `git add "app/(app)/dashboard" && git commit -m "feat(dashboard): página de dashboard con filtros en URL, KPIs y gráficas"`.


## Fase 5 — Comercial

### Task 5.1: Esquemas Zod, tipos y etiquetas del dominio comercial

**Files:**
- Create: `lib/api/types/commercial.ts`
- Create: `lib/schemas/commercial.ts`
- Create: `lib/domain/commercial-labels.ts`
- Test: `lib/schemas/commercial.test.ts`

**Interfaces:**
- Consumes (Fase 3 — ya existentes): `lib/api/client.ts` → `apiFetch<T>(path: string, init?: RequestInit): Promise<T>` (desenvuelve `{ok,message,data}`, lanza `Error(message)`); `export interface Paginated<T> { items: T[]; total: number; page: number; limit: number }`.
- Produces:
  - `lib/api/types/commercial.ts`: `Opportunity`, `PipelineStage`, `Client`, `ClientContact`, `ContactRequest`, `ContactHistory`, enums `Seniority`, `OpportunityStatus`, `ContactDirection`.
  - `lib/schemas/commercial.ts`: `createOpportunitySchema`, `changeStageSchema`, `sendProposalSchema`, `followUpSchema`, `loseOpportunitySchema`, `createClientSchema`, `createClientContactSchema`, `handleContactRequestSchema`, `createContactHistorySchema` (todos `z.ZodObject`), más sus `type ...Input = z.infer<...>`.
  - `lib/domain/commercial-labels.ts`: `seniorityLabels`, `opportunityStatusLabels`, `contactDirectionLabels` (`Record<enum,string>` en español) + `opportunityStatusBadge(status): 'default'|'secondary'|'destructive'`.

- [ ] **Step 1: Tipos espejo de las entidades del backend.** Reflejan exactamente `Opportunity`/`PipelineStage` y catálogos comerciales (campos `nullable` → opcionales).
```ts
// lib/api/types/commercial.ts
export type Seniority = 'junior' | 'mid' | 'senior' | 'lead';
export type OpportunityStatus = 'open' | 'won' | 'lost';
export type ContactDirection = 'inbound' | 'outbound';

export interface PipelineStage {
  id: number; name: string; sortOrder: number; probability: number;
  isWon: boolean; isLost: boolean; active: boolean;
}

export interface Client {
  id: number; name: string; sector?: string | null; sectorId?: number | null;
  employeeSize?: number | null; createdAt?: string; updatedAt?: string;
}

export interface ClientContact {
  id: number; name: string; phoneNumber?: string | null; email?: string | null;
  clientId: number; client?: Client;
}

export interface Opportunity {
  id: number;
  clientId: number; client?: Client;
  areaId?: number | null; area?: { id: number; name: string } | null;
  responsibleEmployeeId: number;
  responsibleEmployee?: { id: number; firstName?: string; lastName?: string } | null;
  clientContactId?: number | null; clientContact?: ClientContact | null;
  pipelineStageId: number; pipelineStage?: PipelineStage;
  originContactRequestId?: number | null;
  title?: string | null;
  seniority?: Seniority | null;
  headcount: number;
  probability: number;
  amount?: number | null;
  currency: string;
  status: OpportunityStatus;
  source?: string | null;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  expectedCloseDate?: string | null;
  proposalSentAt?: string | null;
  wonAt?: string | null;
  lostAt?: string | null;
  lostReason?: string | null;
  createdAt: string; updatedAt: string;
}

export interface ContactRequest {
  id: number; name?: string | null; email?: string | null; phone?: string | null;
  message?: string | null; wasHandled: boolean; handledByEmployeeId?: number | null;
  resultingClientId?: number | null; createdAt: string;
}

export interface ContactHistory {
  id: number; contactId: number; contactType: number; contactTime: string;
  callLength?: number | null; contactDesc?: string | null; phoneNumberDialed?: string | null;
  direction?: ContactDirection | null; opportunityId?: number | null;
  employeeId?: number | null; createdAt: string;
}
```

- [ ] **Step 2: Esquemas Zod que ESPEJAN los DTOs.** `createOpportunitySchema` mapea `CreateOpportunityDto` (requeridos: `clientId`, `responsibleEmployeeId`, `pipelineStageId`; `headcount` min 1; `amount` min 0; `seniority` enum; `expectedCloseDate` ISO date). Acciones: `changeStageSchema` (`pipelineStageId` req, `probability` 0–100 opc, `lostReason` opc), `sendProposalSchema` (`amount` min 0 opc), `followUpSchema` (`nextFollowUpAt` datetime ISO req), `loseOpportunitySchema` (`lostReason` opc).
```ts
// lib/schemas/commercial.ts
import { z } from 'zod';

const idField = z.coerce.number().int().positive();

export const createOpportunitySchema = z.object({
  clientId: idField,
  responsibleEmployeeId: idField,
  pipelineStageId: idField,
  areaId: idField.optional(),
  clientContactId: idField.optional(),
  originContactRequestId: idField.optional(),
  title: z.string().trim().min(1).optional(),
  seniority: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
  headcount: z.coerce.number().int().min(1).optional(),
  amount: z.coerce.number().min(0).optional(),
  currency: z.string().trim().optional(),
  source: z.string().trim().optional(),
  expectedCloseDate: z.string().date().optional(),
});
export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;

export const changeStageSchema = z.object({
  pipelineStageId: idField,
  probability: z.coerce.number().int().min(0).max(100).optional(),
  lostReason: z.string().trim().optional(),
});
export type ChangeStageInput = z.infer<typeof changeStageSchema>;

export const sendProposalSchema = z.object({ amount: z.coerce.number().min(0).optional() });
export type SendProposalInput = z.infer<typeof sendProposalSchema>;

export const followUpSchema = z.object({ nextFollowUpAt: z.string().datetime() });
export type FollowUpInput = z.infer<typeof followUpSchema>;

export const loseOpportunitySchema = z.object({ lostReason: z.string().trim().optional() });
export type LoseOpportunityInput = z.infer<typeof loseOpportunitySchema>;

export const createClientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  sector: z.string().trim().optional(),
  sectorId: z.coerce.number().int().optional(),
  employeeSize: z.coerce.number().int().min(0).optional(),
});
export type CreateClientInput = z.infer<typeof createClientSchema>;

export const createClientContactSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  phoneNumber: z.string().trim().optional(),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  clientId: idField,
});
export type CreateClientContactInput = z.infer<typeof createClientContactSchema>;

export const handleContactRequestSchema = z.object({
  resultingClientId: z.coerce.number().int().positive().optional(),
});
export type HandleContactRequestInput = z.infer<typeof handleContactRequestSchema>;

export const createContactHistorySchema = z.object({
  contactId: idField,
  contactType: idField,
  contactTime: z.string().datetime(),
  callLength: z.coerce.number().int().min(0).optional(),
  contactDesc: z.string().trim().optional(),
  phoneNumberDialed: z.string().trim().optional(),
  direction: z.enum(['inbound', 'outbound']).optional(),
  opportunityId: z.coerce.number().int().positive().optional(),
});
export type CreateContactHistoryInput = z.infer<typeof createContactHistorySchema>;
```

- [ ] **Step 3: Etiquetas en español + variante de badge.**
```ts
// lib/domain/commercial-labels.ts
import type { Seniority, OpportunityStatus, ContactDirection } from '@/lib/api/types/commercial';

export const seniorityLabels: Record<Seniority, string> = {
  junior: 'Junior', mid: 'Semi senior', senior: 'Senior', lead: 'Lead',
};
export const opportunityStatusLabels: Record<OpportunityStatus, string> = {
  open: 'Abierta', won: 'Ganada', lost: 'Perdida',
};
export const contactDirectionLabels: Record<ContactDirection, string> = {
  inbound: 'Entrante', outbound: 'Saliente',
};
export function opportunityStatusBadge(
  status: OpportunityStatus,
): 'default' | 'secondary' | 'destructive' {
  if (status === 'won') return 'default';
  if (status === 'lost') return 'destructive';
  return 'secondary';
}
```

- [ ] **Step 4: Tests representativos de los esquemas.** Casos válidos/ inválidos clave (coerción de ids, `headcount>=1`, `probability` 0–100, email del contacto, enum de seniority).
```ts
// lib/schemas/commercial.test.ts
import { describe, it, expect } from 'vitest';
import {
  createOpportunitySchema, changeStageSchema, createClientContactSchema,
} from './commercial';

describe('createOpportunitySchema', () => {
  it('acepta payload mínimo y coacciona ids string→number', () => {
    const r = createOpportunitySchema.parse({
      clientId: '3', responsibleEmployeeId: '5', pipelineStageId: '1',
    });
    expect(r).toMatchObject({ clientId: 3, responsibleEmployeeId: 5, pipelineStageId: 1 });
  });
  it('rechaza headcount < 1', () => {
    expect(() => createOpportunitySchema.parse({
      clientId: 1, responsibleEmployeeId: 1, pipelineStageId: 1, headcount: 0,
    })).toThrow();
  });
});

describe('changeStageSchema', () => {
  it('rechaza probability fuera de 0..100', () => {
    expect(() => changeStageSchema.parse({ pipelineStageId: 1, probability: 140 })).toThrow();
  });
});

describe('createClientContactSchema', () => {
  it('rechaza email inválido', () => {
    expect(() => createClientContactSchema.parse({
      name: 'Ana', clientId: 1, email: 'no-es-correo',
    })).toThrow();
  });
});
```

- [ ] **Step 5: Ejecuta los tests.** Comando: `npm run test -- lib/schemas/commercial.test.ts`. Esperado: 4 tests passing, 0 fail.

- [ ] **Step 6: Commit.** `git add lib/api/types/commercial.ts lib/schemas/commercial.ts lib/domain/commercial-labels.ts lib/schemas/commercial.test.ts && git commit -m "feat(commercial): tipos, esquemas zod y etiquetas del dominio comercial"`

---

### Task 5.2: API de oportunidades + lógica optimista de mover etapa (TDD completo)

**Files:**
- Create: `lib/kanban/move-stage.ts`
- Create: `lib/api/opportunities.ts`
- Test: `lib/kanban/move-stage.test.ts`
- Test: `lib/api/opportunities.test.tsx`
- Modify: `package.json` (dependencias @dnd-kit)

**Interfaces:**
- Consumes (Fase 3): `apiFetch<T>`, `Paginated<T>` de `lib/api/client.ts`; hooks genéricos de `lib/api/hooks.ts` → `useList<T>(resource: string, params?: Record<string, unknown>): UseQueryResult<Paginated<T>>`, `useCreate<TInput, T>(resource: string): UseMutationResult<T, Error, TInput>`; factory de keys `qk(resource: string, scope?: string, params?: unknown): unknown[]`.
- Produces:
  - `lib/kanban/move-stage.ts`: `applyStageMove(opps: Opportunity[], oppId: number, newStageId: number, newProbability?: number): Opportunity[]`; `applyStatusChange(opps, oppId, status, patch?): Opportunity[]`; `groupByStage(opps: Opportunity[], stages: PipelineStage[]): { stage: PipelineStage; cards: Opportunity[] }[]`; `sumColumnAmount(cards: Opportunity[]): number`.
  - `lib/api/opportunities.ts`: `OPP_KANBAN_KEY`; `useKanbanOpportunities(filters)`; `useActiveStages()`; `useChangeStage()`; `useSendProposal()`; `useFollowUp()`; `useWinOpportunity()`; `useLoseOpportunity()`; `useCreateOpportunity()`. Cada acción es `UseMutationResult` con optimistic update + rollback.

- [ ] **Step 1: Instala la librería de drag-and-drop (fijada para React 19).** Comando: `npm i @dnd-kit/core@6.3.1 @dnd-kit/sortable@10.0.0 @dnd-kit/utilities@3.2.2`. Esperado: añadidas a `dependencies`, `npm` sin errores de peer.

- [ ] **Step 2 (TDD — RED): tests de la lógica pura de tablero.** Escribe primero las aserciones del helper inmutable.
```ts
// lib/kanban/move-stage.test.ts
import { describe, it, expect } from 'vitest';
import { applyStageMove, applyStatusChange, groupByStage, sumColumnAmount } from './move-stage';
import type { Opportunity, PipelineStage } from '@/lib/api/types/commercial';

const opp = (id: number, stageId: number, amount?: number): Opportunity =>
  ({ id, pipelineStageId: stageId, probability: 10, amount, status: 'open',
     clientId: 1, responsibleEmployeeId: 1, headcount: 1, currency: 'GTQ',
     createdAt: '', updatedAt: '' }) as Opportunity;
const stages: PipelineStage[] = [
  { id: 1, name: 'Prospecto', sortOrder: 1, probability: 10, isWon: false, isLost: false, active: true },
  { id: 2, name: 'Propuesta', sortOrder: 2, probability: 50, isWon: false, isLost: false, active: true },
];

describe('applyStageMove', () => {
  it('cambia la etapa y la probabilidad de la oportunidad indicada sin mutar el original', () => {
    const before = [opp(1, 1), opp(2, 1)];
    const after = applyStageMove(before, 1, 2, 50);
    expect(after.find((o) => o.id === 1)).toMatchObject({ pipelineStageId: 2, probability: 50 });
    expect(after.find((o) => o.id === 2)?.pipelineStageId).toBe(1);
    expect(before[0].pipelineStageId).toBe(1); // inmutable
  });
  it('mantiene la probabilidad previa si no se especifica', () => {
    expect(applyStageMove([opp(1, 1)], 1, 2)[0].probability).toBe(10);
  });
});

describe('applyStatusChange', () => {
  it('marca status won y aplica patch', () => {
    const after = applyStatusChange([opp(1, 1)], 1, 'won', { pipelineStageId: 2 });
    expect(after[0]).toMatchObject({ status: 'won', pipelineStageId: 2 });
  });
});

describe('groupByStage', () => {
  it('agrupa por etapa respetando el orden de stages', () => {
    const groups = groupByStage([opp(1, 2), opp(2, 1)], stages);
    expect(groups.map((g) => g.stage.id)).toEqual([1, 2]);
    expect(groups[0].cards.map((c) => c.id)).toEqual([2]);
    expect(groups[1].cards.map((c) => c.id)).toEqual([1]);
  });
});

describe('sumColumnAmount', () => {
  it('suma montos ignorando null/undefined', () => {
    expect(sumColumnAmount([opp(1, 1, 100), opp(2, 1), opp(3, 1, 50)])).toBe(150);
  });
});
```

- [ ] **Step 3 (GREEN): implementa el helper puro.**
```ts
// lib/kanban/move-stage.ts
import type { Opportunity, OpportunityStatus, PipelineStage } from '@/lib/api/types/commercial';

export function applyStageMove(
  opps: Opportunity[], oppId: number, newStageId: number, newProbability?: number,
): Opportunity[] {
  return opps.map((o) =>
    o.id === oppId
      ? { ...o, pipelineStageId: newStageId,
          probability: newProbability ?? o.probability }
      : o,
  );
}

export function applyStatusChange(
  opps: Opportunity[], oppId: number, status: OpportunityStatus, patch: Partial<Opportunity> = {},
): Opportunity[] {
  return opps.map((o) => (o.id === oppId ? { ...o, status, ...patch } : o));
}

export function groupByStage(
  opps: Opportunity[], stages: PipelineStage[],
): { stage: PipelineStage; cards: Opportunity[] }[] {
  const ordered = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
  return ordered.map((stage) => ({
    stage,
    cards: opps.filter((o) => o.pipelineStageId === stage.id),
  }));
}

export function sumColumnAmount(cards: Opportunity[]): number {
  return cards.reduce((acc, c) => acc + (c.amount ?? 0), 0);
}
```

- [ ] **Step 4: Verde de la lógica pura.** Comando: `npm run test -- lib/kanban/move-stage.test.ts`. Esperado: 6 tests passing.

- [ ] **Step 5 (TDD — RED): tests de los hooks de acción (optimismo + rollback + endpoint).** Mockea `apiFetch` y verifica: setQueryData optimista, llamada al endpoint correcto, rollback en error.
```tsx
// lib/api/opportunities.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiFetch: (...a: unknown[]) => apiFetch(...a) }));

import { OPP_KANBAN_KEY, useChangeStage } from './opportunities';
import type { Opportunity } from '@/lib/api/types/commercial';

const card = (id: number, stageId: number): Opportunity =>
  ({ id, pipelineStageId: stageId, probability: 10, status: 'open', clientId: 1,
     responsibleEmployeeId: 1, headcount: 1, currency: 'GTQ', createdAt: '', updatedAt: '' }) as Opportunity;

function wrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useChangeStage', () => {
  let qc: QueryClient;
  beforeEach(() => {
    apiFetch.mockReset();
    qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    qc.setQueryData(OPP_KANBAN_KEY, { items: [card(1, 1), card(2, 1)], total: 2, page: 1, limit: 200 });
  });

  it('aplica optimismo: mueve la tarjeta de etapa antes de resolver', async () => {
    apiFetch.mockImplementation(() => new Promise(() => {})); // pendiente
    const { result } = renderHook(() => useChangeStage(), { wrapper: wrapper(qc) });
    result.current.mutate({ id: 1, pipelineStageId: 2, probability: 50 });
    await waitFor(() => {
      const data = qc.getQueryData<{ items: Opportunity[] }>(OPP_KANBAN_KEY);
      expect(data?.items.find((o) => o.id === 1)?.pipelineStageId).toBe(2);
    });
    expect(apiFetch).toHaveBeenCalledWith(
      'opportunities/1/stage',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('hace rollback si el backend falla', async () => {
    apiFetch.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useChangeStage(), { wrapper: wrapper(qc) });
    result.current.mutate({ id: 1, pipelineStageId: 2 });
    await waitFor(() => expect(result.current.isError).toBe(true));
    const data = qc.getQueryData<{ items: Opportunity[] }>(OPP_KANBAN_KEY);
    expect(data?.items.find((o) => o.id === 1)?.pipelineStageId).toBe(1); // restaurado
  });
});
```

- [ ] **Step 6 (GREEN): implementa la API de oportunidades.** Patrón optimista DRY: helper interno `optimisticMutation` que cancela queries, snapshot, aplica un updater al cache de `OPP_KANBAN_KEY`, hace rollback en `onError` con toast, e invalida en `onSettled`. `win` no envía body; `lose` envía `lostReason`; `proposal` envía `amount`; `follow-up` envía `nextFollowUpAt`.
```ts
// lib/api/opportunities.ts
'use client';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch, type Paginated } from '@/lib/api/client';
import type { Opportunity, PipelineStage } from '@/lib/api/types/commercial';
import { applyStageMove, applyStatusChange } from '@/lib/kanban/move-stage';
import type {
  ChangeStageInput, SendProposalInput, FollowUpInput, LoseOpportunityInput, CreateOpportunityInput,
} from '@/lib/schemas/commercial';

export const OPP_KANBAN_KEY = ['opportunities', 'kanban'] as const;
type Board = Paginated<Opportunity>;

export function useActiveStages() {
  return useQuery({
    queryKey: ['pipeline-stages', 'active'],
    queryFn: () => apiFetch<Paginated<PipelineStage>>('pipeline-stages?active=true&limit=100'),
    select: (p) => [...p.items].sort((a, b) => a.sortOrder - b.sortOrder),
  });
}

export function useKanbanOpportunities(filters: Record<string, string | number | undefined> = {}) {
  const qs = new URLSearchParams({ limit: '200', status: 'open' });
  for (const [k, v] of Object.entries(filters)) if (v !== undefined && v !== '') qs.set(k, String(v));
  return useQuery({
    queryKey: [...OPP_KANBAN_KEY, filters],
    queryFn: () => apiFetch<Board>(`opportunities?${qs.toString()}`),
  });
}

function makeOptimistic<TVars extends { id: number }>(
  qc: QueryClient,
  endpoint: (v: TVars) => string,
  body: (v: TVars) => unknown | undefined,
  updater: (items: Opportunity[], v: TVars) => Opportunity[],
  okMsg: string,
) {
  return {
    mutationFn: (v: TVars) =>
      apiFetch<Opportunity>(endpoint(v), {
        method: 'PATCH',
        ...(body(v) !== undefined
          ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body(v)) }
          : {}),
      }),
    onMutate: async (v: TVars) => {
      await qc.cancelQueries({ queryKey: OPP_KANBAN_KEY });
      const snapshots = qc.getQueriesData<Board>({ queryKey: OPP_KANBAN_KEY });
      for (const [key, data] of snapshots) {
        if (data) qc.setQueryData<Board>(key, { ...data, items: updater(data.items, v) });
      }
      return { snapshots };
    },
    onError: (_e: Error, _v: TVars, ctx?: { snapshots: [unknown, Board | undefined][] }) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key as unknown[], data));
      toast.error('No se pudo actualizar la oportunidad');
    },
    onSuccess: () => toast.success(okMsg),
    onSettled: () => qc.invalidateQueries({ queryKey: OPP_KANBAN_KEY }),
  };
}

export function useChangeStage() {
  const qc = useQueryClient();
  return useMutation(makeOptimistic<{ id: number } & ChangeStageInput>(
    qc,
    (v) => `opportunities/${v.id}/stage`,
    ({ pipelineStageId, probability, lostReason }) => ({ pipelineStageId, probability, lostReason }),
    (items, v) => applyStageMove(items, v.id, v.pipelineStageId, v.probability),
    'Etapa actualizada',
  ));
}

export function useSendProposal() {
  const qc = useQueryClient();
  return useMutation(makeOptimistic<{ id: number } & SendProposalInput>(
    qc,
    (v) => `opportunities/${v.id}/proposal`,
    ({ amount }) => ({ amount }),
    (items, v) => applyStatusChange(items, v.id, 'open',
      { amount: v.amount, proposalSentAt: new Date().toISOString() }),
    'Propuesta enviada',
  ));
}

export function useFollowUp() {
  const qc = useQueryClient();
  return useMutation(makeOptimistic<{ id: number } & FollowUpInput>(
    qc,
    (v) => `opportunities/${v.id}/follow-up`,
    ({ nextFollowUpAt }) => ({ nextFollowUpAt }),
    (items, v) => items.map((o) => (o.id === v.id ? { ...o, nextFollowUpAt: v.nextFollowUpAt } : o)),
    'Seguimiento programado',
  ));
}

export function useWinOpportunity() {
  const qc = useQueryClient();
  return useMutation(makeOptimistic<{ id: number }>(
    qc,
    (v) => `opportunities/${v.id}/win`,
    () => undefined,
    (items, v) => applyStatusChange(items, v.id, 'won', { wonAt: new Date().toISOString() }),
    'Oportunidad ganada',
  ));
}

export function useLoseOpportunity() {
  const qc = useQueryClient();
  return useMutation(makeOptimistic<{ id: number } & LoseOpportunityInput>(
    qc,
    (v) => `opportunities/${v.id}/lose`,
    ({ lostReason }) => ({ lostReason }),
    (items, v) => applyStatusChange(items, v.id, 'lost',
      { lostReason: v.lostReason, lostAt: new Date().toISOString() }),
    'Oportunidad perdida',
  ));
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOpportunityInput) =>
      apiFetch<Opportunity>('opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      toast.success('Oportunidad creada');
      qc.invalidateQueries({ queryKey: OPP_KANBAN_KEY });
    },
    onError: () => toast.error('No se pudo crear la oportunidad'),
  });
}
```

- [ ] **Step 7: Verde de los hooks.** Comando: `npm run test -- lib/api/opportunities.test.tsx`. Esperado: 2 tests passing (optimismo + rollback).

- [ ] **Step 8: Commit.** `git add lib/kanban/move-stage.ts lib/kanban/move-stage.test.ts lib/api/opportunities.ts lib/api/opportunities.test.tsx package.json package-lock.json && git commit -m "feat(opportunities): hooks de acciones con optimistic update y rollback (TDD)"`

---

### Task 5.3: Tablero Kanban de oportunidades (drag-and-drop) y página con toggle de vista

**Files:**
- Create: `components/kanban/opportunity-card.tsx`
- Create: `components/kanban/kanban-column.tsx`
- Create: `components/kanban/opportunity-board.tsx`
- Create: `app/(app)/opportunities/page.tsx`
- Create: `app/(app)/opportunities/opportunities-view.tsx`
- Test: `components/kanban/opportunity-card.test.tsx`

**Interfaces:**
- Consumes: `useKanbanOpportunities`, `useActiveStages`, `useChangeStage` (Task 5.2); `groupByStage`, `sumColumnAmount` (Task 5.2); `formatGTQ(n: number): string`, `formatDate(d: string|Date): string` de `lib/format` (Fase 3); shadcn `card`, `badge`, `skeleton`, `button`, `tabs`, `dropdown-menu`.
- Produces: `OpportunityBoard({ filters })`, `OpportunitiesView()` (toggle kanban/tabla), `page.tsx` (route `/opportunities`).

- [ ] **Step 1: Asegura componentes shadcn necesarios.** Comando: `npx shadcn@latest add card badge skeleton tabs dropdown-menu`. Esperado: archivos en `components/ui/*` (si ya existen, confirmar sobre-escritura saltando los presentes).

- [ ] **Step 2: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` y aplica la API vigente** — los componentes de tablero y la vista necesitan estado/eventos/DnD ⇒ son Client Components con `'use client'` al inicio del archivo (entry points de cliente embebidos en la page server).

- [ ] **Step 3: Tarjeta de oportunidad (sortable, sin hex — solo clases de token).** Chips de monto (Q), probabilidad y próximo seguimiento; resalta seguimiento vencido con `text-destructive`. Menú de acciones rápidas emite callbacks serializables vía props del board.
```tsx
// components/kanban/opportunity-card.tsx
'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { formatGTQ, formatDate } from '@/lib/format';
import type { Opportunity } from '@/lib/api/types/commercial';

export type CardAction = 'win' | 'lose' | 'proposal' | 'follow-up';

export function OpportunityCard({
  opp, onAction,
}: {
  opp: Opportunity;
  onAction: (action: CardAction, opp: Opportunity) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: opp.id });
  const style = { transform: CSS.Translate.toString(transform), transition,
    opacity: isDragging ? 0.5 : 1 };
  const overdue = opp.nextFollowUpAt && new Date(opp.nextFollowUpAt) < new Date();

  return (
    <Card ref={setNodeRef} style={style}
      className="cursor-grab space-y-2 border-border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div {...attributes} {...listeners} className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {opp.title ?? opp.client?.name ?? `Oportunidad #${opp.id}`}
          </p>
          <p className="truncate text-xs text-muted-foreground">{opp.client?.name}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Acciones" className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onAction('proposal', opp)}>Enviar propuesta</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAction('follow-up', opp)}>Programar seguimiento</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAction('win', opp)}>Marcar ganada</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onSelect={() => onAction('lose', opp)}>
              Marcar perdida
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-wrap gap-1">
        {opp.amount != null && <Badge variant="secondary">{formatGTQ(opp.amount)}</Badge>}
        <Badge variant="outline">{opp.probability}%</Badge>
        {opp.nextFollowUpAt && (
          <Badge variant="outline" className={overdue ? 'text-destructive' : 'text-accent'}>
            {formatDate(opp.nextFollowUpAt)}
          </Badge>
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Columna (zona droppable por etapa).**
```tsx
// components/kanban/kanban-column.tsx
'use client';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { OpportunityCard, type CardAction } from './opportunity-card';
import { sumColumnAmount } from '@/lib/kanban/move-stage';
import { formatGTQ } from '@/lib/format';
import type { Opportunity, PipelineStage } from '@/lib/api/types/commercial';

export function KanbanColumn({
  stage, cards, onAction,
}: {
  stage: PipelineStage; cards: Opportunity[];
  onAction: (action: CardAction, opp: Opportunity) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `stage-${stage.id}`, data: { stageId: stage.id } });
  return (
    <div ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-lg bg-muted/50 p-2 ${isOver ? 'ring-2 ring-ring' : ''}`}>
      <div className="flex items-center justify-between px-1 pb-2">
        <h3 className="text-sm font-semibold text-foreground">{stage.name}</h3>
        <span className="text-xs text-muted-foreground">
          {cards.length} · {formatGTQ(sumColumnAmount(cards))}
        </span>
      </div>
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {cards.map((c) => <OpportunityCard key={c.id} opp={c} onAction={onAction} />)}
        </div>
      </SortableContext>
    </div>
  );
}
```

- [ ] **Step 5: Board con `DndContext`, sensores y manejo de drop → optimistic.** Al soltar sobre otra columna llama `useChangeStage().mutate({ id, pipelineStageId, probability })` (probabilidad = la de la etapa destino). Skeleton/empty/error.
```tsx
// components/kanban/opportunity-board.tsx
'use client';
import { useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { useKanbanOpportunities, useActiveStages, useChangeStage } from '@/lib/api/opportunities';
import { groupByStage } from '@/lib/kanban/move-stage';
import { KanbanColumn } from './kanban-column';
import { OpportunityCard, type CardAction } from './opportunity-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Opportunity } from '@/lib/api/types/commercial';

export function OpportunityBoard({
  filters, onAction,
}: {
  filters: Record<string, string | number | undefined>;
  onAction: (action: CardAction, opp: Opportunity) => void;
}) {
  const stagesQ = useActiveStages();
  const oppsQ = useKanbanOpportunities(filters);
  const changeStage = useChangeStage();
  const [active, setActive] = useState<Opportunity | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  if (stagesQ.isLoading || oppsQ.isLoading)
    return <div className="flex gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-96 w-72" />)}</div>;
  if (stagesQ.isError || oppsQ.isError)
    return <p className="text-sm text-destructive">No se pudieron cargar las oportunidades.</p>;

  const items = oppsQ.data?.items ?? [];
  const stages = stagesQ.data ?? [];
  const groups = groupByStage(items, stages);

  const onDragStart = (e: DragStartEvent) =>
    setActive(items.find((o) => o.id === e.active.id) ?? null);

  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const oppId = Number(e.active.id);
    const overStageId = e.over?.data.current?.stageId as number | undefined;
    const opp = items.find((o) => o.id === oppId);
    if (!opp || overStageId == null || overStageId === opp.pipelineStageId) return;
    const target = stages.find((s) => s.id === overStageId);
    changeStage.mutate({ id: oppId, pipelineStageId: overStageId, probability: target?.probability });
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {groups.map((g) => (
          <KanbanColumn key={g.stage.id} stage={g.stage} cards={g.cards} onAction={onAction} />
        ))}
      </div>
      <DragOverlay>{active ? <OpportunityCard opp={active} onAction={() => {}} /> : null}</DragOverlay>
    </DndContext>
  );
}
```

- [ ] **Step 6: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` y usa la API vigente** — `page.tsx` es Server Component mínimo que renderiza el client view; los filtros se leen en cliente con `useSearchParams` (no necesitamos `searchParams` async aquí porque la data se carga client-side con TanStack Query). Aplica `metadata` estática.
```tsx
// app/(app)/opportunities/page.tsx
import type { Metadata } from 'next';
import { OpportunitiesView } from './opportunities-view';

export const metadata: Metadata = { title: 'Oportunidades · SIR CRM' };

export default function OpportunitiesPage() {
  return <OpportunitiesView />;
}
```

- [ ] **Step 7: Vista con toggle Kanban/Tabla + barra de creación.** La tabla y los diálogos se cablean en Tasks 5.4 y 5.5; aquí queda el contenedor con `Tabs` y el estado de diálogo de acción (el dispatcher concreto se completa en 5.4).
```tsx
// app/(app)/opportunities/opportunities-view.tsx
'use client';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { OpportunityBoard } from '@/components/kanban/opportunity-board';
import { OpportunityActionDialogs, type ActionState } from './opportunity-action-dialogs';
import { OpportunityCreateForm } from './opportunity-create-form';
import { OpportunitiesTable } from './opportunities-table';
import type { CardAction } from '@/components/kanban/opportunity-card';
import type { Opportunity } from '@/lib/api/types/commercial';

export function OpportunitiesView() {
  const [creating, setCreating] = useState(false);
  const [action, setAction] = useState<ActionState | null>(null);
  const openAction = (a: CardAction, opp: Opportunity) => setAction({ action: a, opp });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Oportunidades
        </h1>
        <Button onClick={() => setCreating(true)}>Nueva oportunidad</Button>
      </div>
      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="table">Tabla</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban">
          <OpportunityBoard filters={{}} onAction={openAction} />
        </TabsContent>
        <TabsContent value="table">
          <OpportunitiesTable onAction={openAction} />
        </TabsContent>
      </Tabs>
      <OpportunityCreateForm open={creating} onOpenChange={setCreating} />
      <OpportunityActionDialogs state={action} onClose={() => setAction(null)} />
    </div>
  );
}
```

- [ ] **Step 8: Test representativo de la tarjeta (render de chips y acción).**
```tsx
// components/kanban/opportunity-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { OpportunityCard } from './opportunity-card';
import type { Opportunity } from '@/lib/api/types/commercial';

const opp = {
  id: 1, title: 'Reclutador IT', client: { id: 2, name: 'ACME' }, amount: 5000,
  probability: 40, pipelineStageId: 1, status: 'open', clientId: 2,
  responsibleEmployeeId: 1, headcount: 1, currency: 'GTQ', createdAt: '', updatedAt: '',
} as Opportunity;

describe('OpportunityCard', () => {
  it('muestra título, monto en Q y probabilidad', () => {
    render(<DndContext><OpportunityCard opp={opp} onAction={() => {}} /></DndContext>);
    expect(screen.getByText('Reclutador IT')).toBeInTheDocument();
    expect(screen.getByText(/40%/)).toBeInTheDocument();
    expect(screen.getByText(/Q/)).toBeInTheDocument();
  });
  it('emite acción win desde el menú', () => {
    const onAction = vi.fn();
    render(<DndContext><OpportunityCard opp={opp} onAction={onAction} /></DndContext>);
    fireEvent.click(screen.getByLabelText('Acciones'));
    fireEvent.click(screen.getByText('Marcar ganada'));
    expect(onAction).toHaveBeenCalledWith('win', opp);
  });
});
```

- [ ] **Step 9: Verifica tests + typecheck del board.** Comando: `npm run test -- components/kanban/opportunity-card.test.tsx`. Esperado: 2 tests passing. (Las pantallas/diálogos `OpportunityActionDialogs`, `OpportunityCreateForm`, `OpportunitiesTable` se crean en 5.4–5.5; el build completo se valida al final de 5.5.)

- [ ] **Step 10: Commit.** `git add components/kanban app/\(app\)/opportunities/page.tsx app/\(app\)/opportunities/opportunities-view.tsx components/kanban/opportunity-card.test.tsx && git commit -m "feat(opportunities): tablero kanban con drag-and-drop y toggle de vista"`

---

### Task 5.4: Diálogos de acciones rápidas y formulario de creación de oportunidad

**Files:**
- Create: `app/(app)/opportunities/opportunity-action-dialogs.tsx`
- Create: `app/(app)/opportunities/opportunity-create-form.tsx`
- Test: `app/(app)/opportunities/opportunity-action-dialogs.test.tsx`

**Interfaces:**
- Consumes: `useSendProposal`, `useFollowUp`, `useWinOpportunity`, `useLoseOpportunity`, `useCreateOpportunity` (Task 5.2); esquemas `sendProposalSchema`, `followUpSchema`, `loseOpportunitySchema`, `createOpportunitySchema` (Task 5.1); `ResourceForm`/`useList` (Fase 3) para selects de cliente/etapa/empleado/área; shadcn `dialog`, `input`, `textarea`, `select`, `label`, `button`; `react-hook-form` + `@hookform/resolvers/zod`.
- Produces: `type ActionState = { action: CardAction; opp: Opportunity }`; `OpportunityActionDialogs({ state, onClose })`; `OpportunityCreateForm({ open, onOpenChange })`.

- [ ] **Step 1: Asegura componentes shadcn de formulario.** Comando: `npx shadcn@latest add dialog input textarea select label`. Esperado: presentes en `components/ui/*`.

- [ ] **Step 2: Diálogos por acción (win confirma; lose pide motivo; proposal pide monto; follow-up pide fecha-hora).** `win` no envía body; al éxito de cualquier mutación cierra. Usa `<input type="datetime-local">` y convierte a ISO para `nextFollowUpAt`.
```tsx
// app/(app)/opportunities/opportunity-action-dialogs.tsx
'use client';
import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useSendProposal, useFollowUp, useWinOpportunity, useLoseOpportunity,
} from '@/lib/api/opportunities';
import type { CardAction } from '@/components/kanban/opportunity-card';
import type { Opportunity } from '@/lib/api/types/commercial';

export type ActionState = { action: CardAction; opp: Opportunity };

const titles: Record<CardAction, string> = {
  win: 'Marcar como ganada', lose: 'Marcar como perdida',
  proposal: 'Enviar propuesta', 'follow-up': 'Programar seguimiento',
};

export function OpportunityActionDialogs({
  state, onClose,
}: {
  state: ActionState | null; onClose: () => void;
}) {
  const proposal = useSendProposal();
  const followUp = useFollowUp();
  const win = useWinOpportunity();
  const lose = useLoseOpportunity();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [when, setWhen] = useState('');

  if (!state) return null;
  const { action, opp } = state;
  const close = () => { setAmount(''); setReason(''); setWhen(''); onClose(); };

  const submit = () => {
    if (action === 'win') win.mutate({ id: opp.id }, { onSuccess: close });
    if (action === 'lose') lose.mutate({ id: opp.id, lostReason: reason || undefined }, { onSuccess: close });
    if (action === 'proposal')
      proposal.mutate({ id: opp.id, amount: amount ? Number(amount) : undefined }, { onSuccess: close });
    if (action === 'follow-up' && when)
      followUp.mutate({ id: opp.id, nextFollowUpAt: new Date(when).toISOString() }, { onSuccess: close });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{titles[action]}</DialogTitle></DialogHeader>
        {action === 'win' && <p className="text-sm text-muted-foreground">¿Confirmas marcar esta oportunidad como ganada?</p>}
        {action === 'lose' && (
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de pérdida</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        )}
        {action === 'proposal' && (
          <div className="space-y-2">
            <Label htmlFor="amount">Monto (GTQ)</Label>
            <Input id="amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        )}
        {action === 'follow-up' && (
          <div className="space-y-2">
            <Label htmlFor="when">Próximo seguimiento</Label>
            <Input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={close}>Cancelar</Button>
          <Button onClick={submit}
            disabled={(action === 'follow-up' && !when) ||
              proposal.isPending || followUp.isPending || win.isPending || lose.isPending}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Formulario de creación (RHF + Zod espejando `CreateOpportunityDto`).** Selects poblados con `useList('clients')`, `useList('pipeline-stages')`, `useList('employees')`, `useList('position-areas')`. Reusa `ResourceForm` si su API lo permite; aquí se muestra el patrón directo con RHF para los campos requeridos/condicionales.
```tsx
// app/(app)/opportunities/opportunity-create-form.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createOpportunitySchema, type CreateOpportunityInput } from '@/lib/schemas/commercial';
import { useCreateOpportunity } from '@/lib/api/opportunities';
import { useList } from '@/lib/api/hooks';
import type { Client, PipelineStage } from '@/lib/api/types/commercial';

export function OpportunityCreateForm({
  open, onOpenChange,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
}) {
  const create = useCreateOpportunity();
  const clients = useList<Client>('clients', { limit: 100 });
  const stages = useList<PipelineStage>('pipeline-stages', { active: true, limit: 100 });
  const employees = useList<{ id: number; firstName?: string; lastName?: string }>('employees', { limit: 100 });
  const { register, handleSubmit, formState: { errors } } = useForm<CreateOpportunityInput>({
    resolver: zodResolver(createOpportunitySchema),
  });

  const onSubmit = (values: CreateOpportunityInput) =>
    create.mutate(values, { onSuccess: () => onOpenChange(false) });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva oportunidad</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="clientId">Cliente</Label>
            <select id="clientId" className="w-full rounded-md border border-input bg-background p-2 text-sm"
              {...register('clientId')}>
              <option value="">Selecciona…</option>
              {clients.data?.items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.clientId && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="responsibleEmployeeId">Responsable</Label>
            <select id="responsibleEmployeeId" className="w-full rounded-md border border-input bg-background p-2 text-sm"
              {...register('responsibleEmployeeId')}>
              <option value="">Selecciona…</option>
              {employees.data?.items.map((e) => (
                <option key={e.id} value={e.id}>{[e.firstName, e.lastName].filter(Boolean).join(' ') || `#${e.id}`}</option>
              ))}
            </select>
            {errors.responsibleEmployeeId && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="pipelineStageId">Etapa</Label>
            <select id="pipelineStageId" className="w-full rounded-md border border-input bg-background p-2 text-sm"
              {...register('pipelineStageId')}>
              <option value="">Selecciona…</option>
              {stages.data?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.pipelineStageId && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register('title')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="amount">Monto (GTQ)</Label>
            <Input id="amount" type="number" min={0} step="0.01" {...register('amount')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>Crear</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Test representativo de los diálogos de acción (proposal envía monto).**
```tsx
// app/(app)/opportunities/opportunity-action-dialogs.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mutate = vi.fn();
vi.mock('@/lib/api/opportunities', () => ({
  useSendProposal: () => ({ mutate, isPending: false }),
  useFollowUp: () => ({ mutate: vi.fn(), isPending: false }),
  useWinOpportunity: () => ({ mutate: vi.fn(), isPending: false }),
  useLoseOpportunity: () => ({ mutate: vi.fn(), isPending: false }),
}));
import { OpportunityActionDialogs } from './opportunity-action-dialogs';
import type { Opportunity } from '@/lib/api/types/commercial';

const opp = { id: 7 } as Opportunity;

describe('OpportunityActionDialogs', () => {
  beforeEach(() => mutate.mockReset());
  it('envía propuesta con el monto ingresado', () => {
    render(<OpportunityActionDialogs state={{ action: 'proposal', opp }} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText('Monto (GTQ)'), { target: { value: '1200' } });
    fireEvent.click(screen.getByText('Confirmar'));
    expect(mutate).toHaveBeenCalledWith({ id: 7, amount: 1200 }, expect.any(Object));
  });
});
```

- [ ] **Step 5: Verifica.** Comando: `npm run test -- app/\(app\)/opportunities/opportunity-action-dialogs.test.tsx`. Esperado: 1 test passing.

- [ ] **Step 6: Commit.** `git add app/\(app\)/opportunities/opportunity-action-dialogs.tsx app/\(app\)/opportunities/opportunity-create-form.tsx app/\(app\)/opportunities/opportunity-action-dialogs.test.tsx && git commit -m "feat(opportunities): diálogos de acciones rápidas y formulario de creación"`

---

### Task 5.5: Vista de tabla de oportunidades con filtros

**Files:**
- Create: `app/(app)/opportunities/opportunities-table.tsx`
- Create: `app/(app)/opportunities/opportunity-filters.tsx`

**Interfaces:**
- Consumes: `ResourceTable<T>` (Fase 3) → `ResourceTable<T>({ columns, data, total, page, limit, onPageChange, isLoading, isError })`; `useList<Opportunity>('opportunities', params)`; `formatGTQ`, `formatDate` (Fase 3); `opportunityStatusLabels`, `opportunityStatusBadge`, `seniorityLabels` (Task 5.1); `useList` para selects de filtros; `ColumnDef` de `@tanstack/react-table`; shadcn `select`, `badge`.
- Produces: `OpportunitiesTable({ onAction })`, `OpportunityFilters({ value, onChange })` con filtros `clientId/sectorId/areaId/stageId/status/responsibleEmployeeId/followUpDue`.

- [ ] **Step 1: Barra de filtros (estado controlado, espeja `QueryOpportunityDto`).** `followUpDue` como checkbox; selects poblados con `useList`. Sin hex: solo clases de token.
```tsx
// app/(app)/opportunities/opportunity-filters.tsx
'use client';
import { useList } from '@/lib/api/hooks';
import { opportunityStatusLabels } from '@/lib/domain/commercial-labels';
import type { Client, PipelineStage, OpportunityStatus } from '@/lib/api/types/commercial';

export type OppFilters = {
  clientId?: number; sectorId?: number; areaId?: number; stageId?: number;
  status?: OpportunityStatus; responsibleEmployeeId?: number; followUpDue?: boolean;
};

export function OpportunityFilters({
  value, onChange,
}: {
  value: OppFilters; onChange: (next: OppFilters) => void;
}) {
  const clients = useList<Client>('clients', { limit: 100 });
  const stages = useList<PipelineStage>('pipeline-stages', { limit: 100 });
  const set = (patch: Partial<OppFilters>) => onChange({ ...value, ...patch });
  const num = (v: string) => (v ? Number(v) : undefined);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <select className="rounded-md border border-input bg-background p-2 text-sm"
        value={value.clientId ?? ''} onChange={(e) => set({ clientId: num(e.target.value) })}>
        <option value="">Todos los clientes</option>
        {clients.data?.items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select className="rounded-md border border-input bg-background p-2 text-sm"
        value={value.stageId ?? ''} onChange={(e) => set({ stageId: num(e.target.value) })}>
        <option value="">Todas las etapas</option>
        {stages.data?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <select className="rounded-md border border-input bg-background p-2 text-sm"
        value={value.status ?? ''} onChange={(e) => set({ status: (e.target.value || undefined) as OpportunityStatus })}>
        <option value="">Todos los estados</option>
        {Object.entries(opportunityStatusLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={!!value.followUpDue}
          onChange={(e) => set({ followUpDue: e.target.checked || undefined })} />
        Seguimiento vencido
      </label>
    </div>
  );
}
```

- [ ] **Step 2: Tabla con `ResourceTable` + columnas tipadas.** Estado local de filtros y paginación offset; el botón de fila reusa el dispatcher de acciones (`onAction`).
```tsx
// app/(app)/opportunities/opportunities-table.tsx
'use client';
import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ResourceTable } from '@/components/resource/resource-table';
import { Badge } from '@/components/ui/badge';
import { useList } from '@/lib/api/hooks';
import { formatGTQ, formatDate } from '@/lib/format';
import { opportunityStatusLabels, opportunityStatusBadge } from '@/lib/domain/commercial-labels';
import { OpportunityFilters, type OppFilters } from './opportunity-filters';
import type { CardAction } from '@/components/kanban/opportunity-card';
import type { Opportunity } from '@/lib/api/types/commercial';

export function OpportunitiesTable({
  onAction,
}: {
  onAction: (action: CardAction, opp: Opportunity) => void;
}) {
  const [filters, setFilters] = useState<OppFilters>({});
  const [page, setPage] = useState(1);
  const limit = 20;
  const q = useList<Opportunity>('opportunities', { ...filters, page, limit });

  const columns: ColumnDef<Opportunity>[] = [
    { accessorKey: 'title', header: 'Título',
      cell: ({ row }) => row.original.title ?? row.original.client?.name ?? `#${row.original.id}` },
    { id: 'client', header: 'Cliente', cell: ({ row }) => row.original.client?.name ?? '—' },
    { accessorKey: 'pipelineStage', header: 'Etapa', cell: ({ row }) => row.original.pipelineStage?.name ?? '—' },
    { accessorKey: 'amount', header: 'Monto',
      cell: ({ row }) => (row.original.amount != null ? formatGTQ(row.original.amount) : '—') },
    { accessorKey: 'probability', header: 'Prob.', cell: ({ row }) => `${row.original.probability}%` },
    { accessorKey: 'status', header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={opportunityStatusBadge(row.original.status)}>
          {opportunityStatusLabels[row.original.status]}
        </Badge>
      ) },
    { accessorKey: 'nextFollowUpAt', header: 'Seguimiento',
      cell: ({ row }) => (row.original.nextFollowUpAt ? formatDate(row.original.nextFollowUpAt) : '—') },
  ];

  return (
    <div className="space-y-4">
      <OpportunityFilters value={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
      <ResourceTable<Opportunity>
        columns={columns}
        data={q.data?.items ?? []}
        total={q.data?.total ?? 0}
        page={page} limit={limit} onPageChange={setPage}
        isLoading={q.isLoading} isError={q.isError}
        onRowAction={(opp) => onAction('proposal', opp)}
      />
    </div>
  );
}
```

- [ ] **Step 3: Build completo de la fase de oportunidades.** Comando: `npm run build`. Esperado: build exitoso (typecheck de Next pasa; rutas `/opportunities` compiladas; sin errores de tipos en board/diálogos/tabla).

- [ ] **Step 4: Commit.** `git add app/\(app\)/opportunities/opportunities-table.tsx app/\(app\)/opportunities/opportunity-filters.tsx && git commit -m "feat(opportunities): vista de tabla con filtros y paginación"`

---

### Task 5.6: Recurso Clientes (createResource: CRUD, ?sectorId, detalle con contactos)

**Files:**
- Create: `lib/resources/clients.ts`
- Create: `app/(app)/clients/page.tsx`
- Create: `components/resource/client-detail.tsx`
- Test: `lib/resources/clients.test.ts`

**Interfaces:**
- Consumes: `createResource<T, TForm>(config: ResourceConfig<T, TForm>): { ListPage: () => JSX.Element }` (Fase 3); `ResourceConfig` shape `{ key, label, columns, formSchema, formFields, endpoints, access }`; `useOne<T>(resource, id)` (Fase 3) para detalle; `useList<Sector>` para el select; `apiFetch`; shadcn `drawer`/`sheet`, `badge`; esquema `createClientSchema` (Task 5.1).
- Produces: `clientsResource` (config + `ListPage`), `ClientDetail({ id })` mostrando datos + contactos (`GET /clients/:id` incluye `contacts`).

- [ ] **Step 1: Config del recurso (DRY — patrón base para 5.7 y catálogos).** Declara columnas, `formSchema=createClientSchema`, campos de formulario, endpoints (`clients`), filtro `sectorId`, acceso `auth`.
```ts
// lib/resources/clients.ts
import { createResource } from '@/lib/resources/create-resource';
import { createClientSchema } from '@/lib/schemas/commercial';
import type { Client } from '@/lib/api/types/commercial';

export const clientsResource = createResource<Client, typeof createClientSchema>({
  key: 'clients',
  label: 'Clientes',
  endpoints: { base: 'clients' },
  access: 'auth',
  formSchema: createClientSchema,
  filters: [{ name: 'sectorId', label: 'Sector', type: 'select', optionsResource: 'sectors' }],
  columns: [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'sector', header: 'Sector', cell: (c) => c.sector ?? '—' },
    { accessorKey: 'employeeSize', header: 'Empleados', cell: (c) => c.employeeSize ?? '—' },
  ],
  formFields: [
    { name: 'name', label: 'Nombre', type: 'text' },
    { name: 'sector', label: 'Sector (texto)', type: 'text' },
    { name: 'sectorId', label: 'Sector (catálogo)', type: 'select', optionsResource: 'sectors' },
    { name: 'employeeSize', label: 'Tamaño (empleados)', type: 'number' },
  ],
});
```

- [ ] **Step 2: Detalle con contactos (drawer).** `GET /clients/:id` trae `contacts`; lista nombre/teléfono/email.
```tsx
// components/resource/client-detail.tsx
'use client';
import { useOne } from '@/lib/api/hooks';
import { Badge } from '@/components/ui/badge';
import type { Client, ClientContact } from '@/lib/api/types/commercial';

export function ClientDetail({ id }: { id: number }) {
  const q = useOne<Client & { contacts?: ClientContact[] }>('clients', id);
  if (q.isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (q.isError || !q.data) return <p className="text-sm text-destructive">No se pudo cargar el cliente.</p>;
  const c = q.data;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">{c.name}</h2>
        <p className="text-sm text-muted-foreground">{c.sector ?? 'Sin sector'}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Contactos</h3>
        {(c.contacts ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sin contactos.</p>}
        {(c.contacts ?? []).map((ct) => (
          <div key={ct.id} className="flex items-center justify-between rounded-md border border-border p-2">
            <span className="text-sm text-foreground">{ct.name}</span>
            <span className="flex gap-2">
              {ct.phoneNumber && <Badge variant="outline">{ct.phoneNumber}</Badge>}
              {ct.email && <Badge variant="secondary">{ct.email}</Badge>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` y usa la API vigente** — la page es Server Component que renderiza el `ListPage` (client) del recurso, con metadata estática.
```tsx
// app/(app)/clients/page.tsx
import type { Metadata } from 'next';
import { clientsResource } from '@/lib/resources/clients';
import { ClientDetail } from '@/components/resource/client-detail';

export const metadata: Metadata = { title: 'Clientes · SIR CRM' };

export default function ClientsPage() {
  return <clientsResource.ListPage renderDetail={(id: number) => <ClientDetail id={id} />} />;
}
```

- [ ] **Step 4: Test de la config (columnas/endpoints/esquema correctos).**
```ts
// lib/resources/clients.test.ts
import { describe, it, expect } from 'vitest';
import { clientsResource } from './clients';

describe('clientsResource', () => {
  it('usa el endpoint clients y expone filtro sectorId', () => {
    expect(clientsResource.config.endpoints.base).toBe('clients');
    expect(clientsResource.config.filters?.some((f) => f.name === 'sectorId')).toBe(true);
  });
  it('valida nombre obligatorio vía formSchema', () => {
    expect(() => clientsResource.config.formSchema.parse({ name: '' })).toThrow();
  });
});
```

- [ ] **Step 5: Verifica + build.** Comandos: `npm run test -- lib/resources/clients.test.ts` (Esperado: 2 passing) y `npm run build` (Esperado: ruta `/clients` compilada).

- [ ] **Step 6: Commit.** `git add lib/resources/clients.ts app/\(app\)/clients/page.tsx components/resource/client-detail.tsx lib/resources/clients.test.ts && git commit -m "feat(clients): recurso clientes con filtro por sector y detalle con contactos"`

---

### Task 5.7: Recurso Contactos de cliente (createResource, ?clientId)

**Files:**
- Create: `lib/resources/client-contacts.ts`
- Create: `app/(app)/client-contacts/page.tsx`

**Interfaces:**
- Consumes: `createResource` (Fase 3); `createClientContactSchema` (Task 5.1); `useList<Client>` para el select de cliente.
- Produces: `clientContactsResource` (config + `ListPage`), ruta `/client-contacts`.

- [ ] **Step 1: Config del recurso (mismo patrón que 5.6; solo lo específico).** `formSchema=createClientContactSchema`; filtro `clientId`; campos `name/phoneNumber/email/clientId`.
```ts
// lib/resources/client-contacts.ts
import { createResource } from '@/lib/resources/create-resource';
import { createClientContactSchema } from '@/lib/schemas/commercial';
import type { ClientContact } from '@/lib/api/types/commercial';

export const clientContactsResource = createResource<ClientContact, typeof createClientContactSchema>({
  key: 'client-contacts',
  label: 'Contactos',
  endpoints: { base: 'client-contacts' },
  access: 'auth',
  formSchema: createClientContactSchema,
  filters: [{ name: 'clientId', label: 'Cliente', type: 'select', optionsResource: 'clients' }],
  columns: [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'phoneNumber', header: 'Teléfono', cell: (c) => c.phoneNumber ?? '—' },
    { accessorKey: 'email', header: 'Correo', cell: (c) => c.email ?? '—' },
    { id: 'client', header: 'Cliente', cell: (c) => c.client?.name ?? `#${c.clientId}` },
  ],
  formFields: [
    { name: 'name', label: 'Nombre', type: 'text' },
    { name: 'phoneNumber', label: 'Teléfono', type: 'text' },
    { name: 'email', label: 'Correo', type: 'text' },
    { name: 'clientId', label: 'Cliente', type: 'select', optionsResource: 'clients' },
  ],
});
```

- [ ] **Step 2: Page (server → ListPage client).**
```tsx
// app/(app)/client-contacts/page.tsx
import type { Metadata } from 'next';
import { clientContactsResource } from '@/lib/resources/client-contacts';

export const metadata: Metadata = { title: 'Contactos · SIR CRM' };

export default function ClientContactsPage() {
  return <clientContactsResource.ListPage />;
}
```

- [ ] **Step 3: Build.** Comando: `npm run build`. Esperado: ruta `/client-contacts` compilada sin errores.

- [ ] **Step 4: Commit.** `git add lib/resources/client-contacts.ts app/\(app\)/client-contacts/page.tsx && git commit -m "feat(client-contacts): recurso de contactos con filtro por cliente"`

---

### Task 5.8: Inbox de Contact-Requests (filtrable + acción Atender)

**Files:**
- Create: `lib/api/contact-requests.ts`
- Create: `app/(app)/contact-requests/page.tsx`
- Create: `app/(app)/contact-requests/requests-inbox.tsx`
- Create: `app/(app)/contact-requests/handle-request-dialog.tsx`
- Test: `lib/api/contact-requests.test.tsx`

**Interfaces:**
- Consumes: `apiFetch`, `Paginated` (Fase 3); `handleContactRequestSchema` (Task 5.1); `formatDateTime` (Fase 3); shadcn `tabs`, `dialog`, `input`, `badge`, `button`, `skeleton`.
- Produces: `useContactRequests(wasHandled?: boolean)`; `useHandleRequest()` (`PATCH /contact-requests/:id/handle`, optimista, invalida); `RequestsInbox()`, `HandleRequestDialog({ request, onClose })`.

- [ ] **Step 1: API del inbox (lista por `?wasHandled` + acción handle).**
```ts
// lib/api/contact-requests.ts
'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch, type Paginated } from '@/lib/api/client';
import type { ContactRequest } from '@/lib/api/types/commercial';
import type { HandleContactRequestInput } from '@/lib/schemas/commercial';

const KEY = ['contact-requests'] as const;

export function useContactRequests(wasHandled?: boolean) {
  const qs = new URLSearchParams({ limit: '50' });
  if (wasHandled !== undefined) qs.set('wasHandled', String(wasHandled));
  return useQuery({
    queryKey: [...KEY, { wasHandled }],
    queryFn: () => apiFetch<Paginated<ContactRequest>>(`contact-requests?${qs.toString()}`),
  });
}

export function useHandleRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number } & HandleContactRequestInput) =>
      apiFetch<ContactRequest>(`contact-requests/${id}/handle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Solicitud atendida');
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error('No se pudo atender la solicitud'),
  });
}
```

- [ ] **Step 2: Diálogo Atender (resultingClientId opcional).**
```tsx
// app/(app)/contact-requests/handle-request-dialog.tsx
'use client';
import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHandleRequest } from '@/lib/api/contact-requests';
import type { ContactRequest } from '@/lib/api/types/commercial';

export function HandleRequestDialog({
  request, onClose,
}: {
  request: ContactRequest | null; onClose: () => void;
}) {
  const handle = useHandleRequest();
  const [clientId, setClientId] = useState('');
  if (!request) return null;
  const submit = () =>
    handle.mutate(
      { id: request.id, resultingClientId: clientId ? Number(clientId) : undefined },
      { onSuccess: () => { setClientId(''); onClose(); } },
    );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Atender solicitud</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{request.name} · {request.email ?? request.phone}</p>
        <div className="space-y-1">
          <Label htmlFor="clientId">Cliente resultante (opcional)</Label>
          <Input id="clientId" type="number" min={1} value={clientId}
            onChange={(e) => setClientId(e.target.value)} placeholder="ID de cliente" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={handle.isPending}>Marcar como atendida</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Inbox con tabs Pendientes/Atendidas.**
```tsx
// app/(app)/contact-requests/requests-inbox.tsx
'use client';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useContactRequests } from '@/lib/api/contact-requests';
import { HandleRequestDialog } from './handle-request-dialog';
import { formatDateTime } from '@/lib/format';
import type { ContactRequest } from '@/lib/api/types/commercial';

function List({ wasHandled }: { wasHandled: boolean }) {
  const q = useContactRequests(wasHandled);
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  if (q.isLoading) return <Skeleton className="h-40 w-full" />;
  if (q.isError) return <p className="text-sm text-destructive">No se pudieron cargar las solicitudes.</p>;
  const items = q.data?.items ?? [];
  if (items.length === 0) return <p className="text-sm text-muted-foreground">Sin solicitudes.</p>;
  return (
    <>
      <ul className="space-y-2">
        {items.map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded-md border border-border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{r.name ?? 'Sin nombre'}</p>
              <p className="truncate text-xs text-muted-foreground">
                {r.email ?? r.phone} · {formatDateTime(r.createdAt)}
              </p>
              {r.message && <p className="truncate text-xs text-muted-foreground">{r.message}</p>}
            </div>
            {wasHandled
              ? <Badge variant="secondary">Atendida</Badge>
              : <Button size="sm" onClick={() => setSelected(r)}>Atender</Button>}
          </li>
        ))}
      </ul>
      <HandleRequestDialog request={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export function RequestsInbox() {
  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
        Solicitudes de contacto
      </h1>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="handled">Atendidas</TabsTrigger>
        </TabsList>
        <TabsContent value="pending"><List wasHandled={false} /></TabsContent>
        <TabsContent value="handled"><List wasHandled={true} /></TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 4: Page (server → inbox client).**
```tsx
// app/(app)/contact-requests/page.tsx
import type { Metadata } from 'next';
import { RequestsInbox } from './requests-inbox';

export const metadata: Metadata = { title: 'Solicitudes · SIR CRM' };

export default function ContactRequestsPage() {
  return <RequestsInbox />;
}
```

- [ ] **Step 5: Test del hook handle (endpoint + invalidación).**
```tsx
// lib/api/contact-requests.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiFetch: (...a: unknown[]) => apiFetch(...a) }));
import { useHandleRequest } from './contact-requests';

describe('useHandleRequest', () => {
  beforeEach(() => apiFetch.mockReset());
  it('llama PATCH /contact-requests/:id/handle con resultingClientId', async () => {
    apiFetch.mockResolvedValue({ id: 5, wasHandled: true });
    const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useHandleRequest(), { wrapper });
    result.current.mutate({ id: 5, resultingClientId: 9 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiFetch).toHaveBeenCalledWith(
      'contact-requests/5/handle',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ resultingClientId: 9 }) }),
    );
  });
});
```

- [ ] **Step 6: Verifica + build.** Comandos: `npm run test -- lib/api/contact-requests.test.tsx` (Esperado: 1 passing) y `npm run build` (Esperado: `/contact-requests` compilada).

- [ ] **Step 7: Commit.** `git add lib/api/contact-requests.ts app/\(app\)/contact-requests lib/api/contact-requests.test.tsx && git commit -m "feat(contact-requests): inbox filtrable con acción atender"`

---

### Task 5.9: Historial de contacto (registro + lista filtrable)

**Files:**
- Create: `lib/api/contact-history.ts`
- Create: `app/(app)/contact-history/page.tsx`
- Create: `app/(app)/contact-history/contact-history-view.tsx`
- Create: `app/(app)/contact-history/log-contact-form.tsx`
- Test: `lib/api/contact-history.test.tsx`

**Interfaces:**
- Consumes: `apiFetch`, `Paginated` (Fase 3); `createContactHistorySchema` (Task 5.1); `contactDirectionLabels` (Task 5.1); `formatDateTime` (Fase 3); `useList` para selects (`client-contacts`, `contact-types`); `react-hook-form` + `zodResolver`; shadcn `dialog`, `input`, `textarea`, `select`, `label`, `button`, `skeleton`, `badge`.
- Produces: `useContactHistory(filters)`; `useLogContact()` (`POST /contact-history`, sella empleado en backend, invalida); `ContactHistoryView()`, `LogContactForm({ open, onOpenChange })`.

- [ ] **Step 1: API del historial (lista filtrable + registro).** El backend sella el empleado desde el Bearer; el form no envía `employeeId`.
```ts
// lib/api/contact-history.ts
'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch, type Paginated } from '@/lib/api/client';
import type { ContactHistory } from '@/lib/api/types/commercial';
import type { CreateContactHistoryInput } from '@/lib/schemas/commercial';

const KEY = ['contact-history'] as const;

export type ContactHistoryFilters = {
  contactId?: number; clientId?: number; contactType?: number;
  opportunityId?: number; direction?: 'inbound' | 'outbound'; from?: string; to?: string;
};

export function useContactHistory(filters: ContactHistoryFilters = {}) {
  const qs = new URLSearchParams({ limit: '50' });
  for (const [k, v] of Object.entries(filters)) if (v !== undefined && v !== '') qs.set(k, String(v));
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => apiFetch<Paginated<ContactHistory>>(`contact-history?${qs.toString()}`),
  });
}

export function useLogContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContactHistoryInput) =>
      apiFetch<ContactHistory>('contact-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      toast.success('Contacto registrado');
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error('No se pudo registrar el contacto'),
  });
}
```

- [ ] **Step 2: Formulario de registro (RHF + Zod espejando `CreateContactHistoryDto`).** `contactTime` con `datetime-local` → ISO; `direction` enum; selects de contacto y tipo de contacto.
```tsx
// app/(app)/contact-history/log-contact-form.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createContactHistorySchema, type CreateContactHistoryInput } from '@/lib/schemas/commercial';
import { useLogContact } from '@/lib/api/contact-history';
import { useList } from '@/lib/api/hooks';
import { contactDirectionLabels } from '@/lib/domain/commercial-labels';
import type { ClientContact } from '@/lib/api/types/commercial';

export function LogContactForm({
  open, onOpenChange,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
}) {
  const log = useLogContact();
  const contacts = useList<ClientContact>('client-contacts', { limit: 100 });
  const types = useList<{ id: number; name: string }>('contact-types', { limit: 100 });
  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<CreateContactHistoryInput>({ resolver: zodResolver(createContactHistorySchema) });

  const onSubmit = (values: CreateContactHistoryInput) =>
    log.mutate(values, { onSuccess: () => { reset(); onOpenChange(false); } });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar contacto</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="contactId">Contacto</Label>
            <select id="contactId" className="w-full rounded-md border border-input bg-background p-2 text-sm"
              {...register('contactId')}>
              <option value="">Selecciona…</option>
              {contacts.data?.items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.contactId && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="contactType">Tipo de contacto</Label>
            <select id="contactType" className="w-full rounded-md border border-input bg-background p-2 text-sm"
              {...register('contactType')}>
              <option value="">Selecciona…</option>
              {types.data?.items.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {errors.contactType && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="contactTime">Fecha y hora</Label>
            <Input id="contactTime" type="datetime-local"
              onChange={(e) => setValue('contactTime', e.target.value ? new Date(e.target.value).toISOString() : '')} />
            {errors.contactTime && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="direction">Dirección</Label>
            <select id="direction" className="w-full rounded-md border border-input bg-background p-2 text-sm"
              {...register('direction')}>
              <option value="">—</option>
              {Object.entries(contactDirectionLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="contactDesc">Descripción</Label>
            <Textarea id="contactDesc" {...register('contactDesc')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={log.isPending}>Registrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Vista (lista filtrable + botón registrar).**
```tsx
// app/(app)/contact-history/contact-history-view.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useContactHistory, type ContactHistoryFilters } from '@/lib/api/contact-history';
import { contactDirectionLabels } from '@/lib/domain/commercial-labels';
import { LogContactForm } from './log-contact-form';
import { formatDateTime } from '@/lib/format';

export function ContactHistoryView() {
  const [filters, setFilters] = useState<ContactHistoryFilters>({});
  const [logging, setLogging] = useState(false);
  const q = useContactHistory(filters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Historial de contacto
        </h1>
        <Button onClick={() => setLogging(true)}>Registrar contacto</Button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Input type="date" aria-label="Desde"
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))} />
        <Input type="date" aria-label="Hasta"
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))} />
      </div>
      {q.isLoading && <Skeleton className="h-40 w-full" />}
      {q.isError && <p className="text-sm text-destructive">No se pudo cargar el historial.</p>}
      {q.data && (
        <ul className="space-y-2">
          {q.data.items.length === 0 && <p className="text-sm text-muted-foreground">Sin registros.</p>}
          {q.data.items.map((h) => (
            <li key={h.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{h.contactDesc ?? 'Sin descripción'}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(h.contactTime)}</p>
              </div>
              {h.direction && <Badge variant="outline">{contactDirectionLabels[h.direction]}</Badge>}
            </li>
          ))}
        </ul>
      )}
      <LogContactForm open={logging} onOpenChange={setLogging} />
    </div>
  );
}
```

- [ ] **Step 4: Page (server → view client).**
```tsx
// app/(app)/contact-history/page.tsx
import type { Metadata } from 'next';
import { ContactHistoryView } from './contact-history-view';

export const metadata: Metadata = { title: 'Historial de contacto · SIR CRM' };

export default function ContactHistoryPage() {
  return <ContactHistoryView />;
}
```

- [ ] **Step 5: Test del hook de registro (POST sin employeeId, invalida).**
```tsx
// lib/api/contact-history.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiFetch: (...a: unknown[]) => apiFetch(...a) }));
import { useLogContact } from './contact-history';

describe('useLogContact', () => {
  beforeEach(() => apiFetch.mockReset());
  it('hace POST a contact-history sin sellar employeeId en el cliente', async () => {
    apiFetch.mockResolvedValue({ id: 1 });
    const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useLogContact(), { wrapper });
    result.current.mutate({ contactId: 2, contactType: 3, contactTime: '2026-06-27T10:00:00.000Z' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const [path, init] = apiFetch.mock.calls[0];
    expect(path).toBe('contact-history');
    expect(init.method).toBe('POST');
    expect(init.body).not.toContain('employeeId');
  });
});
```

- [ ] **Step 6: Verifica + build final de fase.** Comandos: `npm run test -- lib/api/contact-history.test.tsx` (Esperado: 1 passing); `npm run test` (Esperado: toda la suite comercial verde); `npm run build` (Esperado: rutas `/opportunities`, `/clients`, `/client-contacts`, `/contact-requests`, `/contact-history` compiladas sin errores de tipos).

- [ ] **Step 7: Commit.** `git add lib/api/contact-history.ts app/\(app\)/contact-history lib/api/contact-history.test.tsx && git commit -m "feat(contact-history): registro de contactos y lista filtrable"`


## Fase 6 — Reclutamiento

### Task 6.1: Tipos y esquema Zod del módulo de reclutamiento (candidates, applications, placements)

**Files:**
- Create: `lib/api/types/recruitment.ts`
- Create: `lib/recruitment/labels.ts`
- Create: `lib/recruitment/transitions.ts`
- Test: `lib/recruitment/__tests__/transitions.test.ts`

**Interfaces:**
- Consumes (de Fase 3): `Paginated<T>` desde `lib/api/types/common.ts`.
- Produces:
  - `interface Candidate { id:number; firstName:string; secondName?:string; lastName:string; surName?:string; nationalId?:string; phoneNumber?:string; email?:string; birthDate?:string; headline?:string; source?:string; expectedSalary?:number; status:CandidateStatus; notes?:string; createdAt:string; applications?:Application[] }`
  - `type CandidateStatus = 'new'|'active'|'placed'|'on_hold'|'discarded'`
  - `interface Application { id:number; candidateId:number; candidate?:Candidate; opportunityId:number; opportunity?:Opportunity; referredByEmployeeId?:number; stage:ApplicationStage; source?:string; notes?:string; appliedAt:string; updatedAt:string }`
  - `type ApplicationStage = 'applied'|'screening'|'interview'|'offer'|'hired'|'rejected'|'withdrawn'`
  - `interface Placement { id:number; applicationId:number; application?:Application; candidateId:number; candidate?:Candidate; opportunityId:number; opportunity?:Opportunity; placedByEmployeeId:number; placedBy?:Employee; placementDate:string; startDate?:string; endDate?:string; endReason?:string; agreedSalary?:number; fee?:number; status:PlacementStatus; createdAt:string }`
  - `type PlacementStatus = 'active'|'ended'|'cancelled'`
  - `APPLICATION_TRANSITIONS: Record<ApplicationStage, ApplicationStage[]>` y `nextStages(stage): ApplicationStage[]`, `canTransition(from,to): boolean`.

- [ ] **Step 1: Crear los tipos espejo de los DTOs/entities del backend** (mirroran exactamente `candidate.entity.ts`, `application.entity.ts`, `placement.entity.ts` de `sir-api`). `Opportunity` y `Employee` se importan de los tipos ya definidos en fases previas (`lib/api/types/opportunity.ts`, `lib/api/types/employee.ts`).

```ts
// lib/api/types/recruitment.ts
import type { Opportunity } from './opportunity'
import type { Employee } from './employee'

export const CANDIDATE_STATUSES = ['new', 'active', 'placed', 'on_hold', 'discarded'] as const
export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number]

export const APPLICATION_STAGES = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'] as const
export type ApplicationStage = (typeof APPLICATION_STAGES)[number]

export const PLACEMENT_STATUSES = ['active', 'ended', 'cancelled'] as const
export type PlacementStatus = (typeof PLACEMENT_STATUSES)[number]

export interface Candidate {
  id: number
  firstName: string
  secondName?: string
  lastName: string
  surName?: string
  nationalId?: string
  phoneNumber?: string
  email?: string
  birthDate?: string
  headline?: string
  source?: string
  expectedSalary?: number
  status: CandidateStatus
  notes?: string
  createdAt: string
  applications?: Application[]
}

export interface Application {
  id: number
  candidateId: number
  candidate?: Candidate
  opportunityId: number
  opportunity?: Opportunity
  referredByEmployeeId?: number
  referredBy?: Employee
  stage: ApplicationStage
  source?: string
  notes?: string
  appliedAt: string
  updatedAt: string
}

export interface Placement {
  id: number
  applicationId: number
  application?: Application
  candidateId: number
  candidate?: Candidate
  opportunityId: number
  opportunity?: Opportunity
  placedByEmployeeId: number
  placedBy?: Employee
  placementDate: string
  startDate?: string
  endDate?: string
  endReason?: string
  agreedSalary?: number
  fee?: number
  status: PlacementStatus
  createdAt: string
}
```

- [ ] **Step 2: Crear los mapas de etiquetas en español** (UI en español; cero strings sueltos en componentes).

```ts
// lib/recruitment/labels.ts
import type { CandidateStatus, ApplicationStage, PlacementStatus } from '../api/types/recruitment'

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  new: 'Nuevo', active: 'Activo', placed: 'Colocado', on_hold: 'En espera', discarded: 'Descartado',
}

export const APPLICATION_STAGE_LABELS: Record<ApplicationStage, string> = {
  applied: 'Aplicó', screening: 'Filtro', interview: 'Entrevista', offer: 'Oferta',
  hired: 'Contratado', rejected: 'Rechazado', withdrawn: 'Retirado',
}

// Variante de Badge por etapa (tokens de marca, nunca hex)
export const APPLICATION_STAGE_BADGE: Record<ApplicationStage, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  applied: 'secondary', screening: 'secondary', interview: 'default', offer: 'default',
  hired: 'default', rejected: 'destructive', withdrawn: 'outline',
}

export const PLACEMENT_STATUS_LABELS: Record<PlacementStatus, string> = {
  active: 'Activo', ended: 'Finalizado', cancelled: 'Cancelado',
}
```

- [ ] **Step 3: TDD — escribir el test del mapa de transiciones ANTES de implementarlo** (espeja `APPLICATION_TRANSITIONS` de `applications.service.ts` del backend, incluyendo estados terminales sin salidas).

```ts
// lib/recruitment/__tests__/transitions.test.ts
import { describe, it, expect } from 'vitest'
import { APPLICATION_TRANSITIONS, nextStages, canTransition } from '../transitions'

describe('APPLICATION_TRANSITIONS', () => {
  it('refleja exactamente el backend', () => {
    expect(APPLICATION_TRANSITIONS).toEqual({
      applied: ['screening', 'rejected', 'withdrawn'],
      screening: ['interview', 'rejected', 'withdrawn'],
      interview: ['offer', 'rejected', 'withdrawn'],
      offer: ['hired', 'rejected', 'withdrawn'],
      hired: [],
      rejected: [],
      withdrawn: [],
    })
  })

  it('estados terminales no tienen transiciones', () => {
    expect(nextStages('hired')).toEqual([])
    expect(nextStages('rejected')).toEqual([])
    expect(nextStages('withdrawn')).toEqual([])
  })

  it('canTransition valida transiciones permitidas y rechaza inválidas', () => {
    expect(canTransition('applied', 'screening')).toBe(true)
    expect(canTransition('applied', 'interview')).toBe(false)
    expect(canTransition('offer', 'hired')).toBe(true)
    expect(canTransition('screening', 'applied')).toBe(false)
    expect(canTransition('hired', 'rejected')).toBe(false)
  })
})
```

- [ ] **Step 4: Implementar `transitions.ts`** para que el test pase.

```ts
// lib/recruitment/transitions.ts
import type { ApplicationStage } from '../api/types/recruitment'

export const APPLICATION_TRANSITIONS: Record<ApplicationStage, ApplicationStage[]> = {
  applied: ['screening', 'rejected', 'withdrawn'],
  screening: ['interview', 'rejected', 'withdrawn'],
  interview: ['offer', 'rejected', 'withdrawn'],
  offer: ['hired', 'rejected', 'withdrawn'],
  hired: [],
  rejected: [],
  withdrawn: [],
}

export function nextStages(stage: ApplicationStage): ApplicationStage[] {
  return APPLICATION_TRANSITIONS[stage]
}

export function canTransition(from: ApplicationStage, to: ApplicationStage): boolean {
  return APPLICATION_TRANSITIONS[from].includes(to)
}
```

- [ ] **Step 5: Ejecutar el test**
  - Comando: `npm run test -- lib/recruitment/__tests__/transitions.test.ts`
  - Esperado: `3 passed` (suite `APPLICATION_TRANSITIONS` en verde).

- [ ] **Step 6: Commit**
  - `git add lib/api/types/recruitment.ts lib/recruitment/labels.ts lib/recruitment/transitions.ts lib/recruitment/__tests__/transitions.test.ts`
  - `git commit -m "feat(recruitment): tipos, etiquetas es-GT y mapa de transiciones de aplicaciones (TDD)"`

---

### Task 6.2: Recurso Candidatos (createResource: CRUD + búsqueda + detail con applications)

**Files:**
- Create: `lib/recruitment/candidate-schema.ts`
- Create: `lib/resources/candidates.tsx`
- Create: `components/recruitment/candidate-detail.tsx`
- Create: `app/(app)/candidates/page.tsx`
- Test: `lib/recruitment/__tests__/candidate-schema.test.ts`

**Interfaces:**
- Consumes (de Fase 3):
  - `createResource<T>(config: ResourceConfig<T>): { Table: FC, useResource: ... }` desde `lib/resources/create-resource.tsx`.
  - `ResourceConfig<T> = { key:string; label:string; endpoint:string; columns:ColumnDef<T>[]; formSchema:ZodType; formFields:FormField[]; access:'admin'|'auth'; searchParam?:string; renderDetail?:(row:T)=>ReactNode }`.
  - Hooks factory `createResourceHooks<T>(endpoint)` → `{ useList, useOne, useCreate, useUpdate, useRemove }`.
  - `formatGTQ(n)`, `formatDate(s)` desde `lib/format`.
- Produces:
  - `candidateFormSchema: ZodType` (espejo de `CreateCandidateDto`).
  - `export const candidatesResource` (config + componente de tabla) y `export const candidateHooks`.

- [ ] **Step 1: Definir el esquema Zod espejando `CreateCandidateDto`** (`firstName`, `lastName` requeridos; resto opcional; `email` validado; `expectedSalary` ≥ 0; `status` enum; campos opcionales aceptan `''` → `undefined`).

```ts
// lib/recruitment/candidate-schema.ts
import { z } from 'zod'
import { CANDIDATE_STATUSES } from '../api/types/recruitment'

const optionalString = z.string().trim().optional().or(z.literal('').transform(() => undefined))

export const candidateFormSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
  secondName: optionalString,
  lastName: z.string().trim().min(1, 'El apellido es obligatorio'),
  surName: optionalString,
  nationalId: optionalString,
  phoneNumber: optionalString,
  email: z.string().trim().email('Correo inválido').optional().or(z.literal('').transform(() => undefined)),
  birthDate: optionalString,
  headline: optionalString,
  source: optionalString,
  expectedSalary: z.coerce.number().min(0, 'Debe ser ≥ 0').optional(),
  status: z.enum(CANDIDATE_STATUSES).default('new'),
  notes: optionalString,
})

export type CandidateFormValues = z.infer<typeof candidateFormSchema>
```

- [ ] **Step 2: Test representativo del esquema** (requeridos, email inválido, salario negativo, coerción de status default).

```ts
// lib/recruitment/__tests__/candidate-schema.test.ts
import { describe, it, expect } from 'vitest'
import { candidateFormSchema } from '../candidate-schema'

describe('candidateFormSchema', () => {
  it('acepta el mínimo válido y aplica status default', () => {
    const r = candidateFormSchema.parse({ firstName: 'Ana', lastName: 'López' })
    expect(r.status).toBe('new')
  })
  it('exige nombre y apellido', () => {
    expect(candidateFormSchema.safeParse({ firstName: '', lastName: '' }).success).toBe(false)
  })
  it('rechaza email inválido y salario negativo', () => {
    expect(candidateFormSchema.safeParse({ firstName: 'A', lastName: 'B', email: 'x' }).success).toBe(false)
    expect(candidateFormSchema.safeParse({ firstName: 'A', lastName: 'B', expectedSalary: -1 }).success).toBe(false)
  })
})
```

- [ ] **Step 3: Componente de detalle del candidato** (usa `useOne` → `GET /candidates/:id` que incluye `applications`; muestra datos + tabla compacta de aplicaciones con `Badge` por etapa y enlace a la app). Marcado `'use client'`.
  - **Step 3a: Lee `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` y `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` y aplica el boundary `'use client'` vigente** (este componente usa hooks de TanStack Query, por lo que es Client Component).

```tsx
// components/recruitment/candidate-detail.tsx
'use client'

import Link from 'next/link'
import { candidateHooks } from '@/lib/resources/candidates'
import { CANDIDATE_STATUS_LABELS, APPLICATION_STAGE_LABELS, APPLICATION_STAGE_BADGE } from '@/lib/recruitment/labels'
import { formatGTQ, formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function CandidateDetail({ id }: { id: number }) {
  const { data: c, isLoading, isError, error } = candidateHooks.useOne(id)

  if (isLoading) return <Skeleton className="h-48 w-full" />
  if (isError) return <p className="text-destructive">{(error as Error).message}</p>
  if (!c) return null

  const fullName = [c.firstName, c.secondName, c.lastName, c.surName].filter(Boolean).join(' ')

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="font-display text-xl text-foreground">{fullName}</h2>
        {c.headline ? <p className="text-sm text-muted-foreground">{c.headline}</p> : null}
        <Badge variant="secondary">{CANDIDATE_STATUS_LABELS[c.status]}</Badge>
      </header>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-muted-foreground">Correo</dt><dd>{c.email ?? '—'}</dd></div>
        <div><dt className="text-muted-foreground">Teléfono</dt><dd>{c.phoneNumber ?? '—'}</dd></div>
        <div><dt className="text-muted-foreground">Salario esperado</dt><dd>{c.expectedSalary != null ? formatGTQ(c.expectedSalary) : '—'}</dd></div>
        <div><dt className="text-muted-foreground">Origen</dt><dd>{c.source ?? '—'}</dd></div>
      </dl>

      <section className="space-y-2">
        <h3 className="font-display text-sm text-foreground">Aplicaciones</h3>
        {c.applications && c.applications.length > 0 ? (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {c.applications.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <Link href={`/applications?candidateId=${c.id}`} className="text-accent hover:underline">
                  Oportunidad #{a.opportunityId}
                </Link>
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">{formatDate(a.appliedAt)}</span>
                  <Badge variant={APPLICATION_STAGE_BADGE[a.stage]}>{APPLICATION_STAGE_LABELS[a.stage]}</Badge>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Sin aplicaciones registradas.</p>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Declarar el recurso con `createResource`** (búsqueda por `name` via `searchParam`; columnas; `formFields`; `renderDetail` usa `CandidateDetail`). Reutiliza el patrón config-driven de Fase 3 — solo se declara lo específico de candidatos.

```tsx
// lib/resources/candidates.tsx
import { createResource, createResourceHooks } from './create-resource'
import type { Candidate } from '@/lib/api/types/recruitment'
import { candidateFormSchema } from '@/lib/recruitment/candidate-schema'
import { CANDIDATE_STATUSES } from '@/lib/api/types/recruitment'
import { CANDIDATE_STATUS_LABELS } from '@/lib/recruitment/labels'
import { CandidateDetail } from '@/components/recruitment/candidate-detail'
import { formatGTQ } from '@/lib/format'

export const candidateHooks = createResourceHooks<Candidate>('candidates')

export const candidatesResource = createResource<Candidate>({
  key: 'candidates',
  label: 'Candidatos',
  endpoint: 'candidates',
  access: 'auth',
  searchParam: 'name',
  hooks: candidateHooks,
  formSchema: candidateFormSchema,
  columns: [
    { accessorKey: 'firstName', header: 'Nombre', cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
    { accessorKey: 'email', header: 'Correo' },
    { accessorKey: 'phoneNumber', header: 'Teléfono' },
    { accessorKey: 'expectedSalary', header: 'Salario esp.', cell: ({ row }) => row.original.expectedSalary != null ? formatGTQ(row.original.expectedSalary) : '—' },
    { accessorKey: 'status', header: 'Estado', cell: ({ row }) => CANDIDATE_STATUS_LABELS[row.original.status] },
  ],
  formFields: [
    { name: 'firstName', label: 'Nombre', type: 'text' },
    { name: 'secondName', label: 'Segundo nombre', type: 'text' },
    { name: 'lastName', label: 'Apellido', type: 'text' },
    { name: 'surName', label: 'Segundo apellido', type: 'text' },
    { name: 'nationalId', label: 'DPI / Identificación', type: 'text' },
    { name: 'phoneNumber', label: 'Teléfono', type: 'text' },
    { name: 'email', label: 'Correo', type: 'email' },
    { name: 'birthDate', label: 'Fecha de nacimiento', type: 'date' },
    { name: 'headline', label: 'Titular profesional', type: 'text' },
    { name: 'source', label: 'Origen', type: 'text' },
    { name: 'expectedSalary', label: 'Salario esperado (GTQ)', type: 'number' },
    { name: 'status', label: 'Estado', type: 'select', options: CANDIDATE_STATUSES.map((s) => ({ value: s, label: CANDIDATE_STATUS_LABELS[s] })) },
    { name: 'notes', label: 'Notas', type: 'textarea' },
  ],
  renderDetail: (row) => <CandidateDetail id={row.id} />,
})
```

- [ ] **Step 5: Página `/candidates`.**
  - **Step 5a: Lee `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` y usa la API vigente** (la página renderiza el componente de tabla cliente del recurso; no usa `params`/`searchParams`, así que es un Server Component simple que monta el cliente).

```tsx
// app/(app)/candidates/page.tsx
import { candidatesResource } from '@/lib/resources/candidates'

export const metadata = { title: 'Candidatos · SIR CRM' }

export default function CandidatesPage() {
  const { Table } = candidatesResource
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-foreground">Candidatos</h1>
      <Table />
    </div>
  )
}
```

- [ ] **Step 6: Verificar build/test**
  - Comando: `npm run test -- lib/recruitment/__tests__/candidate-schema.test.ts && npm run build`
  - Esperado: tests `3 passed`; build de Next sin errores de tipos (typecheck verde).

- [ ] **Step 7: Commit**
  - `git add lib/recruitment/candidate-schema.ts lib/recruitment/__tests__/candidate-schema.test.ts lib/resources/candidates.tsx components/recruitment/candidate-detail.tsx app/\(app\)/candidates/page.tsx`
  - `git commit -m "feat(candidates): recurso CRUD config-driven con búsqueda y detail de aplicaciones"`

---

### Task 6.3: Hooks de aplicaciones (lista filtrable, crear con Conflict, cambio de etapa)

**Files:**
- Create: `lib/api/recruitment/applications-hooks.ts`
- Create: `lib/recruitment/application-schema.ts`
- Test: `lib/api/recruitment/__tests__/applications-hooks.test.tsx`

**Interfaces:**
- Consumes (de Fase 3): `apiClient<T>(path, init?): Promise<T>` desde `lib/api/client.ts` (llama a `/api/proxy/<path>`, desenvuelve `{ok,message,data}`, lanza `Error(message)`); `QueryClient` provider de la app.
- Produces:
  - `useApplications(filters: ApplicationFilters)` → `UseQueryResult<Paginated<Application>>`.
  - `useApplication(id)` → `UseQueryResult<Application>` (`GET /applications/:id`).
  - `useCreateApplication()` → `UseMutationResult<Application, Error, CreateApplicationInput>` (`POST /applications`; en `409` muestra toast de conflicto).
  - `useChangeApplicationStage()` → `UseMutationResult<Application, Error, { id:number; stage:ApplicationStage }>` (`PATCH /applications/:id/stage`).
  - `applicationFormSchema`, `type CreateApplicationInput`, `type ApplicationFilters = { opportunityId?:number; candidateId?:number; stage?:ApplicationStage; page?:number; limit?:number }`.

- [ ] **Step 1: Esquema Zod de creación de aplicación** (espejo de `CreateApplicationDto`: `candidateId`, `opportunityId` requeridos enteros; `referredByEmployeeId`, `stage`, `source`, `notes` opcionales).

```ts
// lib/recruitment/application-schema.ts
import { z } from 'zod'
import { APPLICATION_STAGES } from '../api/types/recruitment'

export const applicationFormSchema = z.object({
  candidateId: z.coerce.number().int().positive('Selecciona un candidato'),
  opportunityId: z.coerce.number().int().positive('Selecciona una oportunidad'),
  referredByEmployeeId: z.coerce.number().int().positive().optional(),
  stage: z.enum(APPLICATION_STAGES).optional(),
  source: z.string().trim().optional().or(z.literal('').transform(() => undefined)),
  notes: z.string().trim().optional().or(z.literal('').transform(() => undefined)),
})

export type CreateApplicationInput = z.infer<typeof applicationFormSchema>
```

- [ ] **Step 2: Implementar los hooks** (clave de query `['applications', filters]`; invalidación tras mutaciones; el `apiClient` ya lanza `Error(message)` con el mensaje del backend — el `409` de aplicación duplicada se captura en `onError` y se enruta a `sonner`).

```ts
// lib/api/recruitment/applications-hooks.ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '../client'
import type { Application, ApplicationStage } from '../types/recruitment'
import type { Paginated } from '../types/common'
import type { CreateApplicationInput } from '@/lib/recruitment/application-schema'

export interface ApplicationFilters {
  opportunityId?: number
  candidateId?: number
  stage?: ApplicationStage
  page?: number
  limit?: number
}

function toQuery(filters: ApplicationFilters): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) if (v != null && v !== '') sp.set(k, String(v))
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export function useApplications(filters: ApplicationFilters) {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => apiClient<Paginated<Application>>(`applications${toQuery(filters)}`),
  })
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: ['applications', 'one', id],
    queryFn: () => apiClient<Application>(`applications/${id}`),
    enabled: Number.isFinite(id),
  })
}

export function useCreateApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateApplicationInput) =>
      apiClient<Application>('applications', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Aplicación creada')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useChangeApplicationStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: ApplicationStage }) =>
      apiClient<Application>(`applications/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Etapa actualizada')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
```

- [ ] **Step 3: Test de hooks** (con `QueryClientProvider` + `apiClient` mockeado; verifica que `useCreateApplication` propaga el `Error(message)` del backend en `409` y que `useChangeApplicationStage` hace `PATCH` a la ruta correcta).

```tsx
// lib/api/recruitment/__tests__/applications-hooks.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

vi.mock('../client', () => ({ apiClient: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { apiClient } from '../client'
import { useCreateApplication, useChangeApplicationStage } from '../applications-hooks'

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('applications hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('propaga el mensaje de conflicto del backend', async () => {
    vi.mocked(apiClient).mockRejectedValueOnce(new Error('Application for candidate 1 and opportunity 2 already exists'))
    const { result } = renderHook(() => useCreateApplication(), { wrapper })
    result.current.mutate({ candidateId: 1, opportunityId: 2 })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toMatch(/already exists/)
  })

  it('PATCH a /applications/:id/stage', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({ id: 5, stage: 'screening' } as never)
    const { result } = renderHook(() => useChangeApplicationStage(), { wrapper })
    result.current.mutate({ id: 5, stage: 'screening' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiClient)).toHaveBeenCalledWith('applications/5/stage', { method: 'PATCH', body: JSON.stringify({ stage: 'screening' }) })
  })
})
```

- [ ] **Step 4: Ejecutar tests**
  - Comando: `npm run test -- lib/api/recruitment/__tests__/applications-hooks.test.tsx`
  - Esperado: `2 passed`.

- [ ] **Step 5: Commit**
  - `git add lib/recruitment/application-schema.ts lib/api/recruitment/applications-hooks.ts lib/api/recruitment/__tests__/applications-hooks.test.tsx`
  - `git commit -m "feat(applications): hooks de lista/creación/cambio de etapa con manejo de Conflict"`

---

### Task 6.4: Vista de aplicaciones — máquina de etapas + crear + filtros

**Files:**
- Create: `components/recruitment/application-stage-control.tsx`
- Create: `components/recruitment/create-application-dialog.tsx`
- Create: `components/recruitment/applications-board.tsx`
- Create: `app/(app)/applications/page.tsx`
- Test: `components/recruitment/__tests__/application-stage-control.test.tsx`

**Interfaces:**
- Consumes: `useApplications`, `useChangeApplicationStage`, `useCreateApplication` (Task 6.3); `nextStages`, `canTransition`, `APPLICATION_STAGES` (Task 6.1); `candidateHooks.useList` y `opportunityHooks.useList` (combos); componentes shadcn `Select`, `DropdownMenu`, `Dialog`, `Badge`, `Card`, `Skeleton`; `Form` (RHF) y `zodResolver`.
- Produces: `ApplicationStageControl`, `CreateApplicationDialog`, `ApplicationsBoard`.

- [ ] **Step 1: Control de cambio de etapa (deshabilita transiciones inválidas según el mapa).** Solo ofrece las etapas devueltas por `nextStages(current)`; si el estado es terminal, muestra solo el badge sin acciones. Usa `useChangeApplicationStage`.

```tsx
// components/recruitment/application-stage-control.tsx
'use client'

import { nextStages } from '@/lib/recruitment/transitions'
import { APPLICATION_STAGE_LABELS, APPLICATION_STAGE_BADGE } from '@/lib/recruitment/labels'
import type { ApplicationStage } from '@/lib/api/types/recruitment'
import { useChangeApplicationStage } from '@/lib/api/recruitment/applications-hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function ApplicationStageControl({ id, stage }: { id: number; stage: ApplicationStage }) {
  const options = nextStages(stage)
  const mutation = useChangeApplicationStage()

  return (
    <div className="flex items-center gap-2">
      <Badge variant={APPLICATION_STAGE_BADGE[stage]}>{APPLICATION_STAGE_LABELS[stage]}</Badge>
      {options.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" disabled={mutation.isPending}>Mover etapa</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {options.map((next) => (
              <DropdownMenuItem key={next} onClick={() => mutation.mutate({ id, stage: next })}>
                {APPLICATION_STAGE_LABELS[next]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: Test representativo del control** (estado terminal `hired` no ofrece acción; `applied` ofrece exactamente `screening/rejected/withdrawn`).

```tsx
// components/recruitment/__tests__/application-stage-control.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ApplicationStageControl } from '../application-stage-control'

vi.mock('@/lib/api/recruitment/applications-hooks', () => ({
  useChangeApplicationStage: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe('ApplicationStageControl', () => {
  it('estado terminal no muestra botón de mover', () => {
    render(<ApplicationStageControl id={1} stage="hired" />)
    expect(screen.queryByText('Mover etapa')).toBeNull()
    expect(screen.getByText('Contratado')).toBeInTheDocument()
  })
  it('estado no terminal muestra el botón de mover', () => {
    render(<ApplicationStageControl id={1} stage="applied" />)
    expect(screen.getByText('Mover etapa')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Diálogo de crear aplicación** (RHF + `applicationFormSchema`; combos de candidato/oportunidad alimentados por sus `useList`; el `Conflict` ya se muestra como toast desde el hook, así que solo cerramos el diálogo en `onSuccess`). Reutiliza el patrón de `ResourceForm` de Fase 3 envuelto en `Dialog`.

```tsx
// components/recruitment/create-application-dialog.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { applicationFormSchema, type CreateApplicationInput } from '@/lib/recruitment/application-schema'
import { useCreateApplication } from '@/lib/api/recruitment/applications-hooks'
import { candidateHooks } from '@/lib/resources/candidates'
import { opportunityHooks } from '@/lib/resources/opportunities'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function CreateApplicationDialog() {
  const [open, setOpen] = useState(false)
  const form = useForm<CreateApplicationInput>({ resolver: zodResolver(applicationFormSchema) })
  const create = useCreateApplication()
  const candidates = candidateHooks.useList({ limit: 100 })
  const opportunities = opportunityHooks.useList({ limit: 100 })

  function onSubmit(values: CreateApplicationInput) {
    create.mutate(values, { onSuccess: () => { setOpen(false); form.reset() } })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Nueva aplicación</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva aplicación</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="candidateId" render={({ field }) => (
              <FormItem>
                <FormLabel>Candidato</FormLabel>
                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : undefined}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {candidates.data?.items.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="opportunityId" render={({ field }) => (
              <FormItem>
                <FormLabel>Oportunidad</FormLabel>
                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : undefined}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {opportunities.data?.items.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>{o.title ?? `Oportunidad #${o.id}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notas</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={create.isPending} className="w-full">Crear</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Tablero de aplicaciones por columnas de etapa** (lee `useApplications(filters)`; agrupa por `stage` en las 7 columnas; cada tarjeta muestra candidato/oportunidad + `ApplicationStageControl`). Skeleton/empty/error.

```tsx
// components/recruitment/applications-board.tsx
'use client'

import { APPLICATION_STAGES } from '@/lib/api/types/recruitment'
import { APPLICATION_STAGE_LABELS } from '@/lib/recruitment/labels'
import { useApplications, type ApplicationFilters } from '@/lib/api/recruitment/applications-hooks'
import { ApplicationStageControl } from './application-stage-control'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ApplicationsBoard({ filters }: { filters: ApplicationFilters }) {
  const { data, isLoading, isError, error } = useApplications({ ...filters, limit: 200 })

  if (isLoading) return <div className="grid grid-cols-7 gap-3">{APPLICATION_STAGES.map((s) => <Skeleton key={s} className="h-64" />)}</div>
  if (isError) return <p className="text-destructive">{(error as Error).message}</p>

  const items = data?.items ?? []
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      {APPLICATION_STAGES.map((stage) => {
        const cards = items.filter((a) => a.stage === stage)
        return (
          <section key={stage} className="rounded-lg border border-border bg-secondary/40 p-2">
            <header className="mb-2 flex items-center justify-between px-1">
              <h3 className="font-display text-sm text-foreground">{APPLICATION_STAGE_LABELS[stage]}</h3>
              <span className="text-xs text-muted-foreground">{cards.length}</span>
            </header>
            <div className="space-y-2">
              {cards.length === 0 ? <p className="px-1 text-xs text-muted-foreground">Vacío</p> : null}
              {cards.map((a) => (
                <Card key={a.id} className="space-y-2 p-3">
                  <p className="text-sm font-medium text-foreground">{a.candidate ? `${a.candidate.firstName} ${a.candidate.lastName}` : `Candidato #${a.candidateId}`}</p>
                  <p className="text-xs text-muted-foreground">{a.opportunity?.title ?? `Oportunidad #${a.opportunityId}`}</p>
                  <ApplicationStageControl id={a.id} stage={a.stage} />
                </Card>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 5: Página `/applications` con filtros vía `searchParams`.**
  - **Step 5a: Lee `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` (sección "Rendering with search params") y usa la API vigente: `searchParams` es `Promise` en Next 16 y debe ser `await`-eado en el Server Component.**

```tsx
// app/(app)/applications/page.tsx
import { ApplicationsBoard } from '@/components/recruitment/applications-board'
import { CreateApplicationDialog } from '@/components/recruitment/create-application-dialog'
import type { ApplicationStage } from '@/lib/api/types/recruitment'

export const metadata = { title: 'Aplicaciones · SIR CRM' }

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ opportunityId?: string; candidateId?: string; stage?: string }>
}) {
  const sp = await searchParams
  const filters = {
    opportunityId: sp.opportunityId ? Number(sp.opportunityId) : undefined,
    candidateId: sp.candidateId ? Number(sp.candidateId) : undefined,
    stage: sp.stage as ApplicationStage | undefined,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Aplicaciones</h1>
        <CreateApplicationDialog />
      </div>
      <ApplicationsBoard filters={filters} />
    </div>
  )
}
```

- [ ] **Step 6: Verificar tests + build**
  - Comando: `npm run test -- components/recruitment/__tests__/application-stage-control.test.tsx && npm run build`
  - Esperado: tests `2 passed`; build sin errores.

- [ ] **Step 7: Commit**
  - `git add components/recruitment/application-stage-control.tsx components/recruitment/create-application-dialog.tsx components/recruitment/applications-board.tsx components/recruitment/__tests__/application-stage-control.test.tsx app/\(app\)/applications/page.tsx`
  - `git commit -m "feat(applications): tablero de etapas, creación con combos y filtros por searchParams"`

---

### Task 6.5: Placements — crear desde aplicación, lista filtrable y detail

**Files:**
- Create: `lib/recruitment/placement-schema.ts`
- Create: `lib/api/recruitment/placements-hooks.ts`
- Create: `components/recruitment/create-placement-dialog.tsx`
- Create: `components/recruitment/placements-table.tsx`
- Create: `components/recruitment/placement-detail.tsx`
- Create: `app/(app)/placements/page.tsx`
- Test: `lib/recruitment/__tests__/placement-schema.test.ts`

**Interfaces:**
- Consumes: `apiClient`, `Paginated<T>`, `Placement` type; `formatGTQ`, `formatDate`; shadcn `Dialog/Form/Input/Select/Table/Drawer/Badge/Skeleton`; `ApplicationStageControl` no aplica aquí.
- Produces:
  - `placementFormSchema` (espejo de `CreatePlacementDto`; `applicationId`+`placementDate` requeridos; `startDate/endDate/endReason/agreedSalary/fee/status` opcionales).
  - `usePlacements(filters)`, `usePlacement(id)`, `useCreatePlacement()` (`POST /placements` — el backend sella `placedByEmployeeId` del usuario y marca la oportunidad `won` por headcount; no se envía recruiter desde el cliente).
  - `CreatePlacementDialog`, `PlacementsTable`, `PlacementDetail`.

- [ ] **Step 1: Esquema Zod de placement** (espejo de `CreatePlacementDto`; fechas en `YYYY-MM-DD`).

```ts
// lib/recruitment/placement-schema.ts
import { z } from 'zod'
import { PLACEMENT_STATUSES } from '../api/types/recruitment'

const optionalDate = z.string().trim().optional().or(z.literal('').transform(() => undefined))

export const placementFormSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
  placementDate: z.string().trim().min(1, 'La fecha de colocación es obligatoria'),
  startDate: optionalDate,
  endDate: optionalDate,
  endReason: z.string().trim().optional().or(z.literal('').transform(() => undefined)),
  agreedSalary: z.coerce.number().min(0, 'Debe ser ≥ 0').optional(),
  fee: z.coerce.number().min(0, 'Debe ser ≥ 0').optional(),
  status: z.enum(PLACEMENT_STATUSES).optional(),
})

export type CreatePlacementInput = z.infer<typeof placementFormSchema>
export interface PlacementFilters {
  clientId?: number
  recruiterId?: number
  status?: (typeof PLACEMENT_STATUSES)[number]
  from?: string
  to?: string
  page?: number
  limit?: number
}
```

- [ ] **Step 2: Test del esquema** (requeridos + `fee` negativo rechazado).

```ts
// lib/recruitment/__tests__/placement-schema.test.ts
import { describe, it, expect } from 'vitest'
import { placementFormSchema } from '../placement-schema'

describe('placementFormSchema', () => {
  it('acepta mínimo válido', () => {
    expect(placementFormSchema.safeParse({ applicationId: 3, placementDate: '2026-06-27' }).success).toBe(true)
  })
  it('exige applicationId y placementDate', () => {
    expect(placementFormSchema.safeParse({ placementDate: '' }).success).toBe(false)
  })
  it('rechaza fee negativo', () => {
    expect(placementFormSchema.safeParse({ applicationId: 3, placementDate: '2026-06-27', fee: -5 }).success).toBe(false)
  })
})
```

- [ ] **Step 3: Hooks de placements** (mismo patrón que applications; `useCreatePlacement` invalida `['placements']` y `['opportunities']` porque el placement puede cerrar la oportunidad).

```ts
// lib/api/recruitment/placements-hooks.ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '../client'
import type { Placement } from '../types/recruitment'
import type { Paginated } from '../types/common'
import type { CreatePlacementInput, PlacementFilters } from '@/lib/recruitment/placement-schema'

function toQuery(filters: PlacementFilters): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) if (v != null && v !== '') sp.set(k, String(v))
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export function usePlacements(filters: PlacementFilters) {
  return useQuery({
    queryKey: ['placements', filters],
    queryFn: () => apiClient<Paginated<Placement>>(`placements${toQuery(filters)}`),
  })
}

export function usePlacement(id: number) {
  return useQuery({
    queryKey: ['placements', 'one', id],
    queryFn: () => apiClient<Placement>(`placements/${id}`),
    enabled: Number.isFinite(id),
  })
}

export function useCreatePlacement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePlacementInput) =>
      apiClient<Placement>('placements', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['placements'] })
      qc.invalidateQueries({ queryKey: ['opportunities'] })
      toast.success('Placement creado — venta cerrada según headcount')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
```

- [ ] **Step 4: Diálogo de crear placement** (recibe `applicationId` ya fijo desde una aplicación `hired`; el usuario completa fechas y `fee`; `placedByEmployeeId` lo sella el backend). Reutiliza el patrón del diálogo de aplicación.

```tsx
// components/recruitment/create-placement-dialog.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { placementFormSchema, type CreatePlacementInput } from '@/lib/recruitment/placement-schema'
import { useCreatePlacement } from '@/lib/api/recruitment/placements-hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function CreatePlacementDialog({ applicationId }: { applicationId: number }) {
  const [open, setOpen] = useState(false)
  const form = useForm<CreatePlacementInput>({
    resolver: zodResolver(placementFormSchema),
    defaultValues: { applicationId },
  })
  const create = useCreatePlacement()

  function onSubmit(values: CreatePlacementInput) {
    create.mutate(values, { onSuccess: () => { setOpen(false); form.reset({ applicationId }) } })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Crear placement</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Cerrar colocación</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="placementDate" render={({ field }) => (
              <FormItem><FormLabel>Fecha de colocación</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem><FormLabel>Fecha de inicio</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="agreedSalary" render={({ field }) => (
              <FormItem><FormLabel>Salario acordado (GTQ)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fee" render={({ field }) => (
              <FormItem><FormLabel>Fee (GTQ)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={create.isPending} className="w-full">Crear placement</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 5: Tabla de placements filtrable + detail en drawer** (filtros `status`, `from`, `to`; columnas candidato/oportunidad/fechas/fee/estado; al hacer clic abre `PlacementDetail`).

```tsx
// components/recruitment/placements-table.tsx
'use client'

import { useState } from 'react'
import { usePlacements } from '@/lib/api/recruitment/placements-hooks'
import { PLACEMENT_STATUSES, type Placement } from '@/lib/api/types/recruitment'
import { PLACEMENT_STATUS_LABELS } from '@/lib/recruitment/labels'
import { formatGTQ, formatDate } from '@/lib/format'
import { PlacementDetail } from './placement-detail'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Drawer, DrawerContent } from '@/components/ui/drawer'

export function PlacementsTable() {
  const [status, setStatus] = useState<string | undefined>()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selected, setSelected] = useState<Placement | null>(null)
  const { data, isLoading, isError, error } = usePlacements({
    status: status as Placement['status'] | undefined,
    from: from || undefined,
    to: to || undefined,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select onValueChange={(v) => setStatus(v === 'all' ? undefined : v)} value={status ?? 'all'}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {PLACEMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{PLACEMENT_STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-44" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-44" />
      </div>

      {isLoading ? <Skeleton className="h-64 w-full" /> : isError ? (
        <p className="text-destructive">{(error as Error).message}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidato</TableHead><TableHead>Oportunidad</TableHead>
              <TableHead>Colocación</TableHead><TableHead>Fee</TableHead><TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.items ?? []).map((p) => (
              <TableRow key={p.id} onClick={() => setSelected(p)} className="cursor-pointer">
                <TableCell>{p.candidate ? `${p.candidate.firstName} ${p.candidate.lastName}` : `#${p.candidateId}`}</TableCell>
                <TableCell>{p.opportunity?.title ?? `#${p.opportunityId}`}</TableCell>
                <TableCell>{formatDate(p.placementDate)}</TableCell>
                <TableCell>{p.fee != null ? formatGTQ(p.fee) : '—'}</TableCell>
                <TableCell><Badge variant="secondary">{PLACEMENT_STATUS_LABELS[p.status]}</Badge></TableCell>
              </TableRow>
            ))}
            {(data?.items.length ?? 0) === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sin placements</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      )}

      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent>{selected ? <PlacementDetail id={selected.id} /> : null}</DrawerContent>
      </Drawer>
    </div>
  )
}
```

```tsx
// components/recruitment/placement-detail.tsx
'use client'

import { usePlacement } from '@/lib/api/recruitment/placements-hooks'
import { PLACEMENT_STATUS_LABELS } from '@/lib/recruitment/labels'
import { formatGTQ, formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function PlacementDetail({ id }: { id: number }) {
  const { data: p, isLoading, isError, error } = usePlacement(id)
  if (isLoading) return <Skeleton className="m-4 h-48" />
  if (isError) return <p className="m-4 text-destructive">{(error as Error).message}</p>
  if (!p) return null

  return (
    <div className="space-y-4 p-6">
      <header className="space-y-1">
        <h2 className="font-display text-xl text-foreground">Placement #{p.id}</h2>
        <Badge variant="secondary">{PLACEMENT_STATUS_LABELS[p.status]}</Badge>
      </header>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-muted-foreground">Candidato</dt><dd>{p.candidate ? `${p.candidate.firstName} ${p.candidate.lastName}` : `#${p.candidateId}`}</dd></div>
        <div><dt className="text-muted-foreground">Oportunidad</dt><dd>{p.opportunity?.title ?? `#${p.opportunityId}`}</dd></div>
        <div><dt className="text-muted-foreground">Colocación</dt><dd>{formatDate(p.placementDate)}</dd></div>
        <div><dt className="text-muted-foreground">Inicio</dt><dd>{p.startDate ? formatDate(p.startDate) : '—'}</dd></div>
        <div><dt className="text-muted-foreground">Salario acordado</dt><dd>{p.agreedSalary != null ? formatGTQ(p.agreedSalary) : '—'}</dd></div>
        <div><dt className="text-muted-foreground">Fee</dt><dd>{p.fee != null ? formatGTQ(p.fee) : '—'}</dd></div>
      </dl>
    </div>
  )
}
```

- [ ] **Step 6: Página `/placements`.**
  - **Step 6a: Lee `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` y usa la API vigente** (página simple que monta la tabla cliente con filtros internos).

```tsx
// app/(app)/placements/page.tsx
import { PlacementsTable } from '@/components/recruitment/placements-table'

export const metadata = { title: 'Placements · SIR CRM' }

export default function PlacementsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-foreground">Placements</h1>
      <PlacementsTable />
    </div>
  )
}
```

- [ ] **Step 7: Verificar tests + build completo del módulo**
  - Comando: `npm run test -- lib/recruitment lib/api/recruitment components/recruitment && npm run build`
  - Esperado: toda la suite de reclutamiento en verde; build de Next sin errores de tipos.

- [ ] **Step 8: Commit**
  - `git add lib/recruitment/placement-schema.ts lib/recruitment/__tests__/placement-schema.test.ts lib/api/recruitment/placements-hooks.ts components/recruitment/create-placement-dialog.tsx components/recruitment/placements-table.tsx components/recruitment/placement-detail.tsx app/\(app\)/placements/page.tsx`
  - `git commit -m "feat(placements): crear desde aplicación, lista filtrable y detail en drawer"`


## Fase 7 — Admin + Catálogos

I have the exact backend contract, DTOs, entity relations, M:N endpoint shapes (`POST /roles/:id/permissions` body `{permissionId}` + `DELETE /roles/:id/permissions/:permId`; `POST /users/:id/roles` body `{roleId}` + `DELETE /users/:id/roles/:roleId`), and the Next 16 conventions (async server pages, `params`/`searchParams` are Promises, `redirect` from `next/navigation`, route groups, static `metadata` export). Here are the Phase 7 tasks.

### Task 7.1: Gating admin (route group + nav) y registro de navegación

**Files:**
- Create: `app/(app)/(admin)/layout.tsx`
- Modify: `lib/nav.ts`

**Interfaces:**
- Consumes (Fase 2 — `lib/auth/session.ts`): `interface SessionUser { id: number; username: string; roles: { id: number; name: string }[]; employee?: { id: number; firstName: string; lastName: string } | null }` y `getCurrentUser(): Promise<SessionUser | null>` (server-only, lee cookie `sir_access` vía proxy `GET /auth/me`).
- Consumes (Fase 2 — `lib/nav.ts`): `type NavAccess = 'admin' | 'auth' | 'all'`; `interface NavItem { label: string; href: string; icon?: string; access?: NavAccess }`; `interface NavGroup { label: string; access?: NavAccess; items: NavItem[] }`; `export const navGroups: NavGroup[]` (la sidebar de Fase 2 filtra cada grupo/item por rol con `getCurrentUser`).
- Consumes (Next 16): `redirect` de `next/navigation`.
- Produces: layout server-side que bloquea `/(admin)/*` para no-admin; entradas de nav "Catálogos" y "Admin" (`access:'admin'`).

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` y `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md` y usa la API vigente** (layout es async Server Component; `redirect()` lanza, no se `return`; los route groups `(admin)` no alteran la URL).
- [ ] **Step 2: Crea el layout del grupo admin con guard de rol server-side.**
```tsx
// app/(app)/(admin)/layout.tsx
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  const isAdmin = !!user?.roles.some((r) => r.name === 'admin')
  if (!isAdmin) redirect('/dashboard')
  return <>{children}</>
}
```
- [ ] **Step 3: Registra los grupos de nav admin.** Agrega estos dos objetos al array `navGroups` exportado en `lib/nav.ts` (los iconos son nombres de lucide que la sidebar de Fase 2 ya mapea):
```ts
// añadir al array navGroups en lib/nav.ts
{
  label: 'Catálogos',
  access: 'admin',
  items: [
    { label: 'Sectores', href: '/sectors', icon: 'Building2', access: 'admin' },
    { label: 'Áreas', href: '/position-areas', icon: 'Layers', access: 'admin' },
    { label: 'Etapas de pipeline', href: '/pipeline-stages', icon: 'GitBranch', access: 'admin' },
    { label: 'Tipos de contacto', href: '/contact-types', icon: 'Tags', access: 'admin' },
  ],
},
{
  label: 'Admin',
  access: 'admin',
  items: [
    { label: 'Usuarios', href: '/users', icon: 'UserCog', access: 'admin' },
    { label: 'Roles', href: '/roles', icon: 'Shield', access: 'admin' },
    { label: 'Permisos', href: '/permissions', icon: 'Key', access: 'admin' },
    { label: 'Empleados', href: '/employees', icon: 'Users', access: 'admin' },
  ],
},
```
- [ ] **Step 4: Verifica typecheck.** Comando: `npm run build`. Esperado: build OK (las páginas admin aún no existen pero el layout/nav compilan; si el build falla por rutas vacías del grupo, continúa — las páginas se crean en 7.2).
- [ ] **Step 5: Commit.** `git add "app/(app)/(admin)/layout.tsx" lib/nav.ts && git commit -m "feat(admin): route-group role guard and admin/catalog nav"`

### Task 7.2: Catálogo de referencia — Sectores (patrón completo)

**Files:**
- Create: `components/resource/bool-badge.tsx`
- Create: `lib/resources/sectors.tsx`
- Create: `app/(app)/(admin)/sectors/page.tsx`
- Modify: ninguno

**Interfaces:**
- Consumes (Fase 3 — `lib/api/client.ts`): `interface Paginated<T> { items: T[]; total: number; page: number; limit: number }`; `function apiRequest<T>(path: string, init?: RequestInit): Promise<T>` (cliente → `/api/proxy/<path>`, desenvuelve `{ok,message,data}`, lanza `Error(message)`).
- Consumes (Fase 3 — `lib/resources/create-resource.tsx`, módulo `'use client'`):
```ts
type FieldType = 'text' | 'email' | 'password' | 'number' | 'date' | 'switch' | 'select' | 'textarea'
interface SelectOption { label: string; value: string | number }
interface FieldDef {
  name: string; label: string; type: FieldType; placeholder?: string
  options?: SelectOption[] | (() => SelectOption[]) // función = hook React, invocado en el cuerpo del form
  step?: number; min?: number; max?: number
}
interface ColumnDef<T> { key: string; header: string; cell?: (row: T) => React.ReactNode; sortable?: boolean }
interface ListParams { page?: number; limit?: number; search?: string; [k: string]: string | number | boolean | undefined }
interface ResourceHooks<T, C, U> {
  queryKey: string
  useList: (params?: ListParams) => import('@tanstack/react-query').UseQueryResult<Paginated<T>, Error>
  useOne: (id: number, enabled?: boolean) => import('@tanstack/react-query').UseQueryResult<T, Error>
  useCreate: () => import('@tanstack/react-query').UseMutationResult<T, Error, C>
  useUpdate: () => import('@tanstack/react-query').UseMutationResult<T, Error, { id: number; data: U }>
  useRemove: () => import('@tanstack/react-query').UseMutationResult<void, Error, number>
}
interface ResourceConfig<T, C, U> {
  key: string; label: string; labelPlural: string
  columns: ColumnDef<T>[]; fields: FieldDef[]
  createSchema: import('zod').ZodType<C>; updateSchema: import('zod').ZodType<U>
  createDefaults: C
  searchable?: boolean
  listParams?: Record<string, string | number | boolean>
  getRowId?: (row: T) => number
  rowActions?: (row: T) => React.ReactNode
}
interface ResourceModule<T, C, U> { config: ResourceConfig<T, C, U>; hooks: ResourceHooks<T, C, U>; Page: React.ComponentType }
function createResource<T, C, U>(config: ResourceConfig<T, C, U>): ResourceModule<T, C, U>
```
- Consumes (Next 16): export `metadata: Metadata`.
- Produces: `BoolBadge`; `SectorsResource: ResourceModule<Sector, SectorCreate, SectorUpdate>`; ruta `/sectors`.

- [ ] **Step 1: Crea `BoolBadge` (badge reutilizable para banderas booleanas; colores solo vía tokens/variants).**
```tsx
// components/resource/bool-badge.tsx
'use client'
import { Badge } from '@/components/ui/badge'

export function BoolBadge({
  value,
  trueLabel = 'Activo',
  falseLabel = 'Inactivo',
}: {
  value?: boolean
  trueLabel?: string
  falseLabel?: string
}) {
  return <Badge variant={value ? 'default' : 'secondary'}>{value ? trueLabel : falseLabel}</Badge>
}
```
- [ ] **Step 2: Instala el componente shadcn `switch` (usado por el campo `active`).** Comando: `npx shadcn@latest add switch`. Esperado: crea `components/ui/switch.tsx` sin errores.
- [ ] **Step 3: Crea el config del recurso (esquema Zod espeja `CreateSectorDto`: `name` requerido, `active` opcional). Archivo `'use client'` para que el módulo + su `Page` vivan en el grafo cliente.**
```tsx
// lib/resources/sectors.tsx
'use client'
import { z } from 'zod'
import { createResource } from '@/lib/resources/create-resource'
import { BoolBadge } from '@/components/resource/bool-badge'

export interface Sector {
  id: number
  name: string
  active: boolean
}

export const sectorCreateSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  active: z.boolean().default(true),
})
export const sectorUpdateSchema = sectorCreateSchema.partial()

export type SectorCreate = z.infer<typeof sectorCreateSchema>
export type SectorUpdate = z.infer<typeof sectorUpdateSchema>

export const SectorsResource = createResource<Sector, SectorCreate, SectorUpdate>({
  key: 'sectors',
  label: 'Sector',
  labelPlural: 'Sectores',
  searchable: true,
  columns: [
    { key: 'name', header: 'Nombre', sortable: true },
    { key: 'active', header: 'Estado', cell: (r) => <BoolBadge value={r.active} /> },
  ],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Tecnología' },
    { name: 'active', label: 'Activo', type: 'switch' },
  ],
  createSchema: sectorCreateSchema,
  updateSchema: sectorUpdateSchema,
  createDefaults: { name: '', active: true },
})
```
- [ ] **Step 4: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` y usa la API vigente** (export estático `metadata: Metadata` en el `page.tsx` Server Component; el `Page` del módulo es Client Component importado en el servidor).
- [ ] **Step 5: Crea la página (patrón de página de recurso admin — se reutiliza idéntico en 7.3–7.7 cambiando módulo y título).**
```tsx
// app/(app)/(admin)/sectors/page.tsx
import type { Metadata } from 'next'
import { SectorsResource } from '@/lib/resources/sectors'

export const metadata: Metadata = { title: 'Sectores · SIR CRM' }

export default function Page() {
  return <SectorsResource.Page />
}
```
- [ ] **Step 6: Verifica.** Comando: `npm run build`. Esperado: compila; ruta `/sectors` listada en el output.
- [ ] **Step 7: Commit.** `git add components/resource/bool-badge.tsx lib/resources/sectors.tsx "app/(app)/(admin)/sectors/page.tsx" && git commit -m "feat(catalogs): sectors resource as reference catalog pattern"`

### Task 7.3: Catálogos restantes — Áreas, Tipos de contacto, Etapas de pipeline (solo config)

**Files:**
- Create: `lib/resources/position-areas.tsx`
- Create: `lib/resources/contact-types.tsx`
- Create: `lib/resources/pipeline-stages.tsx`
- Create: `app/(app)/(admin)/position-areas/page.tsx`
- Create: `app/(app)/(admin)/contact-types/page.tsx`
- Create: `app/(app)/(admin)/pipeline-stages/page.tsx`

**Interfaces:**
- Consumes: `createResource`, `Paginated`, `BoolBadge`, `ListParams` (igual que 7.2). `pipeline-stages` usa `listParams`/`ListParams` para el filtro `?active`.
- Produces: `PositionAreasResource`, `ContactTypesResource`, `PipelineStagesResource` y sus rutas.

- [ ] **Step 1: Áreas (espeja `CreatePositionAreaDto`: `name`, `active?`). Idéntico a Sectors salvo etiquetas/key.**
```tsx
// lib/resources/position-areas.tsx
'use client'
import { z } from 'zod'
import { createResource } from '@/lib/resources/create-resource'
import { BoolBadge } from '@/components/resource/bool-badge'

export interface PositionArea { id: number; name: string; active: boolean }

export const positionAreaCreateSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  active: z.boolean().default(true),
})
export const positionAreaUpdateSchema = positionAreaCreateSchema.partial()
export type PositionAreaCreate = z.infer<typeof positionAreaCreateSchema>
export type PositionAreaUpdate = z.infer<typeof positionAreaUpdateSchema>

export const PositionAreasResource = createResource<PositionArea, PositionAreaCreate, PositionAreaUpdate>({
  key: 'position-areas',
  label: 'Área',
  labelPlural: 'Áreas',
  searchable: true,
  columns: [
    { key: 'name', header: 'Nombre', sortable: true },
    { key: 'active', header: 'Estado', cell: (r) => <BoolBadge value={r.active} /> },
  ],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Administración' },
    { name: 'active', label: 'Activo', type: 'switch' },
  ],
  createSchema: positionAreaCreateSchema,
  updateSchema: positionAreaUpdateSchema,
  createDefaults: { name: '', active: true },
})
```
- [ ] **Step 2: Tipos de contacto (espeja `CreateContactTypeDto`: solo `name`).**
```tsx
// lib/resources/contact-types.tsx
'use client'
import { z } from 'zod'
import { createResource } from '@/lib/resources/create-resource'

export interface ContactType { id: number; name: string }

export const contactTypeCreateSchema = z.object({ name: z.string().min(1, 'Requerido') })
export const contactTypeUpdateSchema = contactTypeCreateSchema.partial()
export type ContactTypeCreate = z.infer<typeof contactTypeCreateSchema>
export type ContactTypeUpdate = z.infer<typeof contactTypeUpdateSchema>

export const ContactTypesResource = createResource<ContactType, ContactTypeCreate, ContactTypeUpdate>({
  key: 'contact-types',
  label: 'Tipo de contacto',
  labelPlural: 'Tipos de contacto',
  searchable: true,
  columns: [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Nombre', sortable: true },
  ],
  fields: [{ name: 'name', label: 'Nombre', type: 'text', placeholder: 'Llamada' }],
  createSchema: contactTypeCreateSchema,
  updateSchema: contactTypeUpdateSchema,
  createDefaults: { name: '' },
})
```
- [ ] **Step 3: Etapas de pipeline (espeja `CreatePipelineStageDto`: `name`, `sortOrder` int, `probability` int 0–100, `isWon?`, `isLost?`, `active?`). Filtro `?active` vía `listParams`.**
```tsx
// lib/resources/pipeline-stages.tsx
'use client'
import { z } from 'zod'
import { createResource } from '@/lib/resources/create-resource'
import { BoolBadge } from '@/components/resource/bool-badge'

export interface PipelineStage {
  id: number
  name: string
  sortOrder: number
  probability: number
  isWon: boolean
  isLost: boolean
  active: boolean
}

export const pipelineStageCreateSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  sortOrder: z.coerce.number().int('Debe ser entero'),
  probability: z.coerce.number().int().min(0, 'Mínimo 0').max(100, 'Máximo 100'),
  isWon: z.boolean().default(false),
  isLost: z.boolean().default(false),
  active: z.boolean().default(true),
})
export const pipelineStageUpdateSchema = pipelineStageCreateSchema.partial()
export type PipelineStageCreate = z.infer<typeof pipelineStageCreateSchema>
export type PipelineStageUpdate = z.infer<typeof pipelineStageUpdateSchema>

export const PipelineStagesResource = createResource<PipelineStage, PipelineStageCreate, PipelineStageUpdate>({
  key: 'pipeline-stages',
  label: 'Etapa',
  labelPlural: 'Etapas de pipeline',
  searchable: true,
  columns: [
    { key: 'sortOrder', header: 'Orden', sortable: true },
    { key: 'name', header: 'Nombre', sortable: true },
    { key: 'probability', header: 'Probabilidad', cell: (r) => `${r.probability}%` },
    { key: 'isWon', header: 'Ganada', cell: (r) => <BoolBadge value={r.isWon} trueLabel="Sí" falseLabel="No" /> },
    { key: 'isLost', header: 'Perdida', cell: (r) => <BoolBadge value={r.isLost} trueLabel="Sí" falseLabel="No" /> },
    { key: 'active', header: 'Estado', cell: (r) => <BoolBadge value={r.active} /> },
  ],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Propuesta enviada' },
    { name: 'sortOrder', label: 'Orden', type: 'number', step: 1 },
    { name: 'probability', label: 'Probabilidad (%)', type: 'number', min: 0, max: 100, step: 1 },
    { name: 'isWon', label: 'Etapa ganada', type: 'switch' },
    { name: 'isLost', label: 'Etapa perdida', type: 'switch' },
    { name: 'active', label: 'Activa', type: 'switch' },
  ],
  createSchema: pipelineStageCreateSchema,
  updateSchema: pipelineStageUpdateSchema,
  createDefaults: { name: '', sortOrder: 0, probability: 0, isWon: false, isLost: false, active: true },
})
```
- [ ] **Step 4: Crea las tres páginas siguiendo el patrón de 7.2 (Step 5), cambiando módulo y título.**
```tsx
// app/(app)/(admin)/position-areas/page.tsx
import type { Metadata } from 'next'
import { PositionAreasResource } from '@/lib/resources/position-areas'
export const metadata: Metadata = { title: 'Áreas · SIR CRM' }
export default function Page() { return <PositionAreasResource.Page /> }
```
```tsx
// app/(app)/(admin)/contact-types/page.tsx
import type { Metadata } from 'next'
import { ContactTypesResource } from '@/lib/resources/contact-types'
export const metadata: Metadata = { title: 'Tipos de contacto · SIR CRM' }
export default function Page() { return <ContactTypesResource.Page /> }
```
```tsx
// app/(app)/(admin)/pipeline-stages/page.tsx
import type { Metadata } from 'next'
import { PipelineStagesResource } from '@/lib/resources/pipeline-stages'
export const metadata: Metadata = { title: 'Etapas de pipeline · SIR CRM' }
export default function Page() { return <PipelineStagesResource.Page /> }
```
- [ ] **Step 5: Verifica.** Comando: `npm run build`. Esperado: compila; rutas `/position-areas`, `/contact-types`, `/pipeline-stages` en el output.
- [ ] **Step 6: Commit.** `git add lib/resources/position-areas.tsx lib/resources/contact-types.tsx lib/resources/pipeline-stages.tsx "app/(app)/(admin)/position-areas" "app/(app)/(admin)/contact-types" "app/(app)/(admin)/pipeline-stages" && git commit -m "feat(catalogs): position-areas, contact-types and pipeline-stages resources"`

### Task 7.4: Empleados — recurso con muchos campos del DTO

**Files:**
- Create: `lib/resources/zod.ts`
- Create: `lib/resources/employees.tsx`
- Create: `app/(app)/(admin)/employees/page.tsx`

**Interfaces:**
- Consumes (Fase 1/3 — `lib/format.ts`): `function formatCurrency(value: number): string` (GTQ, `Intl` `es-GT`); `function formatDate(value: string | Date): string` (`Intl` `es-GT`).
- Consumes: `createResource`, `FieldDef` (igual que 7.2).
- Produces: helper Zod `optionalText`/`optionalEmail`; `EmployeesResource: ResourceModule<Employee, EmployeeCreate, EmployeeUpdate>` y ruta `/employees`. `EmployeesResource.hooks.useList` se reutiliza en 7.7 como pool del select de empleado.

- [ ] **Step 1: Crea helpers Zod reutilizables (normalizan strings vacíos del form a `undefined`, espejando campos opcionales del DTO).**
```ts
// lib/resources/zod.ts
import { z } from 'zod'

export const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))

export const optionalEmail = z
  .string()
  .trim()
  .email('Email inválido')
  .optional()
  .or(z.literal(''))
  .transform((v) => (v ? v : undefined))
```
- [ ] **Step 2: Crea el config de Empleados (espeja `CreateEmployeeDto`: `firstName`/`lastName` requeridos; `secondName`, `surName`, `nationalId`, `phoneNumber`, `email`, `birthDate`, `hireDate`, `salary` opcionales). Columnas con formato Q y fecha es-GT.**
```tsx
// lib/resources/employees.tsx
'use client'
import { z } from 'zod'
import { createResource } from '@/lib/resources/create-resource'
import { optionalText, optionalEmail } from '@/lib/resources/zod'
import { formatCurrency, formatDate } from '@/lib/format'

export interface Employee {
  id: number
  firstName: string
  secondName?: string
  lastName: string
  surName?: string
  nationalId?: string
  phoneNumber?: string
  email?: string
  birthDate?: string
  hireDate?: string
  salary?: number
}

export const employeeCreateSchema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  secondName: optionalText,
  lastName: z.string().min(1, 'Requerido'),
  surName: optionalText,
  nationalId: optionalText,
  phoneNumber: optionalText,
  email: optionalEmail,
  birthDate: optionalText,
  hireDate: optionalText,
  salary: z.coerce.number().nonnegative('No puede ser negativo').optional(),
})
export const employeeUpdateSchema = employeeCreateSchema.partial()
export type EmployeeCreate = z.infer<typeof employeeCreateSchema>
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>

export const EmployeesResource = createResource<Employee, EmployeeCreate, EmployeeUpdate>({
  key: 'employees',
  label: 'Empleado',
  labelPlural: 'Empleados',
  searchable: true,
  columns: [
    { key: 'name', header: 'Nombre', cell: (r) => `${r.firstName} ${r.lastName}` },
    { key: 'email', header: 'Email', cell: (r) => r.email ?? '—' },
    { key: 'phoneNumber', header: 'Teléfono', cell: (r) => r.phoneNumber ?? '—' },
    { key: 'hireDate', header: 'Ingreso', cell: (r) => (r.hireDate ? formatDate(r.hireDate) : '—') },
    { key: 'salary', header: 'Salario', cell: (r) => (r.salary != null ? formatCurrency(r.salary) : '—') },
  ],
  fields: [
    { name: 'firstName', label: 'Primer nombre', type: 'text' },
    { name: 'secondName', label: 'Segundo nombre', type: 'text' },
    { name: 'lastName', label: 'Primer apellido', type: 'text' },
    { name: 'surName', label: 'Segundo apellido', type: 'text' },
    { name: 'nationalId', label: 'DPI / Identificación', type: 'text' },
    { name: 'phoneNumber', label: 'Teléfono', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'birthDate', label: 'Fecha de nacimiento', type: 'date' },
    { name: 'hireDate', label: 'Fecha de ingreso', type: 'date' },
    { name: 'salary', label: 'Salario (GTQ)', type: 'number', min: 0, step: 0.01 },
  ],
  createSchema: employeeCreateSchema,
  updateSchema: employeeUpdateSchema,
  createDefaults: {
    firstName: '', secondName: undefined, lastName: '', surName: undefined,
    nationalId: undefined, phoneNumber: undefined, email: undefined,
    birthDate: undefined, hireDate: undefined, salary: undefined,
  },
})
```
- [ ] **Step 3: Crea la página (patrón 7.2 Step 5).**
```tsx
// app/(app)/(admin)/employees/page.tsx
import type { Metadata } from 'next'
import { EmployeesResource } from '@/lib/resources/employees'
export const metadata: Metadata = { title: 'Empleados · SIR CRM' }
export default function Page() { return <EmployeesResource.Page /> }
```
- [ ] **Step 4: Verifica.** Comando: `npm run build`. Esperado: compila; ruta `/employees` en el output.
- [ ] **Step 5: Commit.** `git add lib/resources/zod.ts lib/resources/employees.tsx "app/(app)/(admin)/employees/page.tsx" && git commit -m "feat(admin): employees resource with full DTO fields"`

### Task 7.5: Permisos — recurso simple (pool para Roles)

**Files:**
- Create: `lib/resources/permissions.tsx`
- Create: `app/(app)/(admin)/permissions/page.tsx`

**Interfaces:**
- Consumes: `createResource` (igual que 7.2).
- Produces: `Permission` (`{ id; name }`); `PermissionsResource`; ruta `/permissions`. `PermissionsResource.hooks.useList` se reutiliza en 7.6 como pool de permisos.

- [ ] **Step 1: Crea el config de Permisos (espeja `CreatePermissionDto`: solo `name`).**
```tsx
// lib/resources/permissions.tsx
'use client'
import { z } from 'zod'
import { createResource } from '@/lib/resources/create-resource'

export interface Permission { id: number; name: string }

export const permissionCreateSchema = z.object({ name: z.string().min(1, 'Requerido') })
export const permissionUpdateSchema = permissionCreateSchema.partial()
export type PermissionCreate = z.infer<typeof permissionCreateSchema>
export type PermissionUpdate = z.infer<typeof permissionUpdateSchema>

export const PermissionsResource = createResource<Permission, PermissionCreate, PermissionUpdate>({
  key: 'permissions',
  label: 'Permiso',
  labelPlural: 'Permisos',
  searchable: true,
  columns: [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Nombre', sortable: true },
  ],
  fields: [{ name: 'name', label: 'Nombre', type: 'text', placeholder: 'clients:read' }],
  createSchema: permissionCreateSchema,
  updateSchema: permissionUpdateSchema,
  createDefaults: { name: '' },
})
```
- [ ] **Step 2: Crea la página (patrón 7.2 Step 5).**
```tsx
// app/(app)/(admin)/permissions/page.tsx
import type { Metadata } from 'next'
import { PermissionsResource } from '@/lib/resources/permissions'
export const metadata: Metadata = { title: 'Permisos · SIR CRM' }
export default function Page() { return <PermissionsResource.Page /> }
```
- [ ] **Step 3: Verifica.** Comando: `npm run build`. Esperado: compila; ruta `/permissions` en el output.
- [ ] **Step 4: Commit.** `git add lib/resources/permissions.tsx "app/(app)/(admin)/permissions/page.tsx" && git commit -m "feat(admin): permissions resource"`

### Task 7.6: Bloques de asignación M:N + Roles (recurso-con-asignación de referencia)

**Files:**
- Create: `lib/api/assignments.ts`
- Create: `components/resource/assignment-manager.tsx`
- Create: `components/admin/role-permissions-dialog.tsx`
- Create: `lib/resources/roles.tsx`
- Create: `app/(app)/(admin)/roles/page.tsx`

**Interfaces:**
- Consumes (Fase 3): `apiRequest<T>(path, init?)`; `useMutation`, `useQueryClient` de `@tanstack/react-query`; `PermissionsResource.hooks.useList` (pool); convención de query keys de Fase 3: lista `[key, 'list', params]`, uno `[key, 'one', id]` (invalidar por prefijo `[key]` refresca ambos).
- Consumes (shadcn): `command`, `popover`, `badge`, `dialog`, `button`, `dropdown-menu`.
- Consumes (backend): `POST /roles/:id/permissions` body `{ permissionId }`; `DELETE /roles/:id/permissions/:permId`; `GET /roles/:id` devuelve el rol con `permissions: Permission[]`.
- Produces:
  - `createAssignmentHooks(cfg): { useAdd; useRemove }` con `useAdd/useRemove: UseMutationResult<void, Error, { parentId: number; childId: number }>`.
  - `rolePermissionAssignment`, `userRoleAssignment` (instancias).
  - `AssignmentManager` (componente M:N reutilizable).
  - `Role` (`{ id; name; permissions?: Permission[] }`); `RolesResource`; ruta `/roles`. `RolesResource.hooks.{useOne,useList}` se reutilizan en 7.7.

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` y usa la API vigente para confirmar la forma del proxy** (las mutaciones cliente pegan a `/api/proxy/<path>` same-origin; `apiRequest` ya añade `Content-Type: application/json` y serializa `body`; `DELETE` sin body).
- [ ] **Step 2: Instala los componentes shadcn faltantes para asignación.** Comando: `npx shadcn@latest add popover command badge dialog`. Esperado: crea/asegura `components/ui/{popover,command,badge,dialog}.tsx` (los ya existentes se omiten).
- [ ] **Step 3: Crea la factory de hooks de asignación (DRY para roles↔permisos y usuarios↔roles).**
```ts
// lib/api/assignments.ts
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api/client'

export interface AssignmentVars {
  parentId: number
  childId: number
}
interface AssignmentHooksConfig {
  parentKey: string
  addPath: (parentId: number) => string
  removePath: (parentId: number, childId: number) => string
  bodyKey: string
}

export function createAssignmentHooks(cfg: AssignmentHooksConfig) {
  function useInvalidate() {
    const qc = useQueryClient()
    return (parentId: number) =>
      qc.invalidateQueries({ queryKey: [cfg.parentKey] }) &&
      qc.invalidateQueries({ queryKey: [cfg.parentKey, 'one', parentId] })
  }
  function useAdd(): UseMutationResult<void, Error, AssignmentVars> {
    const invalidate = useInvalidate()
    return useMutation({
      mutationFn: ({ parentId, childId }) =>
        apiRequest<void>(cfg.addPath(parentId), {
          method: 'POST',
          body: JSON.stringify({ [cfg.bodyKey]: childId }),
        }),
      onSuccess: (_d, { parentId }) => invalidate(parentId),
    })
  }
  function useRemove(): UseMutationResult<void, Error, AssignmentVars> {
    const invalidate = useInvalidate()
    return useMutation({
      mutationFn: ({ parentId, childId }) =>
        apiRequest<void>(cfg.removePath(parentId, childId), { method: 'DELETE' }),
      onSuccess: (_d, { parentId }) => invalidate(parentId),
    })
  }
  return { useAdd, useRemove }
}

export const rolePermissionAssignment = createAssignmentHooks({
  parentKey: 'roles',
  addPath: (id) => `roles/${id}/permissions`,
  removePath: (id, permId) => `roles/${id}/permissions/${permId}`,
  bodyKey: 'permissionId',
})

export const userRoleAssignment = createAssignmentHooks({
  parentKey: 'users',
  addPath: (id) => `users/${id}/roles`,
  removePath: (id, roleId) => `users/${id}/roles/${roleId}`,
  bodyKey: 'roleId',
})
```
- [ ] **Step 4: Crea `AssignmentManager` (componente M:N reutilizable: badges removibles de asignados + buscador del pool restante). Colores solo vía variants/tokens.**
```tsx
// components/resource/assignment-manager.tsx
'use client'
import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export interface AssignableItem {
  id: number
  name: string
}

export function AssignmentManager({
  assigned,
  pool,
  onAdd,
  onRemove,
  isPending = false,
  emptyLabel = 'Sin asignaciones',
}: {
  assigned: AssignableItem[]
  pool: AssignableItem[]
  onAdd: (childId: number) => void
  onRemove: (childId: number) => void
  isPending?: boolean
  emptyLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const assignedIds = new Set(assigned.map((a) => a.id))
  const available = pool.filter((p) => !assignedIds.has(p.id))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {assigned.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          assigned.map((item) => (
            <Badge key={item.id} variant="secondary" className="gap-1">
              {item.name}
              <button
                type="button"
                aria-label={`Quitar ${item.name}`}
                disabled={isPending}
                onClick={() => onRemove(item.id)}
                className="ml-1 rounded-sm hover:text-destructive disabled:opacity-50"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" disabled={isPending || available.length === 0}>
            <Plus className="size-4" /> Asignar
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar..." />
            <CommandList>
              <CommandEmpty>No hay opciones.</CommandEmpty>
              <CommandGroup>
                {available.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onAdd(item.id)
                      setOpen(false)
                    }}
                  >
                    <Check className="size-4 opacity-0" />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
```
- [ ] **Step 5: Crea el diálogo de permisos de rol (item de menú + Dialog; carga asignados con `useOne` al abrir y el pool con permisos `useList`). Referencia M:N completa.**
```tsx
// components/admin/role-permissions-dialog.tsx
'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { AssignmentManager } from '@/components/resource/assignment-manager'
import { rolePermissionAssignment } from '@/lib/api/assignments'
import { PermissionsResource } from '@/lib/resources/permissions'
import { RolesResource, type Role } from '@/lib/resources/roles'

export function RolePermissionsDialog({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  const detail = RolesResource.hooks.useOne(role.id, open)
  const pool = PermissionsResource.hooks.useList({ limit: 200 })
  const add = rolePermissionAssignment.useAdd()
  const remove = rolePermissionAssignment.useRemove()
  const assigned = detail.data?.permissions ?? role.permissions ?? []

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault()
          setOpen(true)
        }}
      >
        Permisos
      </DropdownMenuItem>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permisos de {role.name}</DialogTitle>
            <DialogDescription>Asigna o quita permisos para este rol.</DialogDescription>
          </DialogHeader>
          <AssignmentManager
            assigned={assigned}
            pool={pool.data?.items ?? []}
            onAdd={(childId) => add.mutate({ parentId: role.id, childId })}
            onRemove={(childId) => remove.mutate({ parentId: role.id, childId })}
            isPending={add.isPending || remove.isPending || detail.isLoading}
            emptyLabel="Sin permisos asignados"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
```
- [ ] **Step 6: Crea el config de Roles (espeja `CreateRoleDto`: `name`; `rowActions` inyecta el diálogo de permisos).**
```tsx
// lib/resources/roles.tsx
'use client'
import { z } from 'zod'
import { createResource } from '@/lib/resources/create-resource'
import { Badge } from '@/components/ui/badge'
import { RolePermissionsDialog } from '@/components/admin/role-permissions-dialog'
import type { Permission } from '@/lib/resources/permissions'

export interface Role {
  id: number
  name: string
  permissions?: Permission[]
}

export const roleCreateSchema = z.object({ name: z.string().min(1, 'Requerido') })
export const roleUpdateSchema = roleCreateSchema.partial()
export type RoleCreate = z.infer<typeof roleCreateSchema>
export type RoleUpdate = z.infer<typeof roleUpdateSchema>

export const RolesResource = createResource<Role, RoleCreate, RoleUpdate>({
  key: 'roles',
  label: 'Rol',
  labelPlural: 'Roles',
  searchable: true,
  columns: [
    { key: 'name', header: 'Nombre', sortable: true },
    {
      key: 'permissions',
      header: 'Permisos',
      cell: (r) => <Badge variant="secondary">{r.permissions?.length ?? 0}</Badge>,
    },
  ],
  fields: [{ name: 'name', label: 'Nombre', type: 'text', placeholder: 'admin' }],
  createSchema: roleCreateSchema,
  updateSchema: roleUpdateSchema,
  createDefaults: { name: '' },
  rowActions: (role) => <RolePermissionsDialog role={role} />,
})
```
- [ ] **Step 7: Crea la página (patrón 7.2 Step 5).**
```tsx
// app/(app)/(admin)/roles/page.tsx
import type { Metadata } from 'next'
import { RolesResource } from '@/lib/resources/roles'
export const metadata: Metadata = { title: 'Roles · SIR CRM' }
export default function Page() { return <RolesResource.Page /> }
```
- [ ] **Step 8: Verifica.** Comando: `npm run build`. Esperado: compila; ruta `/roles` en el output.
- [ ] **Step 9: Commit.** `git add lib/api/assignments.ts components/resource/assignment-manager.tsx components/admin/role-permissions-dialog.tsx lib/resources/roles.tsx "app/(app)/(admin)/roles/page.tsx" && git commit -m "feat(admin): roles resource with M:N permission assignment"`

### Task 7.7: Usuarios — recurso con password y asignación de roles (config específico)

**Files:**
- Create: `components/admin/user-roles-dialog.tsx`
- Create: `lib/resources/users.tsx`
- Create: `app/(app)/(admin)/users/page.tsx`

**Interfaces:**
- Consumes: `createResource`, `AssignmentManager`, `userRoleAssignment` (7.6), `RolesResource.hooks.useList` (pool de roles), `EmployeesResource.hooks.useList` (opciones del select de empleado vía `FieldDef.options` función-hook), `UsersResource.hooks.useOne`.
- Consumes (backend): `POST /users/:id/roles` body `{ roleId }`; `DELETE /users/:id/roles/:roleId`; `GET /users/:id` devuelve `user` con `roles: Role[]` + `employee`; el password nunca se devuelve (el backend lo excluye).
- Produces: `User` (`{ id; username; employeeId; employee?; roles? }`, sin `password`); `UsersResource`; ruta `/users`.

- [ ] **Step 1: Crea el diálogo de roles de usuario (espejo del de 7.6; solo difieren entidad/hooks/textos — el resto es idéntico al patrón M:N de referencia).**
```tsx
// components/admin/user-roles-dialog.tsx
'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { AssignmentManager } from '@/components/resource/assignment-manager'
import { userRoleAssignment } from '@/lib/api/assignments'
import { RolesResource } from '@/lib/resources/roles'
import { UsersResource, type User } from '@/lib/resources/users'

export function UserRolesDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const detail = UsersResource.hooks.useOne(user.id, open)
  const pool = RolesResource.hooks.useList({ limit: 200 })
  const add = userRoleAssignment.useAdd()
  const remove = userRoleAssignment.useRemove()
  const assigned = detail.data?.roles ?? user.roles ?? []

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault()
          setOpen(true)
        }}
      >
        Roles
      </DropdownMenuItem>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Roles de {user.username}</DialogTitle>
            <DialogDescription>Asigna o quita roles para este usuario.</DialogDescription>
          </DialogHeader>
          <AssignmentManager
            assigned={assigned}
            pool={pool.data?.items ?? []}
            onAdd={(childId) => add.mutate({ parentId: user.id, childId })}
            onRemove={(childId) => remove.mutate({ parentId: user.id, childId })}
            isPending={add.isPending || remove.isPending || detail.isLoading}
            emptyLabel="Sin roles asignados"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
```
- [ ] **Step 2: Crea el config de Usuarios.** Espeja `CreateUserDto` (`username`, `password`, `employeeId` int). En update el password es opcional: vacío ⇒ se omite (transform a `undefined`) y el backend conserva el actual. El select de empleado carga opciones dinámicas vía `FieldDef.options` como hook (`EmployeesResource.hooks.useList`).
```tsx
// lib/resources/users.tsx
'use client'
import { z } from 'zod'
import { createResource } from '@/lib/resources/create-resource'
import { Badge } from '@/components/ui/badge'
import { EmployeesResource, type Employee } from '@/lib/resources/employees'
import { UserRolesDialog } from '@/components/admin/user-roles-dialog'
import type { Role } from '@/lib/resources/roles'

export interface User {
  id: number
  username: string
  employeeId: number
  employee?: Employee
  roles?: Role[]
}

export const userCreateSchema = z.object({
  username: z.string().min(1, 'Requerido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  employeeId: z.coerce.number().int().positive('Selecciona un empleado'),
})

export const userUpdateSchema = z.object({
  username: z.string().min(1, 'Requerido').optional(),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  employeeId: z.coerce.number().int().positive().optional(),
})

export type UserCreate = z.infer<typeof userCreateSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>

function useEmployeeOptions() {
  const { data } = EmployeesResource.hooks.useList({ limit: 200 })
  return (data?.items ?? []).map((e) => ({
    label: `${e.firstName} ${e.lastName}`,
    value: e.id,
  }))
}

export const UsersResource = createResource<User, UserCreate, UserUpdate>({
  key: 'users',
  label: 'Usuario',
  labelPlural: 'Usuarios',
  searchable: true,
  columns: [
    { key: 'username', header: 'Usuario', sortable: true },
    {
      key: 'employee',
      header: 'Empleado',
      cell: (r) => (r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '—'),
    },
    {
      key: 'roles',
      header: 'Roles',
      cell: (r) =>
        r.roles?.length ? (
          <div className="flex flex-wrap gap-1">
            {r.roles.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
          </div>
        ) : (
          '—'
        ),
    },
  ],
  fields: [
    { name: 'username', label: 'Usuario', type: 'text' },
    { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Dejar vacío para no cambiar' },
    { name: 'employeeId', label: 'Empleado', type: 'select', options: useEmployeeOptions },
  ],
  createSchema: userCreateSchema,
  updateSchema: userUpdateSchema,
  createDefaults: { username: '', password: '', employeeId: 0 },
  rowActions: (user) => <UserRolesDialog user={user} />,
})
```
- [ ] **Step 3: Crea la página (patrón 7.2 Step 5).**
```tsx
// app/(app)/(admin)/users/page.tsx
import type { Metadata } from 'next'
import { UsersResource } from '@/lib/resources/users'
export const metadata: Metadata = { title: 'Usuarios · SIR CRM' }
export default function Page() { return <UsersResource.Page /> }
```
- [ ] **Step 4: Verifica.** Comando: `npm run build`. Esperado: compila; ruta `/users` en el output.
- [ ] **Step 5: Commit.** `git add components/admin/user-roles-dialog.tsx lib/resources/users.tsx "app/(app)/(admin)/users/page.tsx" && git commit -m "feat(admin): users resource with password handling and role assignment"`

### Task 7.8: Tests representativos (un catálogo Zod + un M:N) y verificación final

**Files:**
- Test: `test/resources/pipeline-stages.test.ts`
- Test: `test/resources/assignment-manager.test.tsx`

**Interfaces:**
- Consumes (Fase 3 — setup Vitest): `vitest` + `@testing-library/react` (jsdom/happy-dom, `@vitejs/plugin-react`) ya configurados; script `npm run test`.
- Consumes: `pipelineStageCreateSchema` (7.3), `AssignmentManager` (7.6).
- Produces: cobertura representativa de validación Zod de catálogo y de la lógica M:N (pool excluye asignados; `onAdd`/`onRemove` se disparan).

- [ ] **Step 1: Confirma el runner.** Comando: `npm run test -- --run --reporter=dot`. Esperado: la suite existente de Fase 3 pasa (confirma que Vitest + Testing Library están operativos antes de añadir tests).
- [ ] **Step 2: Test de catálogo (validación Zod de `pipeline-stages`: probability acotada 0–100, sortOrder entero, coerción de strings de inputs).**
```ts
// test/resources/pipeline-stages.test.ts
import { describe, expect, it } from 'vitest'
import { pipelineStageCreateSchema } from '@/lib/resources/pipeline-stages'

describe('pipelineStageCreateSchema', () => {
  it('acepta un payload válido y coacciona números de inputs string', () => {
    const parsed = pipelineStageCreateSchema.parse({
      name: 'Propuesta',
      sortOrder: '2',
      probability: '40',
      active: true,
    })
    expect(parsed.sortOrder).toBe(2)
    expect(parsed.probability).toBe(40)
    expect(parsed.isWon).toBe(false)
    expect(parsed.isLost).toBe(false)
  })

  it('rechaza probability fuera de rango', () => {
    expect(() =>
      pipelineStageCreateSchema.parse({ name: 'X', sortOrder: 1, probability: 150 }),
    ).toThrow()
  })

  it('rechaza name vacío', () => {
    expect(() =>
      pipelineStageCreateSchema.parse({ name: '', sortOrder: 1, probability: 10 }),
    ).toThrow()
  })
})
```
- [ ] **Step 3: Test M:N (`AssignmentManager`: muestra asignados, el pool excluye los ya asignados, y quitar dispara `onRemove`).**
```tsx
// test/resources/assignment-manager.test.tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AssignmentManager } from '@/components/resource/assignment-manager'

describe('AssignmentManager', () => {
  const assigned = [{ id: 1, name: 'clients:read' }]
  const pool = [
    { id: 1, name: 'clients:read' },
    { id: 2, name: 'clients:write' },
  ]

  it('renderiza los asignados y permite quitarlos', () => {
    const onRemove = vi.fn()
    render(<AssignmentManager assigned={assigned} pool={pool} onAdd={vi.fn()} onRemove={onRemove} />)
    expect(screen.getByText('clients:read')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Quitar clients:read'))
    expect(onRemove).toHaveBeenCalledWith(1)
  })

  it('habilita asignar cuando hay items disponibles fuera de los asignados', () => {
    render(<AssignmentManager assigned={assigned} pool={pool} onAdd={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Asignar/ })).toBeEnabled()
  })

  it('deshabilita asignar cuando el pool ya está todo asignado', () => {
    render(
      <AssignmentManager assigned={assigned} pool={[assigned[0]]} onAdd={vi.fn()} onRemove={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /Asignar/ })).toBeDisabled()
  })
})
```
- [ ] **Step 4: Corre los tests nuevos.** Comando: `npm run test -- --run test/resources/pipeline-stages.test.ts test/resources/assignment-manager.test.tsx`. Esperado: todos los tests pasan (6 passed).
- [ ] **Step 5: Verificación final de la fase.** Comando: `npm run build`. Esperado: build exitoso con las rutas `/sectors`, `/position-areas`, `/contact-types`, `/pipeline-stages`, `/employees`, `/permissions`, `/roles`, `/users` presentes.
- [ ] **Step 6: Commit.** `git add test/resources/pipeline-stages.test.ts test/resources/assignment-manager.test.tsx && git commit -m "test(admin): representative catalog Zod and M:N assignment tests"`


## Fase 8 — Pulido / Interactividad

I have enough context. The project is at template state (phases 1–7 produce the files Phase 8 builds on), and I've read the spec plus the Next 16 Playwright doc. Below are the Phase 8 task sections.

### Task 8.1: Command palette (⌘K) en el Topbar

**Files:**
- Create: `lib/nav/items.ts` (centraliza nav; DRY — consumido por Sidebar/Topbar/CommandPalette)
- Create: `components/layout/command-palette.tsx`
- Create: `components/layout/command-palette-provider.tsx`
- Modify: `components/layout/topbar.tsx` (botón "⌘K Buscar…" que abre el palette)
- Modify: `components/ui/command.tsx` (asegurar componente shadcn `command` instalado)
- Test: `test/unit/nav-items.test.ts`

**Interfaces:**
- Consumes: `navGroups` (estructura de navegación por rol creada en Fase 2/7). Si Fase 2 ya exportó nav, re-exportar desde aquí sin duplicar.
- Produces: `export type NavItem = { key: string; label: string; href: string; icon: LucideIcon; access: 'admin' | 'auth' | 'any'; keywords?: string[] }`
- Produces: `export type NavGroup = { label: string; items: NavItem[] }`
- Produces: `export const navGroups: NavGroup[]`
- Produces: `export function visibleNavGroups(roles: string[]): NavGroup[]`
- Produces: `<CommandPalette />` (client) y `<CommandPaletteProvider>` (context + listener global ⌘K / Ctrl+K)
- Produces: `export function useCommandPalette(): { open: boolean; setOpen: (v: boolean) => void }`

- [ ] **Step 1: Instala el componente `command` de shadcn (cmdk) si falta**
```bash
npx shadcn@latest add command
```
Esperado: crea/confirma `components/ui/command.tsx` (export `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandShortcut`) sin errores.

- [ ] **Step 2: Centraliza la navegación en `lib/nav/items.ts`**
Mueve aquí (o re-exporta) la estructura de nav definida en la Fase 2/7 para una sola fuente de verdad. Cada item lleva `keywords` para mejorar la búsqueda del palette (p.ej. oportunidades → `['pipeline','kanban','ventas']`).
```ts
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Briefcase, Building2, Phone, Inbox,
  Users, FileText, CheckCircle2, Layers, Map, GitBranch,
  Tag, Shield, KeyRound, IdCard,
} from 'lucide-react'

export type Access = 'admin' | 'auth' | 'any'

export type NavItem = {
  key: string
  label: string
  href: string
  icon: LucideIcon
  access: Access
  keywords?: string[]
}

export type NavGroup = { label: string; items: NavItem[] }

export const navGroups: NavGroup[] = [
  {
    label: 'General',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, access: 'any', keywords: ['inicio', 'metricas', 'kpis'] },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { key: 'opportunities', label: 'Oportunidades', href: '/opportunities', icon: Briefcase, access: 'auth', keywords: ['pipeline', 'kanban', 'ventas'] },
      { key: 'clients', label: 'Clientes', href: '/clients', icon: Building2, access: 'auth', keywords: ['empresas', 'cuentas'] },
      { key: 'client-contacts', label: 'Contactos', href: '/client-contacts', icon: Phone, access: 'auth', keywords: ['personas'] },
      { key: 'contact-requests', label: 'Requests inbound', href: '/contact-requests', icon: Inbox, access: 'auth', keywords: ['solicitudes', 'leads', 'bandeja'] },
    ],
  },
  {
    label: 'Reclutamiento',
    items: [
      { key: 'candidates', label: 'Candidatos', href: '/candidates', icon: Users, access: 'auth', keywords: ['talento'] },
      { key: 'applications', label: 'Aplicaciones', href: '/applications', icon: FileText, access: 'auth', keywords: ['postulaciones', 'etapas'] },
      { key: 'placements', label: 'Placements', href: '/placements', icon: CheckCircle2, access: 'auth', keywords: ['colocaciones', 'cierres'] },
    ],
  },
  {
    label: 'Catálogos',
    items: [
      { key: 'sectors', label: 'Sectores', href: '/sectors', icon: Layers, access: 'admin' },
      { key: 'position-areas', label: 'Áreas', href: '/position-areas', icon: Map, access: 'admin' },
      { key: 'pipeline-stages', label: 'Etapas de pipeline', href: '/pipeline-stages', icon: GitBranch, access: 'admin' },
      { key: 'contact-types', label: 'Tipos de contacto', href: '/contact-types', icon: Tag, access: 'admin' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { key: 'users', label: 'Usuarios', href: '/users', icon: Users, access: 'admin' },
      { key: 'roles', label: 'Roles', href: '/roles', icon: Shield, access: 'admin' },
      { key: 'permissions', label: 'Permisos', href: '/permissions', icon: KeyRound, access: 'admin' },
      { key: 'employees', label: 'Empleados', href: '/employees', icon: IdCard, access: 'admin' },
    ],
  },
]

export function visibleNavGroups(roles: string[]): NavGroup[] {
  const isAdmin = roles.includes('admin')
  const allowed = (a: Access) => a === 'any' || a === 'auth' || (a === 'admin' && isAdmin)
  return navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => allowed(i.access)) }))
    .filter((g) => g.items.length > 0)
}
```

- [ ] **Step 3: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` y `03-api-reference/01-directives/use-client.md` y usa la API vigente de cliente/navegación (`'use client'`, `useRouter`/`usePathname` de `next/navigation`).** Confirma contra la guía que `useRouter` se importa de `next/navigation` (no `next/router`).

- [ ] **Step 4: Crea el provider con el listener global ⌘K en `components/layout/command-palette-provider.tsx`**
```tsx
'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Ctx = { open: boolean; setOpen: (v: boolean) => void }
const CommandPaletteContext = createContext<Ctx | null>(null)

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const value = useMemo(() => ({ open, setOpen }), [open])
  return <CommandPaletteContext.Provider value={value}>{children}</CommandPaletteContext.Provider>
}

export function useCommandPalette(): Ctx {
  const ctx = useContext(CommandPaletteContext)
  if (!ctx) throw new Error('useCommandPalette debe usarse dentro de CommandPaletteProvider')
  return ctx
}
```

- [ ] **Step 5: Crea `components/layout/command-palette.tsx`** (navega a recursos visibles por rol + acción rápida "Nueva oportunidad")
```tsx
'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandShortcut,
} from '@/components/ui/command'
import { visibleNavGroups } from '@/lib/nav/items'
import { useCommandPalette } from './command-palette-provider'

export function CommandPalette({ roles }: { roles: string[] }) {
  const router = useRouter()
  const { open, setOpen } = useCommandPalette()
  const groups = visibleNavGroups(roles)

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Paleta de comandos"
      description="Buscar y navegar"
    >
      <CommandInput placeholder="Buscar recurso o acción…" />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
        <CommandGroup heading="Acciones">
          <CommandItem
            value="nueva oportunidad crear pipeline"
            onSelect={() => go('/opportunities?new=1')}
          >
            <Plus className="mr-2 size-4" aria-hidden />
            Nueva oportunidad
          </CommandItem>
        </CommandGroup>
        {groups.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.map((item) => (
              <CommandItem
                key={item.key}
                value={[item.label, ...(item.keywords ?? [])].join(' ')}
                onSelect={() => go(item.href)}
              >
                <item.icon className="mr-2 size-4" aria-hidden />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandShortcut className="px-2 py-3 text-muted-foreground">⌘K</CommandShortcut>
      </CommandList>
    </CommandDialog>
  )
}
```

- [ ] **Step 6: Monta provider + palette en el shell.** En `app/(app)/layout.tsx` envuelve el contenido con `<CommandPaletteProvider>` y renderiza `<CommandPalette roles={roles} />` (los `roles` vienen del `getMe()` server-side ya usado por la Sidebar). En `components/layout/topbar.tsx` añade el botón disparador:
```tsx
'use client'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCommandPalette } from './command-palette-provider'

export function CommandTrigger() {
  const { setOpen } = useCommandPalette()
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setOpen(true)}
      className="text-muted-foreground gap-2"
      aria-label="Abrir búsqueda (Ctrl o Cmd + K)"
    >
      <Search className="size-4" aria-hidden />
      <span className="hidden sm:inline">Buscar…</span>
      <kbd className="bg-muted text-muted-foreground ml-2 hidden rounded px-1.5 font-mono text-xs sm:inline">
        ⌘K
      </kbd>
    </Button>
  )
}
```

- [ ] **Step 7: Test unitario del filtrado por rol en `test/unit/nav-items.test.ts`**
```ts
import { describe, it, expect } from 'vitest'
import { visibleNavGroups } from '@/lib/nav/items'

describe('visibleNavGroups', () => {
  it('oculta el grupo Admin para usuarios sin rol admin', () => {
    const groups = visibleNavGroups(['auth'])
    expect(groups.find((g) => g.label === 'Admin')).toBeUndefined()
    expect(groups.find((g) => g.label === 'Comercial')).toBeDefined()
  })

  it('muestra catálogos y admin para admin', () => {
    const groups = visibleNavGroups(['admin'])
    expect(groups.find((g) => g.label === 'Admin')).toBeDefined()
    expect(groups.find((g) => g.label === 'Catálogos')).toBeDefined()
  })
})
```

- [ ] **Step 8: Verifica build**
```bash
npm run build
```
Esperado: compila sin errores de tipos; ruta `/(app)` incluida.

- [ ] **Step 9: Commit**
```bash
git add lib/nav/items.ts components/layout/command-palette.tsx components/layout/command-palette-provider.tsx components/layout/topbar.tsx components/ui/command.tsx "app/(app)/layout.tsx" test/unit/nav-items.test.ts
git commit -m "feat(layout): command palette (⌘K) con navegación por rol y acción rápida"
```

---

### Task 8.2: Animaciones, transiciones y skeletons consistentes

**Files:**
- Modify: `app/globals.css` (keyframes/utilidades sobre los tokens; sin hex)
- Create: `components/ui/empty-state.tsx`
- Create: `components/ui/page-transition.tsx`
- Modify: `components/resource/resource-table.tsx` (skeleton/empty consistentes)
- Test: `test/unit/empty-state.test.tsx`

**Interfaces:**
- Produces: `<EmptyState icon, title, description?, action? />` — `export function EmptyState(props: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode })`
- Produces: `<PageTransition>` (envuelve contenido con `view-transition` / animación de entrada)
- Consumes: tokens de `app/globals.css` (`--accent`, `--muted`, `--radius`); animaciones vía clases Tailwind (`animate-in`, `fade-in`, `slide-in-*`) provistas por `tw-animate-css` (flujo shadcn v4).

- [ ] **Step 1: Confirma utilidades de animación de shadcn v4.** shadcn para Tailwind v4 usa `tw-animate-css` (reemplaza `tailwindcss-animate`) importado en `globals.css`. Verifica presencia:
```bash
grep -n "tw-animate-css" app/globals.css || npm i -D tw-animate-css
```
Esperado: import `@import "tw-animate-css";` presente en `globals.css` (lo añade `shadcn init`); si falta, instalar y añadir el import.

- [ ] **Step 2: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` y usa la API vigente** para transiciones de navegación (flag/`unstable_ViewTransition` o `next/view-transitions`, según indique la guía). Si la guía marca la API como experimental/opcional, usa SOLO animaciones CSS de entrada (`animate-in fade-in`) y NO actives el flag — anota esta decisión.

- [ ] **Step 3: Define keyframes de marca en `app/globals.css`** (sobre tokens, cero hex). Añade tras `@theme`:
```css
@keyframes shimmer {
  100% { transform: translateX(100%); }
}

@utility skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background-color: hsl(var(--muted));
}
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    hsl(var(--background) / 0.6),
    transparent
  );
  animation: shimmer 1.5s infinite;
}
```

- [ ] **Step 4: `components/ui/page-transition.tsx`** (entrada suave consistente, client-safe)
```tsx
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out">
      {children}
    </div>
  )
}
```

- [ ] **Step 5: `components/ui/empty-state.tsx`** (estado vacío ilustrado + CTA, accesible)
```tsx
import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div
      role="status"
      className="border-border flex flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed px-6 py-16 text-center"
    >
      <div className="bg-teal-muted text-teal-dark flex size-14 items-center justify-center rounded-full">
        <Icon className="size-7" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-foreground font-display text-base font-semibold">{title}</p>
        {description ? (
          <p className="text-muted-foreground mx-auto max-w-sm text-sm">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
```

- [ ] **Step 6: Usa `EmptyState` y el shimmer en `ResourceTable`.** Reemplaza el bloque "sin datos" por `<EmptyState ... />` (icono/título/CTA derivados de la config del recurso) y el bloque de carga por filas con clase `skeleton-shimmer rounded-[var(--radius)]`. Mantén el contrato existente del componente (no cambies su firma pública).

- [ ] **Step 7: Test de `EmptyState` en `test/unit/empty-state.test.tsx`**
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Inbox } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

describe('EmptyState', () => {
  it('renderiza título, descripción y CTA con role=status', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Sin requests"
        description="No hay solicitudes pendientes."
        action={<button>Crear</button>}
      />,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Sin requests')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 8: Verifica**
```bash
npx vitest run test/unit/empty-state.test.tsx && npm run build
```
Esperado: test verde; build OK.

- [ ] **Step 9: Commit**
```bash
git add app/globals.css components/ui/empty-state.tsx components/ui/page-transition.tsx components/resource/resource-table.tsx test/unit/empty-state.test.tsx
git commit -m "feat(ui): empty states ilustrados, skeleton shimmer y transiciones de página"
```

---

### Task 8.3: Toasts y manejo de errores consistente (sonner)

**Files:**
- Create: `lib/ui/toast.ts`
- Modify: `components/providers.tsx` (defaults del QueryClient: onError global → toast)
- Modify: `app/(app)/layout.tsx` o `components/providers.tsx` (asegurar `<Toaster richColors />` montado una vez)
- Test: `test/unit/toast.test.ts`

**Interfaces:**
- Produces: `export function toastSuccess(message: string): void`
- Produces: `export function toastError(error: unknown, fallback?: string): void` (extrae `error.message` del `Error(message)` que lanza el api-client)
- Produces: `export function getErrorMessage(error: unknown, fallback?: string): string`
- Consumes: `sonner` (`toast`), api-client que lanza `Error(message)` desde el envelope `{ok:false,message}`.

- [ ] **Step 1: Helpers en `lib/ui/toast.ts`**
```ts
import { toast } from 'sonner'

export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return fallback
}

export function toastSuccess(message: string): void {
  toast.success(message)
}

export function toastError(error: unknown, fallback?: string): void {
  toast.error(getErrorMessage(error, fallback))
}
```

- [ ] **Step 2: Centraliza errores de mutación en el QueryClient.** En `components/providers.tsx`, configura defaults para que toda mutación sin `onError` propio muestre toast (DRY), y verifica un único `<Toaster>`:
```tsx
'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { toastError } from '@/lib/ui/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
        mutationCache: new MutationCache({
          onError: (error, _vars, _ctx, mutation) => {
            if (mutation.options.onError) return
            toastError(error)
          },
        }),
      }),
  )

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 3: Test de `getErrorMessage`/`toastError` en `test/unit/toast.test.ts`** (mock de `sonner`)
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const success = vi.fn()
const error = vi.fn()
vi.mock('sonner', () => ({ toast: { success, error } }))

import { getErrorMessage, toastError, toastSuccess } from '@/lib/ui/toast'

describe('toast helpers', () => {
  beforeEach(() => { success.mockClear(); error.mockClear() })

  it('extrae message de un Error', () => {
    expect(getErrorMessage(new Error('Credenciales inválidas'))).toBe('Credenciales inválidas')
  })

  it('usa fallback cuando no hay message', () => {
    expect(getErrorMessage({}, 'Falló')).toBe('Falló')
  })

  it('toastError y toastSuccess llaman a sonner', () => {
    toastError(new Error('boom'))
    toastSuccess('listo')
    expect(error).toHaveBeenCalledWith('boom')
    expect(success).toHaveBeenCalledWith('listo')
  })
})
```

- [ ] **Step 4: Verifica**
```bash
npx vitest run test/unit/toast.test.ts && npm run build
```
Esperado: test verde; build OK.

- [ ] **Step 5: Commit**
```bash
git add lib/ui/toast.ts components/providers.tsx test/unit/toast.test.ts
git commit -m "feat(ui): toasts de éxito/error consistentes y errores globales de mutación"
```

---

### Task 8.4: Optimistic updates en kanban y acciones rápidas

**Files:**
- Modify: `lib/api/hooks.ts` (factory: `useResourceAction` con optimistic + rollback)
- Modify: `components/kanban/use-move-stage.ts` (optimistic move + invalidación)
- Modify: `components/kanban/opportunity-card.tsx` (acciones win/lose/propuesta con toast)
- Test: `test/unit/use-move-stage.test.ts`

**Interfaces:**
- Produces: `export function useMoveStage(): UseMutationResult<Opportunity, Error, { id: string; stageId: string; probability?: number; amount?: number }>` con `onMutate` que reordena las columnas en caché (`['opportunities','list', params]`), `onError` rollback + `toastError`, `onSuccess` `toastSuccess`, `onSettled` invalidate.
- Consumes: `apiClient.opportunities.moveStage(id, body)` (proxy `PATCH /opportunities/:id/stage`), `queryClient`.

- [ ] **Step 1: Lógica pura de movimiento en `components/kanban/move.ts`** (testeable sin red)
```ts
import type { Opportunity } from '@/lib/api/types'

export type Board = Record<string, Opportunity[]> // stageId -> tarjetas

export function moveCard(board: Board, id: string, toStageId: string): Board {
  const next: Board = {}
  let moved: Opportunity | undefined
  for (const [stageId, cards] of Object.entries(board)) {
    const kept = cards.filter((c) => {
      if (c.id === id) { moved = c; return false }
      return true
    })
    next[stageId] = kept
  }
  if (!moved) return board
  next[toStageId] = [{ ...moved, stageId: toStageId }, ...(next[toStageId] ?? [])]
  return next
}
```

- [ ] **Step 2: Hook optimista `components/kanban/use-move-stage.ts`** (usa los helpers de toast de 8.3 y `moveCard`)
```ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Board } from './move'
import { moveCard } from './move'
import { toastSuccess, toastError } from '@/lib/ui/toast'

type Vars = { id: string; toStageId: string; probability?: number; amount?: number }

export function useMoveStage(boardKey: readonly unknown[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: Vars) =>
      apiClient.opportunities.moveStage(v.id, {
        stageId: v.toStageId,
        probability: v.probability,
        amount: v.amount,
      }),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: boardKey })
      const prev = qc.getQueryData<Board>(boardKey)
      if (prev) qc.setQueryData<Board>(boardKey, moveCard(prev, v.id, v.toStageId))
      return { prev }
    },
    onError: (error, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(boardKey, ctx.prev)
      toastError(error)
    },
    onSuccess: () => toastSuccess('Etapa actualizada'),
    onSettled: () => qc.invalidateQueries({ queryKey: boardKey }),
  })
}
```

- [ ] **Step 3: Conecta acciones rápidas** (win/lose/propuesta/seguimiento) en `opportunity-card.tsx` a `apiClient.opportunities.{win,lose,proposal,followUp}` reutilizando `toastSuccess`/`toastError`; deshabilita el botón mientras `isPending` y muestra spinner.

- [ ] **Step 4: Test de `moveCard` + optimistic en `test/unit/use-move-stage.test.ts`**
```ts
import { describe, it, expect } from 'vitest'
import { moveCard, type Board } from '@/components/kanban/move'

const board: Board = {
  s1: [{ id: 'a', stageId: 's1' } as any, { id: 'b', stageId: 's1' } as any],
  s2: [],
}

describe('moveCard', () => {
  it('mueve la tarjeta a la nueva etapa y actualiza stageId', () => {
    const next = moveCard(board, 'a', 's2')
    expect(next.s1.map((c) => c.id)).toEqual(['b'])
    expect(next.s2[0]).toMatchObject({ id: 'a', stageId: 's2' })
  })

  it('no muta el board original (rollback seguro)', () => {
    moveCard(board, 'a', 's2')
    expect(board.s1.map((c) => c.id)).toEqual(['a', 'b'])
  })

  it('devuelve el mismo board si el id no existe', () => {
    expect(moveCard(board, 'zzz', 's2')).toBe(board)
  })
})
```

- [ ] **Step 5: Verifica**
```bash
npx vitest run test/unit/use-move-stage.test.ts && npm run build
```
Esperado: tests verdes; build OK.

- [ ] **Step 6: Commit**
```bash
git add lib/api/hooks.ts components/kanban/move.ts components/kanban/use-move-stage.ts components/kanban/opportunity-card.tsx test/unit/use-move-stage.test.ts
git commit -m "feat(kanban): optimistic update con rollback al mover etapa y en acciones rápidas"
```

---

### Task 8.5: Pase de accesibilidad (foco, labels, ARIA, kanban)

**Files:**
- Modify: `components/resource/resource-form.tsx` (FormLabel asociado, `aria-invalid`, `aria-describedby` para errores)
- Modify: `components/kanban/board.tsx` (roles ARIA + soporte teclado para mover tarjetas)
- Modify: `app/globals.css` (foco visible consistente con `--ring`)
- Modify: `components/layout/sidebar.tsx` (skip-link + `aria-current`)
- Test: `test/unit/resource-form-a11y.test.tsx`

**Interfaces:**
- Consumes: shadcn/Radix `Form`, `FormField`, `FormLabel`, `FormMessage` (ya proveen wiring ARIA); este task verifica/cierra brechas (kanban DnD, skip-link, focus ring).
- Produces: utilidades `aria-current="page"` en nav activa; `role="list"/"listitem"` y `aria-roledescription` en columnas/tarjetas del kanban; botones de mover por teclado (`aria-keyshortcuts`).

- [ ] **Step 1: Foco visible global en `app/globals.css`** (usa el token `--ring`, sin hex)
```css
@layer base {
  :focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }
}
```

- [ ] **Step 2: Skip-link + `aria-current` en el shell.** Añade al inicio de `app/(app)/layout.tsx` un enlace "Saltar al contenido" que apunta a `#contenido-principal` (el `<main id="contenido-principal" tabIndex={-1}>`), visible solo al enfocar (`sr-only focus:not-sr-only`). En `sidebar.tsx` marca el item activo con `aria-current={isActive ? 'page' : undefined}` usando `usePathname()`.

- [ ] **Step 3: ARIA + teclado en el kanban (`board.tsx`).** Cada columna `role="list"` con `aria-label="Etapa: {nombre}"`; cada tarjeta `role="listitem"` enfocable (`tabIndex={0}`) con `aria-roledescription="tarjeta de oportunidad"`. Añade handler de teclado: con foco en una tarjeta, `Alt+ArrowRight/ArrowLeft` invoca `useMoveStage` a la etapa adyacente (alternativa accesible al drag and drop); anuncia el resultado vía `toastSuccess` (ya lo hace el hook). Documenta el atajo con `aria-keyshortcuts="Alt+ArrowRight Alt+ArrowLeft"`.

- [ ] **Step 4: Errores de formulario accesibles.** En `resource-form.tsx` confirma que cada campo usa `FormControl` (que enlaza `aria-describedby`/`aria-invalid` de Radix) y que `FormMessage` rinde el error de Zod; añade `aria-required` en campos requeridos del schema.

- [ ] **Step 5: Test a11y de formulario en `test/unit/resource-form-a11y.test.tsx`**
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { ResourceForm } from '@/components/resource/resource-form'

const schema = z.object({ name: z.string().min(1, 'Requerido') })

describe('ResourceForm a11y', () => {
  it('asocia el error al input vía aria-invalid al enviar vacío', async () => {
    render(
      <ResourceForm
        schema={schema}
        fields={[{ name: 'name', label: 'Nombre', type: 'text' }]}
        defaultValues={{ name: '' }}
        onSubmit={async () => {}}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    const input = screen.getByLabelText('Nombre')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(await screen.findByText('Requerido')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Verifica**
```bash
npx vitest run test/unit/resource-form-a11y.test.tsx && npm run build
```
Esperado: test verde; build OK.

- [ ] **Step 7: Commit**
```bash
git add app/globals.css "app/(app)/layout.tsx" components/layout/sidebar.tsx components/kanban/board.tsx components/resource/resource-form.tsx test/unit/resource-form-a11y.test.tsx
git commit -m "feat(a11y): foco visible, skip-link, aria-current, kanban por teclado y errores accesibles"
```

---

### Task 8.6: Setup de Playwright (Next 16) con mock backend determinista

**Files:**
- Create: `playwright.config.ts`
- Create: `test/e2e/mock-backend.mjs` (servidor HTTP que emula el contrato del backend SIR)
- Create: `test/e2e/fixtures.ts` (helpers de login e2e)
- Modify: `package.json` (scripts `test:e2e`, `test:e2e:ui`)
- Modify: `.gitignore` (`/test-results`, `/playwright-report`, `/.playwright`)

**Interfaces:**
- Produces: `webServer` que arranca (1) el mock backend en `PORT_MOCK` y (2) `next dev` con `SIR_API_URL=http://localhost:<PORT_MOCK>/api`, de modo que el BFF/proxy llama al mock determinista.
- Consumes: contrato del backend (envelope `{ok,message,data}`, `/auth/login`, `/auth/me`, paginados `{items,total,page,limit}`, `/opportunities`, `/pipeline-stages`, `/metrics/*`, `/contact-requests`).

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md` y usa el patrón vigente** (la guía recomienda correr contra build de producción y/o usar `webServer` de Playwright). Decisión: en CI usar `npm run build` + `npm run start`; en local `webServer` levanta `next dev`. Anota: como el proxy llama al backend server-side, NO se puede interceptar con `page.route`; por eso se usa un mock backend real apuntado por `SIR_API_URL`.

- [ ] **Step 2: Instala Playwright**
```bash
npm init playwright@latest -- --quiet --browser=chromium --no-examples
```
Esperado: añade `@playwright/test` a devDependencies y crea config base; instala Chromium. Reemplazaremos la config en el Step 4.

- [ ] **Step 3: Mock backend determinista en `test/e2e/mock-backend.mjs`** (Node `http`, sin deps; emula login + me + stages + opportunities + metrics + requests)
```js
import { createServer } from 'node:http'

const PORT = Number(process.env.PORT_MOCK ?? 4010)
const ok = (data, message = 'OK') => JSON.stringify({ ok: true, message, data })
const fail = (message, path) => JSON.stringify({ ok: false, message, path })

const stages = [
  { id: 's1', name: 'Prospecto', order: 1, active: true },
  { id: 's2', name: 'Propuesta', order: 2, active: true },
  { id: 's3', name: 'Ganada', order: 3, active: true },
]
let opportunities = [
  { id: 'o1', title: 'Staffing Banco X', stageId: 's1', amount: 50000, probability: 30, status: 'open', clientId: 'c1' },
]
const me = {
  id: 'u1', username: 'admin', roles: ['admin'],
  employee: { id: 'e1', firstName: 'Ana', lastName: 'López' },
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(body)
}

async function readJson(req) {
  const chunks = []
  for await (const c of req) chunks.push(c)
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const p = url.pathname.replace(/^\/api/, '')
  const auth = req.headers.authorization ?? ''

  if (req.method === 'POST' && p === '/auth/login') {
    const body = await readJson(req)
    if (body.username === 'admin' && body.password === 'secret') {
      return send(res, 200, ok({ accessToken: 'access-1', refreshToken: 'refresh-1' }, 'Bienvenido'))
    }
    return send(res, 401, fail('Credenciales inválidas', p))
  }
  if (req.method === 'POST' && p === '/auth/refresh') {
    return send(res, 200, ok({ accessToken: 'access-2', refreshToken: 'refresh-2' }))
  }
  if (req.method === 'POST' && p === '/auth/logout') return send(res, 200, ok(null))

  if (!auth.startsWith('Bearer ')) return send(res, 401, fail('No autorizado', p))

  if (req.method === 'GET' && p === '/auth/me') return send(res, 200, ok(me))
  if (req.method === 'GET' && p === '/pipeline-stages') {
    return send(res, 200, ok({ items: stages, total: stages.length, page: 1, limit: 50 }))
  }
  if (req.method === 'GET' && p === '/opportunities') {
    return send(res, 200, ok({ items: opportunities, total: opportunities.length, page: 1, limit: 50 }))
  }
  if (req.method === 'POST' && p === '/opportunities') {
    const body = await readJson(req)
    const created = { id: `o${opportunities.length + 1}`, status: 'open', ...body }
    opportunities = [created, ...opportunities]
    return send(res, 201, ok(created, 'Oportunidad creada'))
  }
  const stageMatch = p.match(/^\/opportunities\/([^/]+)\/stage$/)
  if (req.method === 'PATCH' && stageMatch) {
    const body = await readJson(req)
    opportunities = opportunities.map((o) =>
      o.id === stageMatch[1] ? { ...o, stageId: body.stageId, probability: body.probability ?? o.probability } : o,
    )
    return send(res, 200, ok(opportunities.find((o) => o.id === stageMatch[1])))
  }
  if (req.method === 'GET' && p.startsWith('/metrics/')) {
    return send(res, 200, ok({
      overview: { totalOpportunities: opportunities.length, wonAmount: 0, conversion: 0.25, proposalsSent: 1 },
      byStage: stages.map((s) => ({ stage: s.name, count: 1 })),
    }))
  }
  if (req.method === 'GET' && p === '/contact-requests') {
    const handled = url.searchParams.get('wasHandled')
    const items = [{ id: 'r1', companyName: 'Lead SA', wasHandled: handled === 'true' }]
    return send(res, 200, ok({ items, total: items.length, page: 1, limit: 50 }))
  }
  const handleMatch = p.match(/^\/contact-requests\/([^/]+)\/handle$/)
  if (req.method === 'PATCH' && handleMatch) {
    return send(res, 200, ok({ id: handleMatch[1], wasHandled: true }))
  }
  return send(res, 404, fail('No encontrado', p))
})

server.listen(PORT, () => console.log(`[mock-backend] http://localhost:${PORT}`))
```

- [ ] **Step 4: `playwright.config.ts`** (dos `webServer`: mock + next; `SIR_API_URL` apunta al mock)
```ts
import { defineConfig, devices } from '@playwright/test'

const MOCK_PORT = 4010
const APP_PORT = 3100

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${APP_PORT}`, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: `node test/e2e/mock-backend.mjs`,
      port: MOCK_PORT,
      env: { PORT_MOCK: String(MOCK_PORT) },
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
    },
    {
      command: `npm run dev -- --port ${APP_PORT}`,
      port: APP_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        SIR_API_URL: `http://localhost:${MOCK_PORT}/api`,
        NODE_ENV: 'test',
      },
    },
  ],
})
```

- [ ] **Step 5: Fixture de login en `test/e2e/fixtures.ts`** (reutilizable en los specs)
```ts
import { test as base, expect, type Page } from '@playwright/test'

export async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Usuario').fill('admin')
  await page.getByLabel('Contraseña').fill('secret')
  await page.getByRole('button', { name: /iniciar sesión/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

export const test = base.extend<{ authed: Page }>({
  authed: async ({ page }, use) => {
    await login(page)
    await use(page)
  },
})

export { expect }
```

- [ ] **Step 6: Scripts en `package.json`**
```bash
npm pkg set scripts.test:e2e="playwright test"
npm pkg set scripts.test:e2e:ui="playwright test --ui"
```
Esperado: scripts añadidos.

- [ ] **Step 7: Ignora artefactos**
```bash
printf '\n/test-results\n/playwright-report\n/.playwright\n' >> .gitignore
```

- [ ] **Step 8: Smoke del setup**
```bash
node test/e2e/mock-backend.mjs &
sleep 1 && curl -s -X POST localhost:4010/api/auth/login -H 'content-type: application/json' -d '{"username":"admin","password":"secret"}'; kill %1
```
Esperado: imprime `{"ok":true,...,"data":{"accessToken":"access-1",...}}`.

- [ ] **Step 9: Commit**
```bash
git add playwright.config.ts test/e2e/mock-backend.mjs test/e2e/fixtures.ts package.json .gitignore
git commit -m "test(e2e): setup Playwright (Next 16) con mock backend determinista vía SIR_API_URL"
```

---

### Task 8.7: e2e — login BFF con cookies httpOnly

**Files:**
- Create: `test/e2e/auth-login.spec.ts`

**Interfaces:**
- Consumes: ruta `/login`, route handlers `app/api/auth/login`, middleware de protección, `getMe()` server-side; mock backend de 8.6.

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md` y `02-guides/authentication.md`** para confirmar nombres/flags de cookie (`sir_access`, `sir_refresh`, httpOnly) y el patrón de protección vigente, de modo que las aserciones del test coincidan con la implementación real (no asumir de memoria).

- [ ] **Step 2: Spec `test/e2e/auth-login.spec.ts`** (cookies httpOnly, redirect de ruta protegida, credenciales inválidas)
```ts
import { test, expect, login } from './fixtures'

test('redirige a /login al visitar ruta protegida sin sesión', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})

test('login exitoso setea cookies httpOnly y entra al dashboard', async ({ page, context }) => {
  await login(page)
  const cookies = await context.cookies()
  const access = cookies.find((c) => c.name === 'sir_access')
  const refresh = cookies.find((c) => c.name === 'sir_refresh')
  expect(access?.httpOnly).toBe(true)
  expect(refresh?.httpOnly).toBe(true)
  // los tokens NO deben ser legibles por JS
  const fromJs = await page.evaluate(() => document.cookie)
  expect(fromJs).not.toContain('sir_access')
})

test('credenciales inválidas muestran toast de error y no navega', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Usuario').fill('admin')
  await page.getByLabel('Contraseña').fill('wrong')
  await page.getByRole('button', { name: /iniciar sesión/i }).click()
  await expect(page.getByText(/credenciales inválidas/i)).toBeVisible()
  await expect(page).toHaveURL(/\/login/)
})
```

- [ ] **Step 3: Ejecuta**
```bash
npm run test:e2e -- auth-login
```
Esperado: 3 tests passed (Playwright levanta mock + next vía `webServer`).

- [ ] **Step 4: Commit**
```bash
git add test/e2e/auth-login.spec.ts
git commit -m "test(e2e): login BFF — cookies httpOnly y protección de rutas"
```

---

### Task 8.8: e2e — crear oportunidad y mover etapa (optimistic) en el kanban

**Files:**
- Create: `test/e2e/opportunities.spec.ts`

**Interfaces:**
- Consumes: `/opportunities` (kanban), command palette acción "Nueva oportunidad" (`?new=1` de 8.1), `useMoveStage` optimista (8.4), mock backend (`POST /opportunities`, `PATCH /opportunities/:id/stage`).

- [ ] **Step 1: Spec `test/e2e/opportunities.spec.ts`**
```ts
import { test, expect } from './fixtures'

test('abre el command palette con ⌘K y crea una oportunidad', async ({ authed: page }) => {
  await page.goto('/opportunities')
  await page.keyboard.press('ControlOrMeta+KeyK')
  await page.getByPlaceholder('Buscar recurso o acción…').fill('nueva')
  await page.getByRole('option', { name: /nueva oportunidad/i }).click()

  await page.getByLabel('Título').fill('Staffing Retail Y')
  await page.getByLabel(/monto/i).fill('75000')
  await page.getByRole('button', { name: /guardar/i }).click()

  await expect(page.getByText('Oportunidad creada')).toBeVisible()
  await expect(page.getByText('Staffing Retail Y')).toBeVisible()
})

test('mover etapa por teclado actualiza la tarjeta de forma optimista', async ({ authed: page }) => {
  await page.goto('/opportunities')
  const card = page.getByRole('listitem').filter({ hasText: 'Staffing Banco X' })
  await card.focus()
  // atajo accesible definido en 8.5: Alt+ArrowRight mueve a la etapa siguiente
  await page.keyboard.press('Alt+ArrowRight')

  // la columna "Propuesta" debe contener la tarjeta inmediatamente (optimistic)
  const propuesta = page.getByRole('list', { name: /etapa: propuesta/i })
  await expect(propuesta.getByText('Staffing Banco X')).toBeVisible()
  await expect(page.getByText('Etapa actualizada')).toBeVisible()
})
```

- [ ] **Step 2: Ejecuta**
```bash
npm run test:e2e -- opportunities
```
Esperado: 2 tests passed.

- [ ] **Step 3: Commit**
```bash
git add test/e2e/opportunities.spec.ts
git commit -m "test(e2e): crear oportunidad vía ⌘K y mover etapa optimista en kanban"
```

---

### Task 8.9: e2e — dashboard con filtros e inbox de requests

**Files:**
- Create: `test/e2e/dashboard.spec.ts`
- Create: `test/e2e/inbox-requests.spec.ts`

**Interfaces:**
- Consumes: `/dashboard` (barra de filtros que recalcula vía `/metrics/*`), `/contact-requests` (inbox, `?wasHandled`, `PATCH /:id/handle`), mock backend de 8.6.

- [ ] **Step 1: Spec dashboard `test/e2e/dashboard.spec.ts`** (filtro recalcula y dispara nueva petición a métricas)
```ts
import { test, expect } from './fixtures'

test('el dashboard muestra KPIs y recalcula al cambiar el filtro de fecha', async ({ authed: page }) => {
  await page.goto('/dashboard')
  await expect(page.getByText(/total oportunidades/i)).toBeVisible()

  const metricsReq = page.waitForRequest((r) => r.url().includes('/metrics/') && r.url().includes('from='))
  await page.getByRole('button', { name: /rango de fecha/i }).click()
  await page.getByRole('option', { name: /últimos 30 días/i }).click()
  await metricsReq

  // skeleton desaparece y vuelven los KPIs
  await expect(page.getByText(/conversión/i)).toBeVisible()
})
```

- [ ] **Step 2: Spec inbox `test/e2e/inbox-requests.spec.ts`** (atender request)
```ts
import { test, expect } from './fixtures'

test('atiende una request inbound y desaparece de pendientes', async ({ authed: page }) => {
  await page.goto('/contact-requests')
  const row = page.getByRole('row').filter({ hasText: 'Lead SA' })
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: /atender/i }).click()

  await expect(page.getByText(/request atendida/i)).toBeVisible()
})
```

- [ ] **Step 3: Ejecuta toda la suite e2e**
```bash
npm run test:e2e
```
Esperado: todos los specs (auth-login, opportunities, dashboard, inbox-requests) passed.

- [ ] **Step 4: Commit**
```bash
git add test/e2e/dashboard.spec.ts test/e2e/inbox-requests.spec.ts
git commit -m "test(e2e): dashboard con filtros que recalculan e inbox atender request"
```

---

### Task 8.10: (Opcional) Toggle de dark-mode sobre los tokens

**Files:**
- Modify: `app/globals.css` (bloque `.dark { ... }` con los tokens invertidos de marca)
- Create: `components/layout/theme-toggle.tsx`
- Modify: `components/providers.tsx` (envolver con `ThemeProvider` de `next-themes`)
- Modify: `app/layout.tsx` (`suppressHydrationWarning` en `<html>` para evitar flash)
- Modify: `components/layout/topbar.tsx` (montar `<ThemeToggle />`)

**Interfaces:**
- Produces: `<ThemeToggle />` (botón claro/oscuro/sistema, accesible).
- Consumes: `next-themes` (`ThemeProvider`, `useTheme`), tokens HSL ya definidos (solo se añade la variante `.dark`, cero hex nuevos).

- [ ] **Step 1: Lee `/home/plemus/WebstormProjects/sir-crm/node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md` y `01-getting-started/03-layouts-and-pages.md`** para aplicar el patrón vigente de tema sin flash (atributo en `<html>` + `suppressHydrationWarning`), según la guía y no de memoria.

- [ ] **Step 2: Instala next-themes**
```bash
npm i next-themes
```
Esperado: añadido a dependencies, compatible con React 19.

- [ ] **Step 3: Variante `.dark` en `app/globals.css`** (tokens de marca en oscuro; navy como fondo, teal como acento)
```css
.dark {
  --background: 222 47% 11%;       --foreground: 0 0% 100%;
  --card: 222 47% 14%;             --card-foreground: 0 0% 100%;
  --popover: 222 47% 14%;          --popover-foreground: 0 0% 100%;
  --primary: 181 26% 72%;          --primary-foreground: 222 47% 11%;
  --secondary: 222 30% 20%;        --secondary-foreground: 0 0% 100%;
  --muted: 222 30% 18%;            --muted-foreground: 220 15% 70%;
  --accent: 181 25% 47%;           --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;        --destructive-foreground: 0 0% 100%;
  --border: 222 30% 22%;           --input: 222 30% 22%;   --ring: 181 26% 72%;
}
```

- [ ] **Step 4: `ThemeProvider` en `components/providers.tsx`** (envolviendo el `QueryClientProvider`, `attribute="class"`, `defaultTheme="light"`, `enableSystem`).

- [ ] **Step 5: `components/layout/theme-toggle.tsx`** (accesible)
```tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Sun className="size-4 dark:hidden" aria-hidden />
      <Moon className="hidden size-4 dark:block" aria-hidden />
    </Button>
  )
}
```

- [ ] **Step 6: Evita flash en `app/layout.tsx`** añadiendo `suppressHydrationWarning` al `<html lang="es">` y monta `<ThemeToggle />` en el Topbar.

- [ ] **Step 7: Verifica**
```bash
npm run build
```
Esperado: compila; el toggle alterna `.dark` sin hex nuevos en componentes.

- [ ] **Step 8: Commit**
```bash
git add app/globals.css components/layout/theme-toggle.tsx components/providers.tsx app/layout.tsx components/layout/topbar.tsx package.json package-lock.json
git commit -m "feat(ui): toggle de dark-mode sobre los tokens de marca sin flash"
```
