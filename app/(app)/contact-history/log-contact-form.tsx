'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createContactHistorySchema, type CreateContactHistoryInput } from '@/lib/schemas/commercial';
import { useLogContact } from '@/lib/api/contact-history';
import { useList } from '@/lib/api/hooks';
import { contactDirectionLabels } from '@/lib/domain/commercial-labels';
import type { ClientContact, ContactDirection } from '@/lib/api/types/commercial';

const selectClass = 'w-full rounded-md border border-input bg-background p-2 text-sm';

export function LogContactForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const log = useLogContact();
  const contacts = useList<ClientContact>('client-contacts', { limit: 100 });
  const contactTypes = useList<{ id: number; name: string }>('contact-types', { limit: 100 });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateContactHistoryInput>({
    resolver: zodResolver(createContactHistorySchema),
  });

  const onSubmit = (values: CreateContactHistoryInput) =>
    log.mutate(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar contacto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="contactId">Contacto</Label>
            <select id="contactId" className={selectClass} {...register('contactId')}>
              <option value="">Selecciona…</option>
              {contacts.data?.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.contactId && <p className="text-xs text-destructive">Selecciona un contacto.</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="contactType">Tipo de contacto</Label>
            <select id="contactType" className={selectClass} {...register('contactType')}>
              <option value="">Selecciona…</option>
              {contactTypes.data?.items.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.contactType && (
              <p className="text-xs text-destructive">Selecciona un tipo de contacto.</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="contactTime">Fecha y hora</Label>
            <Input
              id="contactTime"
              type="datetime-local"
              {...register('contactTime')}
              onChange={(e) => {
                const v = e.target.value;
                setValue('contactTime', v ? new Date(v).toISOString() : '', {
                  shouldValidate: true,
                });
              }}
            />
            {errors.contactTime && (
              <p className="text-xs text-destructive">Indica la fecha y hora del contacto.</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="direction">Dirección (opcional)</Label>
            <select id="direction" className={selectClass} {...register('direction')}>
              <option value="">Sin especificar</option>
              {(Object.keys(contactDirectionLabels) as ContactDirection[]).map((d) => (
                <option key={d} value={d}>
                  {contactDirectionLabels[d]}
                </option>
              ))}
            </select>
            {errors.direction && (
              <p className="text-xs text-destructive">Dirección inválida.</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="callLength">Duración (s) (opcional)</Label>
            <Input id="callLength" type="number" min={0} {...register('callLength')} />
            {errors.callLength && (
              <p className="text-xs text-destructive">Duración inválida.</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="phoneNumberDialed">Teléfono marcado (opcional)</Label>
            <Input id="phoneNumberDialed" {...register('phoneNumberDialed')} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="contactDesc">Descripción (opcional)</Label>
            <Textarea id="contactDesc" rows={3} {...register('contactDesc')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={log.isPending}>
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
