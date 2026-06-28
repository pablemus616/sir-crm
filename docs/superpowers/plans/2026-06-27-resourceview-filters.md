# ResourceView List Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional `filters` array to the CRUD resource config so any resource screen can declare list-param filter controls (select + toggle) that appear above the table and merge into the `useList` params.

**Architecture:** A new `ResourceFilter` type is added to `types.ts`. A new `ResourceFilters` component renders the controls; sub-components handle dynamic-option fetches so hooks are called consistently. `ResourceView` gets a `filterValues` state map that merges into the list params and resets `page` to 1 on change.

**Tech Stack:** Next 16, React 19, shadcn/base-nova, TanStack Query v5, Vitest + @testing-library/react.

## Global Constraints

- `npm` (not pnpm/yarn)
- Brand tokens only — no hex colors
- Spanish labels; no English user-facing copy
- base-nova `render=` prop pattern for base-ui primitives where applicable
- Backward-compatible: resources without `filters` must behave identically to today
- `npx tsc --noEmit` must pass with 0 errors after every task
- `npm test` (full suite) must pass after every task

---

### Task 1: Add `ResourceFilter` type to `lib/resources/types.ts`

**Files:**
- Modify: `lib/resources/types.ts`

**Interfaces:**
- Produces: `ResourceFilter` (exported), `ResourceConfig.filters?: ResourceFilter[]`

- [ ] **Step 1: Add the type**

Add after line 22 (after `defaultLimit?: number;`) in `types.ts`:

```ts
export interface ResourceFilter {
  key: string;
  label: string;
  type: "select" | "toggle";
  /** Static options list (mutually exclusive with optionsEndpoint) */
  options?: { label: string; value: string | number }[];
  /** Fetch options from this catalog endpoint via useList({ limit: 100 }) */
  optionsEndpoint?: string;
  /** How to render the label of a fetched option (default: item.name) */
  optionLabel?: (item: unknown) => string;
  /** How to get the value of a fetched option (default: item.id) */
  optionValue?: (item: unknown) => string | number;
}
```

And add `filters?: ResourceFilter[];` to `ResourceConfig`.

- [ ] **Step 2: Type-check**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Run existing tests (no regressions)**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npm test
```

Expected: all existing tests pass.

- [ ] **Step 4: Commit**

```bash
git add lib/resources/types.ts
git commit -m "feat(resources): add ResourceFilter type to ResourceConfig"
```

---

### Task 2: Create `components/resource/resource-filters.tsx`

**Files:**
- Create: `components/resource/resource-filters.tsx`

**Interfaces:**
- Consumes: `ResourceFilter` from `lib/resources/types`, `useList` from `lib/api/hooks`, `FilterSelect` from `components/dashboard/filter-select`, `Switch` from `components/ui/switch`, `Label` from `components/ui/label`
- Produces: `<ResourceFilters filters values onChange />` component

- [ ] **Step 1: Write the component**

Create `components/resource/resource-filters.tsx`:

```tsx
"use client";

import { useList } from "@/lib/api/hooks";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { ResourceFilter } from "@/lib/resources/types";

type FilterValues = Record<string, string | number | boolean>;

// Sub-component: fetches options from an endpoint and renders a FilterSelect.
// Isolated so useList hook is always called consistently.
function DynamicSelectFilter({
  filter,
  value,
  onChange,
}: {
  filter: ResourceFilter;
  value: string | number | undefined;
  onChange: (key: string, value: string | number | undefined) => void;
}) {
  const getLabel = filter.optionLabel ?? ((item: unknown) => (item as { name: string }).name);
  const getValue = filter.optionValue ?? ((item: unknown) => (item as { id: number }).id);
  const query = useList<unknown>(filter.optionsEndpoint!, { limit: 100 });
  const options = (query.data?.items ?? []).map((item) => ({
    label: getLabel(item),
    value: getValue(item),
  }));
  return (
    <FilterSelect
      placeholder={filter.label}
      value={value}
      options={options.map((o) => ({ ...o, value: String(o.value) }))}
      onChange={(v) => onChange(filter.key, v === undefined ? undefined : v)}
    />
  );
}

