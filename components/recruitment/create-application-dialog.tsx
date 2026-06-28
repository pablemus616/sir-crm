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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const candidates = useList<Candidate>('candidates', { limit: 100 });
  const opportunities = useList<Opportunity>('opportunities', { limit: 100 });

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

  const candidateItems: Record<string, string> = {};
  for (const c of candidates.data?.items ?? [])
    candidateItems[String(c.id)] = `${c.firstName} ${c.lastName}`;

  const opportunityItems: Record<string, string> = {};
  for (const o of opportunities.data?.items ?? [])
    opportunityItems[String(o.id)] = String(o.title ?? `Oportunidad #${o.id}`);

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
                      <Select
                        items={candidateItems}
                        value={field.value != null ? String(field.value) : ''}
                        onValueChange={(v) =>
                          field.onChange(v == null ? undefined : Number(v))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un candidato" />
                        </SelectTrigger>
                        <SelectContent>
                          {candidates.data?.items.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {`${c.firstName} ${c.lastName}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        items={opportunityItems}
                        value={field.value != null ? String(field.value) : ''}
                        onValueChange={(v) =>
                          field.onChange(v == null ? undefined : Number(v))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona una oportunidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {opportunities.data?.items.map((o) => (
                            <SelectItem key={o.id} value={String(o.id)}>
                              {o.title ?? `Oportunidad #${o.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
