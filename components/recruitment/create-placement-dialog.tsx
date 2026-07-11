'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePlacement, usePlacements } from '@/lib/api/placements';
import { useApplications } from '@/lib/api/applications';
import {
  createPlacementSchema,
  type CreatePlacementInput,
} from '@/lib/schemas/recruitment';
import { PLACEMENT_STATUSES } from '@/lib/api/types/recruitment';
import {
  placementStatusLabels,
  applicationStageLabels,
} from '@/lib/domain/recruitment-labels';

export function CreatePlacementDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreatePlacement();
  const applications = useApplications({ limit: 1000 });
  const placements = usePlacements({ limit: 1000 });

  const form = useForm<CreatePlacementInput>({
    resolver: zodResolver(createPlacementSchema),
  });

  const onSubmit = (values: CreatePlacementInput) =>
    create.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });

  // La verdad de "ya tiene placement" es la fila de placement, no la etapa: una
  // app puede estar 'hired' (por movimiento manual de etapa) y aún no tener
  // placement. Excluimos por existencia de placement, no por la etapa 'hired'.
  const placedApplicationIds = new Set(
    (placements.data?.items ?? []).map((p) => p.applicationId),
  );

  const applicationOptions = (applications.data?.items ?? [])
    // 'rejected'/'withdrawn' no son colocables; el resto es colocable mientras
    // no tenga ya un placement registrado.
    .filter(
      (a) =>
        a.stage !== 'rejected' &&
        a.stage !== 'withdrawn' &&
        !placedApplicationIds.has(a.id),
    )
    .map((a) => ({
      value: String(a.id),
      label: `${a.candidate?.firstName ?? 'Candidato'} ${
        a.candidate?.lastName ?? `#${a.candidateId}`
      } — ${
        a.opportunity?.title ?? `Oportunidad #${a.opportunityId}`
      } (${applicationStageLabels[a.stage]})`,
    }));

  const statusOptions = PLACEMENT_STATUSES.map((s) => ({
    value: s,
    label: placementStatusLabels[s],
  }));

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nuevo placement</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nuevo placement</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="applicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Aplicación <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={applicationOptions}
                        value={field.value}
                        onChange={(v) =>
                          field.onChange(v == null ? undefined : Number(v))
                        }
                        loading={applications.isLoading || placements.isLoading}
                        placeholder="Selecciona una aplicación"
                        searchPlaceholder="Buscar aplicación…"
                        triggerClassName="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Al registrar el placement la aplicación pasa a Contratado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="placementDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Fecha de colocación{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        aria-required
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de inicio</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de fin</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="endReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo de fin</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Motivo opcional del cierre del placement"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="agreedSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salario acordado</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormDescription>En GTQ.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormDescription>En GTQ.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Combobox
                        options={statusOptions}
                        value={field.value ?? undefined}
                        onChange={(v) => field.onChange(v ?? undefined)}
                        clearable
                        clearLabel="Sin estado"
                        placeholder="Selecciona un estado"
                        searchPlaceholder="Buscar estado…"
                        triggerClassName="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  Registrar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
