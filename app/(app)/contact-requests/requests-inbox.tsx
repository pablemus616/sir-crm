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

function RequestList({ wasHandled }: { wasHandled: boolean }) {
  const q = useContactRequests(wasHandled);
  const [selected, setSelected] = useState<ContactRequest | null>(null);

  if (q.isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (q.isError) {
    return (
      <p className="text-sm text-destructive">No se pudieron cargar las solicitudes.</p>
    );
  }

  const items = q.data?.items ?? [];

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin solicitudes.</p>;
  }

  return (
    <>
      <ul className="space-y-2">
        {items.map((r) => (
          <li
            key={r.id}
            className="flex items-start justify-between gap-4 rounded-md border border-border bg-card p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {r.name ?? 'Sin nombre'}
                </p>
                <Badge variant={wasHandled ? 'secondary' : 'outline'}>
                  {wasHandled ? 'Atendida' : 'Pendiente'}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {[r.email, r.phone].filter(Boolean).join(' · ')} · {formatDateTime(r.createdAt)}
              </p>
              {r.message && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.message}</p>
              )}
              {wasHandled && r.resultingClientId && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Cliente vinculado: #{r.resultingClientId}
                </p>
              )}
            </div>
            <div className="shrink-0">
              {!wasHandled && (
                <Button size="sm" onClick={() => setSelected(r)}>
                  Atender
                </Button>
              )}
            </div>
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
        <TabsContent value="pending" className="mt-4">
          <RequestList wasHandled={false} />
        </TabsContent>
        <TabsContent value="handled" className="mt-4">
          <RequestList wasHandled={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
