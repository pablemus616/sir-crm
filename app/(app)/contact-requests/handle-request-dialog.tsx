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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useList } from '@/lib/api/hooks';
import { useHandleRequest } from '@/lib/api/contact-requests';
import type { Client, ContactRequest } from '@/lib/api/types/commercial';

/** Centinela para el item placeholder (cargando / vacío): base-ui Select exige
 *  un `value` en cada Item; este nunca se selecciona porque va deshabilitado. */
const PLACEHOLDER = '__placeholder__';

export function HandleRequestDialog({
  request,
  onClose,
}: {
  request: ContactRequest | null;
  onClose: () => void;
}) {
  const handle = useHandleRequest();
  const clients = useList<Client>('clients', { limit: 200 });
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
          <Select value={clientId} onValueChange={(v) => setClientId(v ?? '')}>
            <SelectTrigger id="clientId" className="w-full">
              <SelectValue placeholder="Seleccionar cliente…" />
            </SelectTrigger>
            <SelectContent>
              {clients.isLoading ? (
                <SelectItem value={PLACEHOLDER} disabled>
                  Cargando…
                </SelectItem>
              ) : items.length === 0 ? (
                <SelectItem value={PLACEHOLDER} disabled>
                  No hay clientes disponibles
                </SelectItem>
              ) : (
                items.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
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
