'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createContactHistorySchema, type CreateContactHistoryInput } from '@/lib/schemas/commercial';
import { useLogContact } from '@/lib/api/contact-history';
import { useList } from '@/lib/api/hooks';
import { contactDirectionLabels } from '@/lib/domain/commercial-labels';
import type { ClientContact, ContactDirection } from '@/lib/api/types/commercial';

export function LogContactForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const log = useLogContact();
  const contacts = useList<ClientContact>('client-contacts', { limit: 1000 });
  const contactTypes = useList<{ id: number; name: string }>('contact-types', { limit: 1000 });
  const {
    register,
    control,
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
            <Label htmlFor="contactId">
              Contacto <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="contactId"
              render={({ field }) => (
                <Combobox
                  id="contactId"
                  options={(contacts.data?.items ?? []).map((c) => ({ label: c.name, value: String(c.id) }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v == null ? undefined : Number(v))}
                  loading={contacts.isLoading}
                  placeholder="Selecciona…"
                  searchPlaceholder="Buscar contacto…"
                />
              )}
            />
            {errors.contactId && <p className="text-xs text-destructive">Selecciona un contacto.</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="contactType">
              Tipo de contacto <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="contactType"
              render={({ field }) => (
                <Combobox
                  id="contactType"
                  options={(contactTypes.data?.items ?? []).map((t) => ({ label: t.name, value: String(t.id) }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v == null ? undefined : Number(v))}
                  loading={contactTypes.isLoading}
                  placeholder="Selecciona…"
                  searchPlaceholder="Buscar tipo…"
                />
              )}
            />
            {errors.contactType && (
              <p className="text-xs text-destructive">Selecciona un tipo de contacto.</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="contactTime">
              Fecha y hora <span className="text-destructive">*</span>
            </Label>
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
            <Controller
              control={control}
              name="direction"
              render={({ field }) => (
                <Combobox
                  id="direction"
                  options={(Object.keys(contactDirectionLabels) as ContactDirection[]).map((d) => ({
                    label: contactDirectionLabels[d],
                    value: d,
                  }))}
                  value={field.value ?? undefined}
                  onChange={(v) => field.onChange((v || undefined) as ContactDirection | undefined)}
                  clearable
                  clearLabel="Sin especificar"
                  placeholder="Sin especificar"
                  searchPlaceholder="Buscar dirección…"
                />
              )}
            />
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
            <Input
              id="phoneNumberDialed"
              {...register('phoneNumberDialed', {
                setValueAs: (v) => (v?.trim() ? v : undefined),
              })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="contactDesc">Descripción (opcional)</Label>
            <Textarea
              id="contactDesc"
              rows={3}
              {...register('contactDesc', { setValueAs: (v) => (v?.trim() ? v : undefined) })}
            />
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
