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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateApplication } from '@/lib/api/applications';
import { useList } from '@/lib/api/hooks';
import {
  createApplicationSchema,
  type CreateApplicationInput,
} from '@/lib/schemas/recruitment';
import type { Candidate } from '@/lib/api/types/recruitment';
import type { Opportunity } from '@/lib/api/types/commercial';

export function CreateApplicationDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateApplication();
  // Solo candidatos disponibles: sin placement, sin rechazo y sin proceso activo.
  const candidates = useList<Candidate>('candidates', {
    limit: 1000,
    available: true,
  });
  const opportunities = useList<Opportunity>('opportunities', { limit: 1000 });

  const form = useForm<CreateApplicationInput>({
    resolver: zodResolver(createApplicationSchema),
  });

  const onSubmit = (values: CreateApplicationInput) =>
    create.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nueva aplicación</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva aplicación</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="candidateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidato</FormLabel>
                    <FormControl>
                      <Combobox
                        options={(candidates.data?.items ?? []).map((c) => ({
                          label: `${c.firstName} ${c.lastName}`,
                          value: String(c.id),
                        }))}
                        value={field.value}
                        onChange={(v) =>
                          field.onChange(v == null ? undefined : Number(v))
                        }
                        loading={candidates.isLoading}
                        placeholder="Selecciona un candidato"
                        searchPlaceholder="Buscar candidato…"
                        emptyText="No hay candidatos disponibles"
                        triggerClassName="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="opportunityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oportunidad</FormLabel>
                    <FormControl>
                      <Combobox
                        options={(opportunities.data?.items ?? []).map((o) => ({
                          label: o.title ?? `Oportunidad #${o.id}`,
                          value: String(o.id),
                        }))}
                        value={field.value}
                        onChange={(v) =>
                          field.onChange(v == null ? undefined : Number(v))
                        }
                        loading={opportunities.isLoading}
                        placeholder="Selecciona una oportunidad"
                        searchPlaceholder="Buscar oportunidad…"
                        triggerClassName="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas opcionales sobre la aplicación"
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  Crear
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
