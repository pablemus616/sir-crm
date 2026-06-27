# SIR CRM — Frontend (Next.js) — Diseño

Fecha: 2026-06-27
Estado: aprobado para planificación
Proyecto: `/home/plemus/WebstormProjects/sir-crm` (origin: github.com/pablemus616/sir-crm)

## 1. Contexto y objetivo

Frontend web del CRM de **Sir Talent CA** (outsourcing/staffing de RRHH en Centroamérica) que consume el backend NestJS ya construido (`sir-api`). Es un **CRM completo**: pantallas para los ~18 recursos del backend (auth/usuarios/roles/permisos/empleados, sectores/áreas/etapas/tipos-de-contacto, clientes/contactos, historial y requests de contacto, oportunidades, candidatos/aplicaciones/placements) y, como **pieza central**, el **dashboard de métricas/comercial**. Prioridad explícita del usuario: **lo más interactivo y user-friendly posible** (la skill `frontend-design` guía la implementación).

Marca: paleta tomada de la landing https://www.sir.com.gt/ — que ya usa un sistema de tokens HSL estilo shadcn/ui (navy + teal). Se define **una sola vez** como tokens y se consume vía Tailwind (sin repetir hex).

## 2. Decisiones de diseño (cerradas)

1. **Alcance v1: CRM completo** — pantalla para cada recurso (CRUD) + dashboard. Implementación faseada (§17).
2. **Auth: BFF con cookies httpOnly** — Route Handlers de Next como proxy al backend; access+refresh viven en cookies httpOnly (no accesibles a JS). El backend es JWT Bearer; el BFF adjunta el token y refresca ante 401.
3. **UI: shadcn/ui + Tailwind v4** — la landing ya usa los tokens de shadcn; se replican exactos para consistencia total de marca.
4. **Datos:** TanStack Query (server-state). **Tablas:** TanStack Table. **Forms:** React Hook Form + **Zod**. **Gráficas:** shadcn Charts (Recharts). **Command palette:** cmdk.
5. **Idioma:** UI en español. **Tema:** claro en v1 (dark-mode v2; los tokens ya lo permiten).
6. **Patrón config-driven** para los 18 recursos (ResourceTable/Form/Detail) — clave para que "CRM completo" sea tratable y consistente.

## 3. Stack y proyecto existente

- **Next.js 16.2.9 (App Router) · React 19.2.4 · Tailwind v4 · TypeScript 5 · gestor npm.** Repo ya inicializado (template default de create-next-app, 1 commit), origin `sir-crm`.
- Se **construye sobre el template** existente: se reemplazan las fuentes Geist por **Poppins + Inter** y los tokens default por los de marca SIR; `app/layout.tsx` pasa a `lang="es"`, metadata SIR, providers (TanStack Query) y app shell.
- **shadcn/ui se inicializa** (`npx shadcn@latest init`) para Tailwind v4 / Next 16 / React 19, y luego se sustituyen sus tokens default por los de SIR.

## 4. Regla dura del proyecto — Next 16 es "NOT the Next.js you know"

Por `CLAUDE.md → AGENTS.md`: **antes de escribir cualquier código Next, leer la guía relevante en `node_modules/next/dist/docs/` (sobre todo `01-app/`).** Next 16 tiene breaking changes vs. el conocimiento de entrenamiento. Toda tarea de implementación que toque APIs de Next (route handlers, middleware, server components, `cookies()`/headers, `next/font`, metadata, params async, caching/`fetch`, etc.) **consulta primero los docs bundled** y respeta deprecaciones. Esto es un **constraint global** del plan, no opcional.

## 5. Marca / design tokens (definidos una vez)

Tokens HSL exactos de la landing (en `app/globals.css`), expuestos a Tailwind v4 vía `@theme inline` y consumidos como `bg-primary`, `text-accent`, `border`, `ring`, etc. **Cero hex repetidos en componentes.**

