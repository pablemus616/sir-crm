# Candidate Contacts View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only paginated view at `/candidate-contacts` ("Interacciones con candidatos") that lists `GET /candidate-contacts` — admins see all rows, recruiters see only their own (server-scoped).

**Architecture:** Follow the `contact-history` bespoke-page pattern (not the CRUD `ResourcePage`): a Server Component page renders a `'use client'` view component that holds filter/page state and calls a custom TanStack Query hook. The table is rendered with the `<Table>` primitive from `components/ui/table.tsx`. Pagination uses inline "Anterior"/"Siguiente" controls matching the `ResourceTable` style. A nav entry is added to the "Reclutamiento" group.

**Tech Stack:** Next.js 16 App Router, React 19, TanStack Query v5, `clientFetch` from `lib/api/client.ts`, `@base-ui/react` via `components/ui`, Tailwind v4, lucide-react.

## Global Constraints

- No functions may cross the RSC boundary (no passing callbacks from Server → Client component).
- `'use client'` at the top of every client component file.
- All imports use the `@/*` path alias.
- Native `<select>` elements (not the `Select` UI wrapper) for filter dropdowns, styled with `filterSelectClass` constant (mirrors contact-history pattern).
- Pagination: keep `page` in state (1-based), `limit = 20`. Show `"{total} resultado(s) · Página {page} de {pageCount}"` and `variant="outline" size="sm"` Anterior/Siguiente buttons.
- Dates formatted with `formatDateTime` from `@/lib/format`.
- Full names: join `[firstName, secondName, lastName, surName].filter(Boolean)` with `' '`.
- Duration: use `formatDuration` from `@/lib/format` (takes seconds).
- Badge variants: `secondary` for contact type, `outline` for direction.
- Spanish copy: "Interacciones con candidatos", "Sin registros.", "No se pudo cargar las interacciones."
- No create/edit/delete UI (read-only).

---

### Task 1: Add `CandidateContact` type to recruitment types

**Files:**
- Modify: `lib/api/types/recruitment.ts`

**Interfaces:**
- Produces: `CandidateContact` type consumed by Task 2 and Task 3.

- [ ] **Step 1: Append `CandidateContact` to the recruitment types file**

Open `/home/plemus/WebstormProjects/sir-crm/lib/api/types/recruitment.ts` and append after the `Placement` interface:

```ts
/* ------------------------------------------------------------------ */
/* Candidate Contacts                                                  */
/* ------------------------------------------------------------------ */

export interface CandidateContactRecruiter {
  id: number;
  firstName?: string;
  secondName?: string | null;
  lastName?: string;
  surName?: string | null;
}

export interface CandidateContactCandidate {
  id: number;
  firstName: string;
  secondName?: string | null;
  lastName: string;
  surName?: string | null;
}

export interface CandidateContact {
  id: number;
  candidateId: number;
  opportunityId?: number | null;
  contactType?: { id: number; name: string } | null;
  contactTime: string;
  callLength?: number | null;
  contactDesc?: string | null;
  phoneNumberDialed?: string | null;
  direction?: 'inbound' | 'outbound' | null;
  recruiterEmployeeId: number;
  recruiter?: CandidateContactRecruiter | null;
  candidate?: CandidateContactCandidate | null;
  opportunity?: { id: number; title?: string | null } | null;
  createdAt: string;
}
```

- [ ] **Step 2: Verify TypeScript accepts the change**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output (or only pre-existing errors unrelated to this file).

- [ ] **Step 3: Commit**

```bash
cd /home/plemus/WebstormProjects/sir-crm && git add lib/api/types/recruitment.ts && git commit -m "feat(candidate-contacts): add CandidateContact type"
```

---

### Task 2: Create the TanStack Query hook for candidate-contacts

**Files:**
- Create: `lib/api/candidate-contacts.ts`

**Interfaces:**
- Consumes: `CandidateContact` from `lib/api/types/recruitment.ts` (Task 1), `clientFetch` from `lib/api/client.ts`, `Paginated` from `lib/api/types`.
- Produces: `useCandidateContacts(filters)` and `CandidateContactFilters` type consumed by Task 3.

- [ ] **Step 1: Create `lib/api/candidate-contacts.ts`**

```ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { CandidateContact } from '@/lib/api/types/recruitment';

const KEY = ['candidate-contacts'] as const;

export type CandidateContactFilters = {
  candidateId?: number;
  opportunityId?: number;
  recruiterId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export function useCandidateContacts(filters: CandidateContactFilters = {}) {
  const params: Record<string, string | number | boolean> = { limit: filters.limit ?? 20 };
  if (filters.page) params['page'] = filters.page;
  for (const key of ['candidateId', 'opportunityId', 'recruiterId', 'from', 'to'] as const) {
    const value = filters[key];
    if (value !== undefined && value !== '') params[key] = value;
  }
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () =>
      clientFetch<Paginated<CandidateContact>>('candidate-contacts', { params }),
    placeholderData: (prev) => prev,
  });
}
```

