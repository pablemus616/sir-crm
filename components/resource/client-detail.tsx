'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { createResourceClient } from '@/lib/api/resource-client';
import type { Client, ClientContact } from '@/lib/api/types/commercial';

type ClientWithContacts = Client & { contacts?: ClientContact[] };

const clientsApiClient = createResourceClient<ClientWithContacts>('clients');

/**
 * Lista de contactos de un cliente obtenida vía GET /clients/:id.
 * Se usa dentro de los detailFields del recurso clientes.
 */
export function ClientContactsList({ clientId }: { clientId: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['clients', clientId, 'detail'],
    queryFn: () => clientsApiClient.one(clientId),
    enabled: clientId > 0,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando contactos…</p>;
  if (isError || !data) return <p className="text-sm text-destructive">No se pudieron cargar los contactos.</p>;

  const contacts = data.contacts ?? [];
  if (contacts.length === 0) return <p className="text-sm text-muted-foreground">Sin contactos.</p>;

  return (
    <ul className="mt-1 space-y-2">
      {contacts.map((ct) => (
        <li
          key={ct.id}
          className="flex items-center justify-between rounded-md border border-border p-2"
        >
          <span className="text-sm text-foreground">{ct.name}</span>
          <span className="flex gap-2">
            {ct.phoneNumber && <Badge variant="outline">{ct.phoneNumber}</Badge>}
            {ct.email && <Badge variant="secondary">{ct.email}</Badge>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Vista completa del detalle de un cliente con sus contactos.
 * Puede usarse como componente independiente donde se necesite.
 */
export function ClientDetail({ id }: { id: number }) {
  const { data: c, isLoading, isError } = useQuery({
    queryKey: ['clients', id, 'detail'],
    queryFn: () => clientsApiClient.one(id),
    enabled: id > 0,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (isError || !c) return <p className="text-sm text-destructive">No se pudo cargar el cliente.</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
          {c.name}
        </h2>
        <p className="text-sm text-muted-foreground">{c.sector ?? 'Sin sector'}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Contactos</h3>
        <ClientContactsList clientId={id} />
      </div>
    </div>
  );
}