```
:root {
  --background: 0 0% 100%;          --foreground: 222 47% 11%;
  --card: 0 0% 100%;                --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;             --popover-foreground: 222 47% 11%;
  --primary: 222 47% 20%;           --primary-foreground: 0 0% 100%;     /* navy */
  --secondary: 220 20% 96%;         --secondary-foreground: 222 47% 11%;
  --muted: 220 15% 95%;             --muted-foreground: 220 10% 45%;
  --accent: 181 25% 47%;            --accent-foreground: 0 0% 100%;      /* teal */
  --destructive: 0 84% 60%;         --destructive-foreground: 0 0% 100%;
  --border: 220 15% 90%;            --input: 220 15% 90%;   --ring: 222 47% 20%;
  --radius: 0.75rem;
  /* extras de marca */
  --navy: 222 47% 20%; --navy-dark: 222 47% 11%; --navy-light: 222 30% 35%;
  --teal: 181 25% 47%; --teal-dark: 181 30% 35%; --teal-light: 181 26% 72%; --teal-muted: 181 20% 85%;
}
```

`@theme inline { --color-primary: hsl(var(--primary)); --color-accent: hsl(var(--accent)); ... --color-teal: hsl(var(--teal)); ... }` (sintaxis Tailwind v4 — confirmar contra los docs/shadcn v4). Fuentes: **Poppins** (display/títulos) + **Inter** (cuerpo) vía `next/font/google` (variables `--font-display` / `--font-sans`). theme-color del documento: `#14b8a6`.

## 6. Backend que consume (contrato)

- Base URL del backend vía env server-side (`SIR_API_URL`, p.ej. `http://localhost:3000/api`). Prefijo `/api`.
- **Envelope de respuesta:** todo viene como `{ ok: boolean, message: string, data: T }` (éxito) o `{ ok:false, message, path }` (error). Un **API client tipado desenvuelve `data`** y lanza con `message` en error.
- **Listas paginadas:** `{ items, total, page, limit }` (offset; query `?page&limit&...filtros`).
- **Auth:** `POST /auth/login {username,password}` → `{accessToken, refreshToken}`; `POST /auth/refresh {refreshToken}` → rota y devuelve nuevos; `POST /auth/logout`; `GET /auth/me` → usuario+roles+empleado; `GET/DELETE /auth/sessions`.
- **Recursos (acceso):** admin → users, roles, permissions, employees, sectors, position-areas, pipeline-stages, contact-types, metrics. auth → clients, client-contacts, contact-history, contact-requests(`PATCH /:id/handle`), opportunities (+`/stage /proposal /follow-up /win /lose`), candidates, applications(`/stage`), placements. Público (no en el CRM): `POST /contact-requests` (API key).
- **Métricas:** `GET /metrics/{overview,commercial,pipeline,contacts,requests,recruitment/funnel,placements}` y `/metrics/charts/{by-client,by-sector,by-area}`, con filtros comunes (`from,to,sectorId,areaId,clientId,responsibleEmployeeId,recruiterId,stageId,status`).

## 7. Arquitectura BFF (auth con cookies httpOnly)

- **Route Handlers** en `app/api/auth/*` (login/refresh/logout) y un **proxy** `app/api/proxy/[...path]` (o helper `serverFetch`) hacia el backend:
  - `login`: llama a `POST {SIR_API_URL}/auth/login`; guarda `accessToken`/`refreshToken` en cookies **httpOnly, Secure, SameSite=Lax** (`sir_access`, `sir_refresh`); responde sin exponer tokens.
  - **proxy/serverFetch**: lee `sir_access` de la cookie, llama al backend con `Authorization: Bearer`; ante **401**, llama a `/auth/refresh` con `sir_refresh`, **rota** ambas cookies y reintenta una vez; si el refresh falla, limpia cookies → 401 (el cliente redirige a `/login`).
  - `logout`: `POST /auth/logout` al backend + borra cookies.
- **Middleware** (`middleware.ts`): protege `/(app)/*` (sin `sir_access`/`sir_refresh` válido → redirect `/login`); deja pasar `/login` y assets. (Confirmar matcher/API de middleware contra docs Next 16.)
- **Server Components** obtienen datos llamando al proxy/serverFetch (con las cookies del request). **Mutaciones y listas interactivas** desde el cliente con **TanStack Query** apuntando a los route handlers/proxy (mismo origen → cookies se envían solas). Roles de `/auth/me` controlan visibilidad de nav y acciones (admin vs auth).

