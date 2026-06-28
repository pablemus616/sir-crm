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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePlacement } from '@/lib/api/placements';
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

/** Centinela para el item "Sin estado": base-ui Select nunca emite '' al
 *  seleccionar, así que mapeamos esta opción a undefined para volver al default
 *  del servidor. */
const NO_STATUS = '__none__';

export function CreatePlacementDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreatePlacement();
  const applications = useApplications({ limit: 200 });

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

  const applicationItems: Record<string, string> = {};
  for (const a of (applications.data?.items ?? []).filter(
    (a) => a.stage !== 'rejected' && a.stage !== 'withdrawn',
  ))
    applicationItems[String(a.id)] = `${a.candidate?.firstName ?? 'Candidato'} ${
      a.candidate?.lastName ?? `#${a.candidateId}`
    } — ${
      a.opportunity?.title ?? `Oportunidad #${a.opportunityId}`
    } (${applicationStageLabels[a.stage]})`;

  const statusItems: Record<string, string> = {};
  for (const s of PLACEMENT_STATUSES) statusItems[s] = placementStatusLabels[s];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nuevo placement</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                      <Select
                        items={applicationItems}
                        value={field.value != null ? String(field.value) : ''}
                        onValueChange={(v) =>
                          field.onChange(v == null ? undefined : Number(v))
                        }
                      >
                        <SelectTrigger className="w-full" aria-required>
                          <SelectValue placeholder="Selecciona una aplicación" />
                        </SelectTrigger>
                        <SelectContent>
                          {applications.data?.items
                            .filter(
                              (a) =>
                                a.stage !== 'rejected' &&
                                a.stage !== 'withdrawn',
                            )
                            .map((a) => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {`${a.candidate?.firstName ?? 'Candidato'} ${
                                a.candidate?.lastName ?? `#${a.candidateId}`
                              } — ${
                                a.opportunity?.title ??
                                `Oportunidad #${a.opportunityId}`
                              } (${applicationStageLabels[a.stage]})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        items={statusItems}
                        value={field.value ?? ''}
                        onValueChange={(v) =>
                          field.onChange(
                            v == null || v === NO_STATUS ? undefined : v,
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_STATUS}>Sin estado</SelectItem>
                          {PLACEMENT_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {placementStatusLabels[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
