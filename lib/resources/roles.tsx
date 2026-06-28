import { createResource } from '@/lib/resources/create-resource';
import { createRoleSchema } from '@/lib/schemas/admin';
import type { Role } from '@/lib/api/types/admin';
import { Badge } from '@/components/ui/badge';
import { RolePermissionsEditor } from '@/components/admin/role-permissions-editor';

export const rolesResource = createResource<Role, typeof createRoleSchema>({
  key: 'roles',
  label: 'Roles',
  singular: 'Rol',
  endpoint: 'roles',
  access: 'admin',
  columns: [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      id: 'permissions',
      header: 'Permisos',
      cell: ({ row }) => {
        const perms = row.original.permissions ?? [];
        if (perms.length === 0)
          return <span className="text-muted-foreground">Sin permisos</span>;
        return (
          <span className="flex flex-wrap gap-1">
            {perms.slice(0, 3).map((p) => (
              <Badge key={p.id} variant="secondary">
                {p.name}
              </Badge>
            ))}
            {perms.length > 3 && (
              <Badge variant="outline">+{perms.length - 3}</Badge>
            )}
          </span>
        );
      },
    },
  ],
  formSchema: createRoleSchema,
  formFields: [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'ej. reclutador' },
  ],
  detailFields: [
    { label: 'Nombre', render: (r) => r.name },
    { label: 'Permisos', render: (r) => <RolePermissionsEditor roleId={r.id} /> },
  ],
  emptyFormValues: {
    name: '',
  },
});