## 8. App shell (layout y navegación)

- Grupo de rutas `app/(app)/...` con layout de **sidebar + topbar**; `app/(auth)/login` aparte.
- **Sidebar** agrupada y filtrada por rol: **Dashboard** · **Comercial** (Oportunidades, Clientes, Contactos, Requests inbound) · **Reclutamiento** (Candidatos, Aplicaciones, Placements) · **Catálogos** (Sectores, Áreas, Etapas de pipeline, Tipos de contacto) · **Admin** (Usuarios, Roles, Permisos, Empleados).
- **Topbar:** breadcrumbs, **command palette (⌘K)** para saltar a recursos/acciones, menú de usuario (perfil, sesiones, logout). Responsive (sidebar colapsable).

## 9. Patrón reutilizable de recurso (config-driven — DRY para 18 recursos)

- **`ResourceTable<T>`** (TanStack Table + DataTable de shadcn): paginación offset, búsqueda, filtros por columna, orden, acciones por fila (ver/editar/borrar). Estados loading (skeleton) / empty / error.
- **`ResourceForm<T>`** (RHF + Zod en sheet/dialog): create/update; los esquemas Zod **espejan los DTOs** del backend.
- **`ResourceDetail<T>`** (drawer): vista de detalle + relaciones.
- **`createResource(config)`**: cada recurso declara `{ key, label, columns, formSchema, formFields, endpoints, access }`; de ahí se generan tabla/form/detail. Casos especiales (oportunidades kanban, dashboard, inbox) se construyen a mano sobre los mismos hooks/api-client.
- **API client tipado** (`lib/api`): funciones por recurso que llaman al proxy, desenvuelven `{ok,message,data}`, tipan `T` y `Paginated<T>`, y exponen hooks de TanStack Query (`useList`, `useOne`, `useCreate`, `useUpdate`, `useRemove`, + acciones).

## 10. Pantallas destacadas (interactivas — prioridad del usuario)

- **Dashboard (pieza central):** KPI cards (total oportunidades, ventas ganadas, **conversión %**, **Quetzales ganados**, valor ponderado/forecast, propuestas enviadas) + gráficas (funnel/pipeline por etapa, **charts by-client/by-sector/by-area**, contactos, funnel de reclutamiento, placements) usando shadcn Charts (Recharts). **Barra de filtros comunes** (rango de fecha, sector, área, cliente, responsable, etapa, estado) que **recalcula** todo. Skeletons + transiciones suaves.
- **Oportunidades = tablero Kanban:** columnas = `pipeline_stages`; **tarjetas arrastrables** entre etapas → `PATCH /opportunities/:id/stage` (con probabilidad/monto) con **optimistic update** + rollback; acciones rápidas win/lose/propuesta/seguimiento; chips de monto (Q), probabilidad, próximo seguimiento; **toggle a vista tabla** (ResourceTable) + filtros (cliente/sector/área/etapa/estado/responsable/seguimiento-vencido).
- **Reclutamiento:** candidato → **aplicaciones** (máquina de etapas visual: applied→…→hired / rejected/withdrawn) → **placement** (cierre = venta). 
- **Inbox de requests inbound:** lista filtrable (`?wasHandled`), acción **atender** (`PATCH /:id/handle`) y convertir a cliente.

## 11. Estados, errores, accesibilidad, i18n

- Errores del backend (`message`) → **toasts** (sonner). Loading → **skeletons**; **empty states** ilustrados; **optimistic updates** en kanban/acciones rápidas. Accesibilidad vía Radix (shadcn). Formato de **Quetzales** (GTQ) y fechas con `Intl` (locale `es-GT`). UI íntegramente en español.

## 12. Testing