- [ ] **Step 2: Verify TypeScript accepts the new file**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /home/plemus/WebstormProjects/sir-crm && git add lib/api/candidate-contacts.ts && git commit -m "feat(candidate-contacts): add useCandidateContacts hook"
```

---

### Task 3: Create the page and view client component

**Files:**
- Create: `app/(app)/candidate-contacts/page.tsx`
- Create: `app/(app)/candidate-contacts/candidate-contacts-view.tsx`

**Interfaces:**
- Consumes:
  - `useCandidateContacts`, `CandidateContactFilters` from `lib/api/candidate-contacts.ts` (Task 2)
  - `CandidateContact`, `CandidateContactCandidate`, `CandidateContactRecruiter` from `lib/api/types/recruitment.ts` (Task 1)
  - `formatDateTime`, `formatDuration` from `@/lib/format`
  - `contactDirectionLabels` from `@/lib/domain/commercial-labels`
  - UI primitives: `Badge`, `Button`, `Input`, `Label`, `Skeleton`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`

**Note:** `contactDirectionLabels` already exists in `lib/domain/commercial-labels.ts` as `{ inbound: 'Entrante', outbound: 'Saliente' }`.

- [ ] **Step 1: Create `app/(app)/candidate-contacts/page.tsx`**

```ts
import type { Metadata } from 'next';
import { CandidateContactsView } from './candidate-contacts-view';

export const metadata: Metadata = { title: 'Interacciones con candidatos · SIR CRM' };

export default function CandidateContactsPage() {
  return <CandidateContactsView />;
}
```

