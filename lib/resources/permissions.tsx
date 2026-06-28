import { createResource } from '@/lib/resources/create-resource';
import { createPermissionSchema } from '@/lib/schemas/admin';
import type { Permission } from '@/lib/api/types/admin';

export const permissionsResource = createResource<Permission, typeof createPermissionSchema>({
  key: 'permissions',
  label: 'Permisos',
  singular: 'Permiso',
  endpoint: 'permissions',
  access: 'admin',
  columns: [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
  ],
  formSchema: createPermissionSchema,
  formFields: [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'ej. manage_users' },
  ],
  detailFields: [
    { label: 'Nombre', render: (r) => r.name },
  ],
  emptyFormValues: {
    name: '',
  },
});