- **Unit/componente:** Vitest + Testing Library para los patrones reutilizables (ResourceTable/Form, api-client/unwrap, hooks) y utilidades (formato Q/fechas, esquemas Zod).
- **e2e:** Playwright para flujos críticos: login (BFF/cookies), crear oportunidad, mover etapa en el kanban, ver dashboard con filtros. (Confirmar setup de test runner contra Next 16.)

## 13. Estructura de carpetas (App Router)

```
app/
  layout.tsx · globals.css                  (tokens marca + fonts + providers)
  (auth)/login/page.tsx
  (app)/layout.tsx                          (sidebar + topbar)
    dashboard/page.tsx
    opportunities/(kanban|table)/...
    clients/ client-contacts/ contact-history/ contact-requests/
    candidates/ applications/ placements/
    sectors/ position-areas/ pipeline-stages/ contact-types/
    users/ roles/ permissions/ employees/
  api/auth/{login,refresh,logout}/route.ts
  api/proxy/[...path]/route.ts
middleware.ts
components/  ui/ (shadcn)  ·  resource/ (ResourceTable/Form/Detail)  ·  dashboard/  ·  kanban/  ·  layout/
lib/  api/ (client tipado + hooks)  ·  auth/ (cookies/refresh helpers)  ·  format/  ·  resources/ (configs)
```

## 14. Variables de entorno

- `SIR_API_URL` (server-side; base del backend, p.ej. `http://localhost:3000/api`).
- `NODE_ENV` (cookies `Secure` en production).
- (Sin secretos del backend en el frontend; los tokens del usuario viven en cookies httpOnly emitidas por el BFF.) Documentar en `.env.example`.

## 15. Riesgos y verificaciones

- **Next 16 breaking changes (riesgo principal):** APIs/convenciones difieren del conocimiento previo → **leer `node_modules/next/dist/docs/01-app/` por tarea** (route handlers, middleware, `cookies()`, params async, `next/font`, metadata, caching). Verificar con `npm run dev`/`build` tras cada hito.
- **Tailwind v4 + shadcn:** config CSS-first (`@theme`, sin `tailwind.config.js`); usar el flujo shadcn para v4 y confirmar el mapeo de tokens HSL.
- **React 19 + libs:** confirmar compatibilidad de TanStack Query/Table, RHF, Recharts, cmdk con React 19 / Next 16 (versiones recientes lo soportan; fijar versiones que compilen).
- **CORS/cookies:** al ser same-origin (BFF), no hay CORS; las cookies httpOnly se envían solas a los route handlers. El backend nunca recibe cookies (recibe Bearer del proxy).

## 16. Fuera de alcance / v2

- Dark mode (los tokens ya lo soportan; togglear después). Realtime/websockets. App móvil. SSR-cache avanzado / streaming fino. Tabla de versiones de propuesta, multi-puesto (alineado con el v2 del backend).

## 17. Fases de implementación

1. **Cimientos:** limpiar template; instalar Tailwind v4 OK + **shadcn init** + tokens de marca SIR + Poppins/Inter; providers (TanStack Query); `.env.example`; verificar `npm run dev/build`.
2. **BFF auth + shell:** route handlers login/refresh/logout + proxy/serverFetch + middleware; pantalla **login**; **app shell** (sidebar/topbar, nav por rol) + `/auth/me`.
3. **Patrones reutilizables:** API client tipado (unwrap `{ok,message,data}` + Paginated) + hooks TanStack Query; `ResourceTable` / `ResourceForm` (Zod) / `ResourceDetail`; `createResource`.
4. **Dashboard:** KPIs + gráficas (Recharts/shadcn) + barra de filtros comunes.
5. **Comercial:** oportunidades (**kanban** + tabla + acciones), clientes, contactos, **inbox de requests**.
6. **Reclutamiento:** candidatos, aplicaciones (etapas), placements.
7. **Admin + catálogos:** usuarios/roles/permisos/empleados + sectores/áreas/etapas/tipos vía el patrón.
8. **Pulido/interactividad:** command palette, optimistic + animaciones, accesibilidad, tests (Vitest + Playwright), (dark-mode opcional).
