'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { useList } from '@/lib/api/hooks';
import { useHandleRequest } from '@/lib/api/contact-requests';
import type { Client, ContactRequest } from '@/lib/api/types/commercial';

/** Cota máxima de clientes cargados en el combo (el backend ordena por id DESC). */
const CLIENTS_LIMIT = 1000;

export function HandleRequestDialog({
  request,
  onClose,
}: {
  request: ContactRequest | null;
  onClose: () => void;
}) {
  const handle = useHandleRequest();
  const clients = useList<Client>('clients', { limit: CLIENTS_LIMIT });
  const [clientId, setClientId] = useState('');

  if (!request) return null;

  const submit = () =>
    handle.mutate(
      { id: request.id, resultingClientId: clientId ? Number(clientId) : undefined },
      {
        onSuccess: () => {
          setClientId('');
          onClose();
        },
      },
    );

  const items = clients.data?.items ?? [];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atender solicitud</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {request.name ?? 'Sin nombre'} · {request.email ?? request.phone ?? '—'}
        </p>
        {request.message && (
          <p className="rounded-md bg-secondary/60 p-3 text-sm text-foreground">
            {request.message}
          </p>
        )}
        <div className="space-y-1">
          <Label htmlFor="clientId">Cliente resultante (opcional)</Label>
          <Combobox
            id="clientId"
            options={items.map((c) => ({ label: c.name, value: String(c.id) }))}
            value={clientId}
            onChange={(v) => setClientId(v ?? '')}
            loading={clients.isLoading}
            clearable
            clearLabel="Sin cliente"
            placeholder="Seleccionar cliente…"
            searchPlaceholder="Buscar cliente…"
            emptyText={
              clients.isError
                ? 'No se pudieron cargar los clientes.'
                : 'No hay clientes disponibles.'
            }
            triggerClassName="w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={handle.isPending}>
            Marcar como atendida
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
