# SIR CRM — Guía funcional

Documento de referencia para entender **qué hace cada módulo a nivel usuario** y
**cómo se alimentan las métricas** de la reportería. Complementa a `AGENTS.md`
(que cubre convenciones técnicas), no lo reemplaza.

> Fuentes: frontend `sir-crm` (Next.js 16, App Router) y backend `sir-api`
> (NestJS 11 sobre Fastify + TypeORM + PostgreSQL).

---

## 1. Arquitectura en una página

```
Navegador ──▶ Next.js (sir-crm) ──▶ BFF proxy ──▶ API (sir-api) ──▶ PostgreSQL
             · UI / Server Components   /api/proxy/*   controladores REST
             · proxy.ts (sesión)                       + agregaciones de métricas
```

- **El navegador nunca habla directo con la API.** Toda llamada del cliente pasa
  por el proxy interno `/api/proxy/[...path]`, que adjunta el token y reenvía a
  `SIR_API_URL`. Así el token de acceso vive en cookies **httpOnly** (no accesibles
  por JavaScript) y nunca se expone al navegador.
- **Autenticación:** cookies `sir_access` (token JWT, 15 min) y `sir_refresh`
  (token opaco, 30 días, rotativo). Ver §4.
- **Autorización:** un usuario **admin** ve datos globales; un usuario **no-admin**
  solo ve lo que le pertenece (sus oportunidades, sus colocaciones). Ver §3.4.

---

## 2. Módulos (qué hacen a nivel usuario)

La navegación está agrupada en secciones (definidas en `lib/auth/nav.ts`).

### General

| Módulo | Ruta | Qué hace |
|---|---|---|
| **Dashboard / Reportería** | `/dashboard` | Pantalla de análisis: tarjetas de KPI + gráficas. No se captura nada aquí; **solo lee y resume** lo que se registra en los demás módulos. Ver §3. |

### Comercial

| Módulo | Ruta | Qué hace |
|---|---|---|
| **Oportunidades** | `/opportunities` | El pipeline de ventas. Cada oportunidad es un negocio con un cliente, un monto, una probabilidad y una etapa. Acciones: mover de **etapa**, enviar **propuesta**, registrar **seguimiento**, marcar **ganada** o **perdida**. Es la fuente principal de las métricas comerciales. |
| **Clientes** | `/clients` | Empresas cliente. Cada cliente pertenece a un **sector**. |
| **Contactos de cliente** | `/client-contacts` | Personas de contacto dentro de cada empresa cliente. |
| **Solicitudes de contacto** | `/contact-requests` | Bandeja de solicitudes entrantes (leads). El staff las **atiende** (`handle`); al atenderlas se puede marcar de qué **cliente** resultaron. |
| **Historial de contacto** | `/contact-history` | Bitácora de interacciones comerciales (llamadas, correos): con quién, tipo, dirección (entrante/saliente) y duración. |

### Reclutamiento

| Módulo | Ruta | Qué hace |
|---|---|---|
| **Candidatos** | `/candidates` | Base de personas buscando empleo. Un candidato está `active` u otro estado. |
| **Aplicaciones** | `/applications` | Postulaciones de un candidato a una oportunidad. Avanzan por **etapas del embudo** (`stage`). |
| **Colocaciones** | `/placements` | Contrataciones exitosas: candidato colocado, reclutador responsable, honorarios (`fee`) y fecha. |
| **Interacciones** | `/candidate-contacts` | Registro de contactos/llamadas con candidatos. |

### Catálogos (solo admin)

Datos de referencia que alimentan a los módulos anteriores: **Sectores**
(`/sectors`), **Áreas** (`/position-areas`), **Etapas** del pipeline
(`/pipeline-stages`, con orden) y **Tipos de contacto** (`/contact-types`).

### Administración (solo admin)

**Usuarios** (`/users`), **Roles** (`/roles`), **Permisos** (`/permissions`) y
**Empleados** (`/employees`). Los *empleados* son las personas (reclutadores /
comerciales) a las que se atribuyen las métricas.

---

## 3. Cómo se alimentan las métricas

Regla de oro: **las métricas no se capturan; se derivan.** Cada número del
dashboard es una agregación de solo-lectura que suma/cuenta lo que los usuarios
registran al operar los módulos. Si un tablero sale vacío o bajo, casi siempre es
porque la **acción que lo alimenta** no se está registrando (no porque el reporte
esté mal). Los endpoints viven en `sir-api` → `src/metrics/`.

### 3.1 Tarjetas de KPI (`GET /metrics/overview`)

| Tarjeta | De dónde sale | Acción que la alimenta |
|---|---|---|
| Clientes | `COUNT(clients)` | Crear clientes |
| Candidatos activos | `COUNT(candidates WHERE status='active')` | Crear candidatos / mantener su estado |
| Solicitudes sin atender | `COUNT(contact_requests WHERE wasHandled=false)` | Dejar solicitudes sin atender (baja = bueno) |
| Oportunidades abiertas | `COUNT(opportunities WHERE status='open')` | Crear oportunidades |
| Valor del pipeline | `SUM(amount)` de oportunidades abiertas | Poner monto a las oportunidades |
| Colocaciones del mes | `COUNT(placements)` del mes actual por `placementDate` | Registrar colocaciones |

