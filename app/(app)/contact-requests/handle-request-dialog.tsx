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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHandleRequest } from '@/lib/api/contact-requests';
import type { ContactRequest } from '@/lib/api/types/commercial';

export function HandleRequestDialog({
  request,
  onClose,
}: {
  request: ContactRequest | null;
  onClose: () => void;
}) {
  const handle = useHandleRequest();
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
          <Input
            id="clientId"
            type="number"
            min={1}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="ID de cliente"
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
