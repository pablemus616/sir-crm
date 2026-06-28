'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  const clients = useList<Client>('clients', { limit: 100 });
  const stages = useList<PipelineStage>('pipeline-stages', { active: true, limit: 100 });
  const employees = useList<{ id: number; firstName?: string; lastName?: string }>('employees', { limit: 100 });
  const { register, handleSubmit, formState: { errors } } = useForm<CreateOpportunityInput>({
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
            <select id="clientId" className="w-full rounded-md border border-input bg-background p-2 text-sm"
              {...register('clientId')}>
              <option value="">Selecciona…</option>
              {clients.data?.items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.clientId && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="responsibleEmployeeId">Responsable</Label>
            <select id="responsibleEmployeeId" className="w-full rounded-md border border-input bg-background p-2 text-sm"
              {...register('responsibleEmployeeId')}>
              <option value="">Selecciona…</option>
              {employees.data?.items.map((e) => (
                <option key={e.id} value={e.id}>{[e.firstName, e.lastName].filter(Boolean).join(' ') || `#${e.id}`}</option>
              ))}
            </select>
            {errors.responsibleEmployeeId && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="pipelineStageId">Etapa</Label>
            <select id="pipelineStageId" className="w-full rounded-md border border-input bg-background p-2 text-sm"
              {...register('pipelineStageId')}>
              <option value="">Selecciona…</option>
              {stages.data?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
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