export function ResourceFilters({
  filters,
  values,
  onChange,
}: {
  filters: ResourceFilter[];
  values: FilterValues;
  onChange: (key: string, value: string | number | boolean | undefined) => void;
}) {
  if (!filters.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => {
        if (filter.type === "toggle") {
          const checked = Boolean(values[filter.key]);
          return (
            <div key={filter.key} className="flex items-center gap-1.5">
              <Switch
                id={`filter-toggle-${filter.key}`}
                checked={checked}
                onCheckedChange={(v) => onChange(filter.key, v ? true : undefined)}
              />
              <Label htmlFor={`filter-toggle-${filter.key}`}>{filter.label}</Label>
            </div>
          );
        }

        // select
        if (filter.optionsEndpoint) {
          return (
            <DynamicSelectFilter
              key={filter.key}
              filter={filter}
              value={values[filter.key] as string | number | undefined}
              onChange={onChange}
            />
          );
        }

        const staticOptions = (filter.options ?? []).map((o) => ({
          label: o.label,
          value: String(o.value),
        }));
        return (
          <FilterSelect
            key={filter.key}
            placeholder={filter.label}
            value={values[filter.key] as string | number | undefined}
            options={staticOptions}
            onChange={(v) => onChange(filter.key, v)}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add components/resource/resource-filters.tsx
git commit -m "feat(resource): add ResourceFilters component (select + toggle controls)"
```

---

### Task 3: Wire filters into `ResourceView`

**Files:**
- Modify: `components/resource/resource-view.tsx`

**Interfaces:**
- Consumes: `ResourceFilters` from `./resource-filters`
- Produces: updated `ResourceView` with `filterValues` state + merged params

- [ ] **Step 1: Add filter state and param merging**

In `resource-view.tsx`, after `const [sorting, setSorting] = useState<SortingState>([]);`, add:

```ts
const [filterValues, setFilterValues] = useState<Record<string, string | number | boolean>>({});
```

Add a handler:
```ts
function handleFilterChange(key: string, value: string | number | boolean | undefined) {
  setPage(1);
  setFilterValues((prev) => {
    const next = { ...prev };
    if (value === undefined || value === false) {
      delete next[key];
    } else {
      next[key] = value;
    }
    return next;
  });
}
```

Update the params block to merge filter values:
```ts
const params: ListParams = { page, limit };
if (search && config.searchParam) params[config.searchParam] = search;
if (sorting[0]) {
  params.sort = sorting[0].id;
  params.order = sorting[0].desc ? "desc" : "asc";
}
for (const [k, v] of Object.entries(filterValues)) {
  params[k] = v;
}
```

- [ ] **Step 2: Render filter controls**

Import `ResourceFilters`:
```ts
import { ResourceFilters } from "./resource-filters";
```

Between the `<h1>` / button header row and `<ResourceTable>`, insert:

```tsx
{config.filters && config.filters.length > 0 && (
  <ResourceFilters
    filters={config.filters}
    values={filterValues}
    onChange={handleFilterChange}
  />
)}
```

- [ ] **Step 3: Type-check**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Run all tests**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npm test
```

Expected: all existing tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/resource/resource-view.tsx
git commit -m "feat(resource): integrate ResourceFilters into ResourceView; merge filter params"
```

---

### Task 4: Write TDD tests for the filter behavior

**Files:**
- Create: `components/resource/resource-view-filters.test.tsx`

**Interfaces:**
- Consumes: `createResource`, `ResourceView`, `createQueryWrapper`, fixture resource with `filters`

- [ ] **Step 1: Write the failing tests**

Create `components/resource/resource-view-filters.test.tsx`:

```tsx
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { createQueryWrapper } from "@/lib/test/query-wrapper";
import { ResourceView } from "@/components/resource/resource-view";
import { createResource } from "@/lib/resources/create-resource";

// ── Fixture ──────────────────────────────────────────────────────────────────

const itemSchema = z.object({ name: z.string().min(1) });

/** Resource with one static-select filter ("estado") and one toggle filter ("activo") */
const filteredResource = createResource<{ id: number; name: string }, typeof itemSchema>({
  key: "items",
  label: "Items",
  singular: "Item",
  endpoint: "items",
  access: "auth",
  columns: [{ accessorKey: "name", header: "Nombre" }],
  formSchema: itemSchema,
  formFields: [{ name: "name", label: "Nombre" }],
  detailFields: [{ label: "Nombre", render: (r) => r.name }],
  emptyFormValues: { name: "" },
  filters: [
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { label: "Abierto", value: "open" },
        { label: "Cerrado", value: "closed" },
      ],
    },
    {
      key: "activo",
      label: "Activo",
      type: "toggle",
    },
  ],
});

// ── Helpers ───────────────────────────────────────────────────────────────────

type FetchCall = [string, RequestInit | undefined];

function stubFetch(
  handler: (url: string, init?: RequestInit) => Promise<Response>,
) {
  const spy = vi.fn(handler);
  vi.stubGlobal("fetch", spy);
  return spy;
}

function listResponse(items: unknown[]) {
  return {
    status: 200,
    json: async () => ({
      ok: true,
      message: "",
      data: { items, total: items.length, page: 1, limit: 20 },
    }),
  } as unknown as Response;
}

function defaultFetch(url: string): Promise<Response> {
  return Promise.resolve(listResponse([{ id: 1, name: "Alpha" }]));
}

afterEach(() => vi.unstubAllGlobals());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ResourceView – list filters", () => {
  it("(a) renders filter controls declared in config", async () => {
    stubFetch(defaultFetch);
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={filteredResource} />, { wrapper });

    // Wait for initial load
    await screen.findByText("Alpha");

    // Static select filter
    expect(screen.getByText("Estado")).toBeInTheDocument();
    // Toggle filter label
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("(b) selecting a filter value adds that param to the next useList request URL", async () => {
    const fetchSpy = stubFetch(defaultFetch);
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={filteredResource} />, { wrapper });
    await screen.findByText("Alpha");

    // Open the Estado select and pick "Abierto"
    fireEvent.click(screen.getByRole("combobox", { name: /estado/i }));
    await screen.findByRole("option", { name: "Abierto" });
    fireEvent.click(screen.getByRole("option", { name: "Abierto" }));

    await waitFor(() => {
      const urls = fetchSpy.mock.calls.map(([url]: FetchCall) => url as string);
      expect(urls.some((u) => u.includes("estado=open"))).toBe(true);
    });
  });

  it("(c) toggling the activo switch adds/removes the param from the request URL", async () => {
    const fetchSpy = stubFetch(defaultFetch);
    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={filteredResource} />, { wrapper });
    await screen.findByText("Alpha");

    // Toggle ON
    const toggle = screen.getByRole("switch", { name: /activo/i });
    fireEvent.click(toggle);

    await waitFor(() => {
      const urls = fetchSpy.mock.calls.map(([url]: FetchCall) => url as string);
      expect(urls.some((u) => u.includes("activo=true"))).toBe(true);
    });

    // Toggle OFF
    fireEvent.click(toggle);

    await waitFor(() => {
      const urls = fetchSpy.mock.calls.map(([url]: FetchCall) => url as string);
      const lastUrl = urls.at(-1) ?? "";
      expect(lastUrl).not.toContain("activo=true");
    });
  });

  it("(d) changing a filter resets page to 1", async () => {
    // Fake a large list so pagination appears (total=100, limit=20)
    const largeFetch = vi.fn(async (url: string) => ({
      status: 200,
      json: async () => ({
        ok: true,
        message: "",
        data: {
          items: [{ id: 1, name: "Alpha" }],
          total: 100,
          page: url.includes("page=2") ? 2 : 1,
          limit: 20,
        },
      }),
    })) as unknown as typeof fetch;
    vi.stubGlobal("fetch", largeFetch);

    const { wrapper } = createQueryWrapper();
    render(<ResourceView resource={filteredResource} />, { wrapper });
    await screen.findByText("Alpha");

    // Advance to page 2 via next-page button
    const nextBtn = screen.getByRole("button", { name: /siguiente/i });
    fireEvent.click(nextBtn);
    await waitFor(() => {
      const urls = (largeFetch as ReturnType<typeof vi.fn>).mock.calls.map(
        ([u]: FetchCall) => u as string,
      );
      expect(urls.some((u) => u.includes("page=2"))).toBe(true);
    });

    // Now change a filter — page should reset to 1
    const toggle = screen.getByRole("switch", { name: /activo/i });
    fireEvent.click(toggle);

    await waitFor(() => {
      const urls = (largeFetch as ReturnType<typeof vi.fn>).mock.calls.map(
        ([u]: FetchCall) => u as string,
      );
      const lastUrl = urls.at(-1) ?? "";
      // After filter change, next fetch should be page=1 (or no page param = defaults to 1)
      expect(lastUrl).not.toContain("page=2");
    });
  });
});
```

- [ ] **Step 2: Run the tests (expect them to fail first)**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npm test -- --reporter=verbose components/resource/resource-view-filters.test.tsx
```

Expected: Tests fail because the feature is not yet implemented (at this point Task 3 should already be done, so tests should pass — but write tests BEFORE code if doing pure TDD, or verify they pass after implementation).

- [ ] **Step 3: Run full suite**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npm test
```

Expected: all tests pass (new + existing).

- [ ] **Step 4: Commit**

```bash
git add components/resource/resource-view-filters.test.tsx
git commit -m "test(resource): add TDD tests for ResourceView list filters"
```

---

### Task 5: Write report + final validation

**Files:**
- Create: `.superpowers/sdd/enh-resourceview-filters-report.md`

- [ ] **Step 1: Run final full validation**

```bash
cd /home/plemus/WebstormProjects/sir-crm && npm test && npx tsc --noEmit && npm run build
```

Expected: all green.

- [ ] **Step 2: Write report** (contents captured after implementation)

- [ ] **Step 3: Final commit**

```bash
git add .superpowers/sdd/enh-resourceview-filters-report.md
git commit -m "docs: add ResourceView filters enhancement report"
```
