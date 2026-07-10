'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createOpportunitySchema, type CreateOpportunityInput } from '@/lib/schemas/commercial';
import { useCreateOpportunity } from '@/lib/api/opportunities';
import { useList } from '@/lib/api/hooks';
import type { Client, PipelineStage } from '@/lib/api/types/commercial';

export function OpportunityCreateForm({
  open, onOpenChange,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
}) {
  const create = useCreateOpportunity();
  const clients = useList<Client>('clients', { limit: 1000 });
  const stages = useList<PipelineStage>('pipeline-stages', { active: true, limit: 1000 });
  const employees = useList<{ id: number; firstName?: string; lastName?: string }>('employees', { limit: 1000 });
  const { register, control, handleSubmit, formState: { errors } } = useForm<CreateOpportunityInput>({
    resolver: zodResolver(createOpportunitySchema),
  });

  const onSubmit = (values: CreateOpportunityInput) =>
    create.mutate(values, { onSuccess: () => onOpenChange(false) });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva oportunidad</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="clientId">Cliente</Label>
            <Controller
              control={control}
              name="clientId"
              render={({ field }) => (
                <Combobox
                  id="clientId"
                  options={(clients.data?.items ?? []).map((c) => ({ label: c.name, value: String(c.id) }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v == null ? undefined : Number(v))}
                  loading={clients.isLoading}
                  placeholder="Selecciona…"
                  searchPlaceholder="Buscar cliente…"
                />
              )}
            />
            {errors.clientId && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="responsibleEmployeeId">Responsable</Label>
            <Controller
              control={control}
              name="responsibleEmployeeId"
              render={({ field }) => (
                <Combobox
                  id="responsibleEmployeeId"
                  options={(employees.data?.items ?? []).map((e) => ({
                    label: [e.firstName, e.lastName].filter(Boolean).join(' ') || `#${e.id}`,
                    value: String(e.id),
                  }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v == null ? undefined : Number(v))}
                  loading={employees.isLoading}
                  placeholder="Selecciona…"
                  searchPlaceholder="Buscar responsable…"
                />
              )}
            />
            {errors.responsibleEmployeeId && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="pipelineStageId">Etapa</Label>
            <Controller
              control={control}
              name="pipelineStageId"
              render={({ field }) => (
                <Combobox
                  id="pipelineStageId"
                  options={(stages.data?.items ?? []).map((s) => ({ label: s.name, value: String(s.id) }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v == null ? undefined : Number(v))}
                  loading={stages.isLoading}
                  placeholder="Selecciona…"
                  searchPlaceholder="Buscar etapa…"
                />
              )}
            />
            {errors.pipelineStageId && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register('title')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="amount">Monto (GTQ)</Label>
            <Input id="amount" type="number" min={0} step="0.01" {...register('amount')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>Crear</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