### 3.2 Gráficas del dashboard

| Gráfica | Endpoint | Qué mide y qué la alimenta |
|---|---|---|
| **Pipeline por etapa** | `/metrics/pipeline` | Oportunidades agrupadas por etapa (conteo + monto). Se alimenta al **mover oportunidades de etapa**. |
| **Embudo de reclutamiento** | `/metrics/recruitment/funnel` | Aplicaciones agrupadas por etapa del embudo. Se alimenta al **crear aplicaciones y avanzarlas de etapa**. |
| **Contactos por tipo** | `/metrics/contacts` | Interacciones agrupadas por tipo/dirección (conteo, duración total y promedio). Se alimenta al **registrar historial de contacto**. |
| **Colocaciones por reclutador** | `/metrics/placements` | Por reclutador y cliente: conteo, suma de honorarios y **tiempo promedio de cierre** (`placementDate − opportunity.createdAt`). Se alimenta al **registrar colocaciones**. |
| **Oportunidades por cliente / sector / área** | `/metrics/charts/by-client` · `by-sector` · `by-area` | Por cada dimensión: oportunidades (conteo), ganadas (conteo) y monto ganado. Se alimenta al **crear y ganar oportunidades** (el sector viene del cliente; el área, de la oportunidad). |

### 3.3 Reportes adicionales (disponibles en la API)

| Reporte | Endpoint | Qué mide |
|---|---|---|
| **Conversión comercial** | `/metrics/commercial` | Total de oportunidades, ganadas, propuestas enviadas, monto ganado, **valor ponderado** (`amount × probabilidad/100` de las abiertas) y ratios de conversión (ganadas/total y ganadas/propuestas). |
| **Solicitudes** (solo admin) | `/metrics/requests` | Embudo de leads entrantes: total, atendidas, **convertidas** (con cliente resultante), tiempo promedio de respuesta, y tasas de atención y conversión. |

### 3.4 Alcance por usuario (importante para leer los números)

- **Admin:** ve datos **globales**.
- **No-admin:** el backend **fuerza** el filtro a su propio empleado
  (`responsibleEmployeeId` en oportunidades, `placedByEmployeeId` en colocaciones),
  ignorando cualquier filtro de dueño que venga en la petición. Es decir, un
  no-admin **solo ve las métricas que alimentan sus propias acciones**.

### 3.5 Filtros del dashboard

Todos los tableros aceptan filtros de **rango de fechas** (`from`/`to`) y de
**segmento** (cliente, área, sector, etapa, estado, empleado responsable). Cambiar
un filtro reconsulta; no repinta datos viejos.

---

## 4. Sesión y seguridad (cómo funciona el login)

1. **Login:** el formulario hace `POST /api/auth/login`; el servidor llama a la API
   (`/auth/login`), recibe `{accessToken, refreshToken}` y los guarda en cookies
   httpOnly (`sir_access`, `sir_refresh`).
2. **Cada request** lleva el `sir_access` como `Bearer`. El token dura **15 min**.
3. **Renovación:** cuando el acceso expira, se usa el `sir_refresh` para pedir un
   par nuevo a `/auth/refresh`. El backend **rota** el refresh (invalida el viejo)
   y desliza la ventana de 30 días.
4. **`proxy.ts`** (la pieza clave, en runtime Node de Next 16): corre antes de
   renderizar y **renueva-y-persiste** el token cuando expiró, de modo que la
   sesión no se cae y las cookies rotadas no se pierden. Si no hay sesión válida,
   redirige a `/login?redirect=<a dónde iba>`. La barrera real de autorización
   sigue siendo `getMe()` en el layout autenticado.

> **Nota histórica:** antes la sesión se caía a los ~15 min y a veces no llevaba al
> login. Causa: el refresh ocurría durante el render (donde no se pueden escribir
> cookies), y el proxy consideraba "con sesión" la mera presencia del refresh viejo,
> lo que producía un rebote en bucle en `/login`. Corregido en `proxy.ts`,
> `lib/auth/cookie-config.ts` (refresh alineado a 30 días) y `lib/api/client.ts`
> (redirección al login en 401).

---

## 5. Colores de la reportería

La paleta de gráficas son 8 tokens CSS (`--chart-1..8`) definidos en
`app/globals.css`, con variante para modo claro y oscuro. Son **valores de color
completos** y se referencian **sin envolver**: `var(--chart-N)` (envolverlos como
`hsl(var(--chart-N))` genera CSS inválido y las barras salen negras). La paleta está
validada para daltonismo contra las superficies reales de la app. Para cambiar un
color, edita el token en `globals.css`; todas las gráficas lo toman automáticamente.
