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
import { Label } from '@/components/ui/label';
import { createOpportunitySchema, type CreateOpportunityInput } from '@/lib/schemas/commercial';
import { useUpdateOpportunity } from '@/lib/api/opportunities';
import { useList } from '@/lib/api/hooks';
import type { Client, PipelineStage, Opportunity } from '@/lib/api/types/commercial';

export function OpportunityEditForm({
  open,
  onOpenChange,
  opportunity,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  opportunity: Opportunity | null;
}) {
  const update = useUpdateOpportunity();
  const clients = useList<Client>('clients', { limit: 1000 });
  const stages = useList<PipelineStage>('pipeline-stages', { active: true, limit: 1000 });
  const employees = useList<{ id: number; firstName?: string; lastName?: string }>(
    'employees',
    { limit: 1000 },
  );

  const { register, control, handleSubmit, formState: { errors } } = useForm<CreateOpportunityInput>({
    resolver: zodResolver(createOpportunitySchema),
    values: opportunity
      ? {
          clientId: opportunity.clientId,
          responsibleEmployeeId: opportunity.responsibleEmployeeId,
          pipelineStageId: opportunity.pipelineStageId,
          areaId: opportunity.areaId ?? undefined,
          title: opportunity.title ?? undefined,
          amount: opportunity.amount ?? undefined,
        }
      : undefined,
  });

  const onSubmit = (values: CreateOpportunityInput) => {
    if (!opportunity) return;
    update.mutate({ id: opportunity.id, data: values }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar oportunidad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="edit-clientId">Cliente</Label>
            <Controller
              control={control}
              name="clientId"
              render={({ field }) => (
                <Combobox
                  id="edit-clientId"
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
            <Label htmlFor="edit-responsibleEmployeeId">Responsable</Label>
            <Controller
              control={control}
              name="responsibleEmployeeId"
              render={({ field }) => (
                <Combobox
                  id="edit-responsibleEmployeeId"
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
            {errors.responsibleEmployeeId && (
              <p className="text-xs text-destructive">Requerido</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-pipelineStageId">Etapa</Label>
            <Controller
              control={control}
              name="pipelineStageId"
              render={({ field }) => (
                <Combobox
                  id="edit-pipelineStageId"
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
            <Label htmlFor="edit-title">Título</Label>
            <Input id="edit-title" {...register('title')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-amount">Monto (GTQ)</Label>
            <Input
              id="edit-amount"
              type="number"
              min={0}
              step="0.01"
              {...register('amount')}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={update.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
