'use client';

import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useList } from '@/lib/api/hooks';
import { useUsers, useDeleteUser } from '@/lib/api/users';
import { UserFormDialog } from '@/components/admin/user-form-dialog';
import { UserRolesEditor } from '@/components/admin/user-roles-editor';
import type { Employee, User } from '@/lib/api/types/admin';

const COLUMNS = ['Usuario', 'Empleado', 'Roles', 'Acciones'];

export function UsersView() {
  const { data, isLoading, isError } = useUsers();
  // employeeId llega como escalar en /users; el nombre se une en cliente. El cap
  // de 500 cubre el catálogo actual de empleados (sin búsqueda en el endpoint).
  const employees = useList<Employee>('employees', { limit: 500 });
  const remove = useDeleteUser();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | undefined>(undefined);
  const [rolesUser, setRolesUser] = useState<User | null>(null);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);

  const employeeNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const e of employees.data?.items ?? []) {
      map.set(e.id, `${e.firstName} ${e.lastName}`);
    }
    return map;
  }, [employees.data]);

  const items = data?.items ?? [];

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (u: User) => {
    setEditing(u);
    setFormOpen(true);
  };
  const confirmDelete = () => {
    if (pendingDelete) remove.mutate(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Usuarios
        </h1>
        <Button onClick={openCreate}>Nuevo usuario</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((c) => (
              <TableHead key={c}>{c}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {COLUMNS.map((c) => (
                  <TableCell key={c}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="py-8 text-center text-sm text-destructive"
              >
                No se pudieron cargar los usuarios.
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                No hay usuarios.
              </TableCell>
            </TableRow>
          ) : (
            items.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-foreground">
                  {u.username}
                </TableCell>
                <TableCell>
                  {employeeNames.get(u.employeeId) ?? `Empleado #${u.employeeId}`}
                </TableCell>
                <TableCell>
                  {u.roles && u.roles.length > 0 ? (
                    <ul className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <li key={r.id}>
                          <Badge variant="secondary">{r.name}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(u)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRolesUser(u)}
                    >
                      Roles
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete(u)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <UserFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(undefined);
        }}
        user={editing}
      />

      <Dialog
        open={rolesUser != null}
        onOpenChange={(o) => !o && setRolesUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Roles de {rolesUser?.username}</DialogTitle>
            <DialogDescription>
              Asigna o quita roles. Los cambios se guardan al instante.
            </DialogDescription>
          </DialogHeader>
          {rolesUser && <UserRolesEditor userId={rolesUser.id} />}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete != null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el acceso de{' '}
              <span className="font-medium text-foreground">
                {pendingDelete?.username}
              </span>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
