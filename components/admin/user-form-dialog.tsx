'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useList } from '@/lib/api/hooks';
import { useCreateUser, useUpdateUser } from '@/lib/api/users';
import { createUserSchema, updateUserSchema, type CreateUserInput } from '@/lib/schemas/admin';
import type { Employee, User } from '@/lib/api/types/admin';

/** Centinela para el item placeholder (cargando / vacío): base-ui Select exige
 *  un `value` en cada Item; este nunca se selecciona porque va deshabilitado. */
const PLACEHOLDER = '__placeholder__';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si viene, el diálogo opera en modo edición; si no, en modo alta. */
  user?: User;
}

/**
 * Diálogo controlado de alta/edición de usuario. La asimetría clave: la
 * contraseña es OBLIGATORIA al crear y OPCIONAL al editar (en blanco no la
 * cambia), por eso elegimos el schema según el modo. El empleado se elige de un
 * combo (no se teclea el id).
 */
export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEdit = !!user;
  const create = useCreateUser();
  const update = useUpdateUser();
  const employees = useList<Employee>('employees', { limit: 500 });

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(
      isEdit ? updateUserSchema : createUserSchema,
    ) as Resolver<CreateUserInput>,
    defaultValues: {
      username: '',
      password: '',
      employeeId: undefined as unknown as number,
    },
  });

  // Reinicia los campos al abrir o al cambiar de usuario objetivo.
  useEffect(() => {
    if (!open) return;
    form.reset(
      user
        ? { username: user.username, password: '', employeeId: user.employeeId }
        : { username: '', password: '', employeeId: undefined as unknown as number },
    );
  }, [open, user, form]);

  const pending = create.isPending || update.isPending;

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: CreateUserInput) => {
    if (user) {
      update.mutate({ id: user.id, ...values }, { onSuccess: handleClose });
    } else {
      create.mutate(values, { onSuccess: handleClose });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza los datos de acceso del usuario.'
              : 'Crea un usuario de acceso vinculado a un empleado.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Usuario <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nombre.apellido"
                      autoComplete="off"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Contraseña{' '}
                    {!isEdit && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder={isEdit ? '••••••••' : 'Contraseña inicial'}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  {isEdit && (
                    <FormDescription>
                      Dejar en blanco para no cambiarla.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Empleado <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value != null ? String(field.value) : ''}
                      onValueChange={(v) =>
                        field.onChange(v == null ? undefined : Number(v))
                      }
                    >
                      <SelectTrigger className="w-full" aria-required>
                        <SelectValue placeholder="Selecciona un empleado" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.isLoading ? (
                          <SelectItem value={PLACEHOLDER} disabled>
                            Cargando…
                          </SelectItem>
                        ) : (employees.data?.items.length ?? 0) === 0 ? (
                          <SelectItem value={PLACEHOLDER} disabled>
                            No hay empleados disponibles
                          </SelectItem>
                        ) : (
                          employees.data?.items.map((e) => (
                            <SelectItem key={e.id} value={String(e.id)}>
                              {`${e.firstName} ${e.lastName}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {isEdit ? 'Guardar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