- [ ] **Step 2: Create `app/(app)/candidate-contacts/candidate-contacts-view.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useCandidateContacts,
  type CandidateContactFilters,
} from '@/lib/api/candidate-contacts';
import type {
  CandidateContactCandidate,
  CandidateContactRecruiter,
} from '@/lib/api/types/recruitment';
import { contactDirectionLabels } from '@/lib/domain/commercial-labels';
import { formatDateTime, formatDuration } from '@/lib/format';

const LIMIT = 20;

const filterSelectClass = 'w-full rounded-md border border-input bg-background p-2 text-sm';

function fullName(
  p: Pick<CandidateContactCandidate | CandidateContactRecruiter, 'firstName' | 'secondName' | 'lastName' | 'surName'>,
): string {
  return [p.firstName, p.secondName, p.lastName, p.surName].filter(Boolean).join(' ');
}

export function CandidateContactsView() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<CandidateContactFilters, 'page' | 'limit'>>({});

  const q = useCandidateContacts({ ...filters, page, limit: LIMIT });

  const items = q.data?.items ?? [];
  const total = q.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / LIMIT));

  const setStr =
    (key: keyof Omit<CandidateContactFilters, 'page' | 'limit'>) =>
    (value: string) => {
      setPage(1);
      setFilters((f) => ({ ...f, [key]: value || undefined }));
    };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Interacciones con candidatos
        </h1>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="f-from">Desde</Label>
          <Input
            id="f-from"
            type="date"
            value={filters.from ?? ''}
            onChange={(e) => setStr('from')(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="f-to">Hasta</Label>
          <Input
            id="f-to"
            type="date"
            value={filters.to ?? ''}
            onChange={(e) => setStr('to')(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="f-candidate">ID Candidato</Label>
          <Input
            id="f-candidate"
            type="number"
            min={1}
            placeholder="Ej. 42"
            value={filters.candidateId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setPage(1);
              setFilters((f) => ({ ...f, candidateId: v ? Number(v) : undefined }));
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="f-opportunity">ID Oportunidad</Label>
          <Input
            id="f-opportunity"
            type="number"
            min={1}
            placeholder="Ej. 7"
            value={filters.opportunityId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setPage(1);
              setFilters((f) => ({ ...f, opportunityId: v ? Number(v) : undefined }));
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidato</TableHead>
              <TableHead>Puesto / Vacante</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Fecha / Hora</TableHead>
              <TableHead>Reclutador</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {q.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : q.isError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-destructive">
                  No se pudo cargar las interacciones.
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                  Sin registros.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.candidate ? fullName(item.candidate) : `Candidato #${item.candidateId}`}
                  </TableCell>
                  <TableCell>
                    {item.opportunity
                      ? (item.opportunity.title ?? `Vacante #${item.opportunity.id}`)
                      : item.opportunityId
                        ? `Vacante #${item.opportunityId}`
                        : '—'}
                  </TableCell>
                  <TableCell>
                    {item.contactType?.name ? (
                      <Badge variant="secondary">{item.contactType.name}</Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    {item.direction ? (
                      <Badge variant="outline">
                        {contactDirectionLabels[item.direction]}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDateTime(item.contactTime)}
                  </TableCell>
                  <TableCell>
                    {item.recruiter ? fullName(item.recruiter) : `Reclutador #${item.recruiterEmployeeId}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.callLength != null ? formatDuration(item.callLength) : '—'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {item.contactDesc ?? '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} resultado(s) · Página {page} de {pageCount}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript accepts both new files**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
cd /home/plemus/WebstormProjects/sir-crm && git add "app/(app)/candidate-contacts/page.tsx" "app/(app)/candidate-contacts/candidate-contacts-view.tsx" && git commit -m "feat(candidate-contacts): add candidate contacts view page"
```

---

### Task 4: Add sidebar nav entry

**Files:**
- Modify: `lib/auth/nav.ts`

**Interfaces:**
- Consumes: existing `NAV_GROUPS` array and `lucide-react` imports.
- Produces: nav item visible to all authenticated users (access: 'auth') under "Reclutamiento".

- [ ] **Step 1: Add `PhoneCall` to the lucide-react import in `lib/auth/nav.ts`**

In the existing import block at the top of `lib/auth/nav.ts`, add `PhoneCall` to the destructured list (alphabetical position between `LayoutGrid` and `Layers`):

```ts
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Contact,
  FileText,
  GitBranch,
  History,
  IdCard,
  Inbox,
  Key,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  PhoneCall,   // ← add this
  Shield,
  Tags,
  Target,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
```

- [ ] **Step 2: Add the nav item to the "Reclutamiento" group in `lib/auth/nav.ts`**

In the `NAV_GROUPS` array, find the "Reclutamiento" group and append the new item after the existing `placements` entry:

```ts
{
  label: 'Reclutamiento',
  access: 'auth',
  items: [
    { label: 'Candidatos', href: '/candidates', icon: Users, access: 'auth' },
    { label: 'Aplicaciones', href: '/applications', icon: FileText, access: 'auth' },
    { label: 'Placements', href: '/placements', icon: CheckCircle2, access: 'auth' },
    { label: 'Interacciones', href: '/candidate-contacts', icon: PhoneCall, access: 'auth' },  // ← add this
  ],
},
```

- [ ] **Step 3: Verify TypeScript accepts the change**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
cd /home/plemus/WebstormProjects/sir-crm && git add lib/auth/nav.ts && git commit -m "feat(candidate-contacts): add Interacciones nav entry under Reclutamiento"
```

---

### Task 5: Full build verification and final commit

**Files:** No new files — just verification.

- [ ] **Step 1: Run Next.js production build**

```bash
cd /home/plemus/WebstormProjects/sir-crm && pnpm build 2>&1 | tail -40
```

Expected: build succeeds with no TypeScript errors. May show route table including `/candidate-contacts`.

- [ ] **Step 2: If build fails, fix the errors**

Read the error output, identify the file and line, fix it, re-run tsc and then build.

- [ ] **Step 3: If build passes, create a final verification commit**

Only if there were any fixup changes since Task 4; otherwise the individual task commits already cover everything. Skip this step if no new changes.

```bash
cd /home/plemus/WebstormProjects/sir-crm && git add -p && git commit -m "fix(candidate-contacts): resolve build errors"
```

---

## Self-Review

**Spec coverage:**
- ✅ `GET /candidate-contacts` paginated — Task 2 hook, Task 3 view.
- ✅ Columns: candidato, puesto/vacante, tipo (badge), dirección (badge), fecha/hora, reclutador, duración, notas — Task 3, step 2.
- ✅ Loading/empty/error states — Task 3, step 2.
- ✅ Pagination — Task 3, step 2.
- ✅ Sidebar/nav link — Task 4.
- ✅ Role-scoped by backend (no client-side gating needed) — access: 'auth' nav item.
- ✅ No functions from Server → Client (page.tsx only passes nothing; view is fully client) — Task 3, step 1.
- ✅ Build verification — Task 5.
- ✅ Local commit (no push) — each task ends with a commit.

**Placeholder scan:** No TBDs, all code shown in full.

**Type consistency:**
- `CandidateContact` defined in Task 1, imported in Task 2 and Task 3.
- `CandidateContactFilters` defined in Task 2, used in Task 3.
- `CandidateContactCandidate` and `CandidateContactRecruiter` defined in Task 1, used in Task 3's `fullName` helper.
- `fullName` typed to accept either recruiter or candidate shapes (both share the same name fields).
- `formatDuration` takes seconds (number) — `callLength` is `number | null`, guarded with `!= null` check.
