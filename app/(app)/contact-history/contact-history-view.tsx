'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useContactHistory, type ContactHistoryFilters } from '@/lib/api/contact-history';
import { useList } from '@/lib/api/hooks';
import { Combobox } from '@/components/ui/combobox';
import { contactDirectionLabels } from '@/lib/domain/commercial-labels';
import { formatDateTime } from '@/lib/format';
import type { Client, ClientContact, ContactDirection } from '@/lib/api/types/commercial';
import { LogContactForm } from './log-contact-form';

export function ContactHistoryView() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<ContactHistoryFilters>({});
  const q = useContactHistory(filters);

  const clients = useList<Client>('clients', { limit: 1000 });
  const contacts = useList<ClientContact>('client-contacts', { limit: 1000 });
  const contactTypes = useList<{ id: number; name: string }>('contact-types', { limit: 1000 });

  const setNum = (key: keyof ContactHistoryFilters) => (value: string) =>
    setFilters((f) => ({ ...f, [key]: value ? Number(value) : undefined }));
  const setStr = (key: keyof ContactHistoryFilters) => (value: string) =>
    setFilters((f) => ({ ...f, [key]: value || undefined }));

  const items = q.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Historial de contacto
        </h1>
        <Button onClick={() => setOpen(true)}>Registrar contacto</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="f-client">Cliente</Label>
          <Combobox
            id="f-client"
            options={(clients.data?.items ?? []).map((c) => ({ label: c.name, value: String(c.id) }))}
            value={filters.clientId}
            onChange={(v) => setNum('clientId')(v ?? '')}
            loading={clients.isLoading}
            clearable
            clearLabel="Todos"
            placeholder="Todos"
            searchPlaceholder="Buscar cliente…"
            triggerClassName="w-full"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="f-contact">Contacto</Label>
          <Combobox
            id="f-contact"
            options={(contacts.data?.items ?? []).map((c) => ({ label: c.name, value: String(c.id) }))}
            value={filters.contactId}
            onChange={(v) => setNum('contactId')(v ?? '')}
            loading={contacts.isLoading}
            clearable
            clearLabel="Todos"
            placeholder="Todos"
            searchPlaceholder="Buscar contacto…"
            triggerClassName="w-full"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="f-type">Tipo</Label>
          <Combobox
            id="f-type"
            options={(contactTypes.data?.items ?? []).map((t) => ({ label: t.name, value: String(t.id) }))}
            value={filters.contactType}
            onChange={(v) => setNum('contactType')(v ?? '')}
            loading={contactTypes.isLoading}
            clearable
            clearLabel="Todos"
            placeholder="Todos"
            searchPlaceholder="Buscar tipo…"
            triggerClassName="w-full"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="f-direction">Dirección</Label>
          <Combobox
            id="f-direction"
            options={(Object.keys(contactDirectionLabels) as ContactDirection[]).map((d) => ({
              label: contactDirectionLabels[d],
              value: d,
            }))}
            value={filters.direction}
            onChange={(v) =>
              setFilters((f) => ({
                ...f,
                direction: (v || undefined) as ContactDirection | undefined,
              }))
            }
            clearable
            clearLabel="Todas"
            placeholder="Todas"
            searchPlaceholder="Buscar dirección…"
            triggerClassName="w-full"
          />
        </div>

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
      </div>

      {q.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : q.isError ? (
        <p className="text-sm text-destructive">No se pudo cargar el historial.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin registros.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((h) => (
            <li
              key={h.id}
              className="rounded-md border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <p className="min-w-0 truncate text-sm font-medium text-foreground">
                  {h.contact?.name ?? `Contacto #${h.contactId}`}
                </p>
                {h.contactType?.name && (
                  <Badge variant="secondary" className="shrink-0">
                    {h.contactType.name}
                  </Badge>
                )}
                {h.direction && (
                  <Badge variant="outline" className="shrink-0">
                    {contactDirectionLabels[h.direction]}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateTime(h.contactTime)}
              </p>
              {h.contactDesc && (
                <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{h.contactDesc}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <LogContactForm open={open} onOpenChange={setOpen} />
    </div>
  );
}
