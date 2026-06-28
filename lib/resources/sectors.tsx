import { createResource } from '@/lib/resources/create-resource';
import { createSectorSchema } from '@/lib/schemas/catalogs';
import type { Sector } from '@/lib/api/types/catalogs';
import { YesNoBadge } from '@/components/ui/yes-no-badge';

export const sectorsResource = createResource<Sector, typeof createSectorSchema>({
  key: 'sectors',
  label: 'Sectores',
  singular: 'Sector',
  endpoint: 'sectors',
  access: 'admin',
  columns: [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      id: 'active',
      header: 'Activo',
      cell: ({ row }) => <YesNoBadge value={row.original.active} />,
    },
  ],
  formSchema: createSectorSchema,
  formFields: [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'ej. Tecnología' },
    { name: 'active', label: 'Activo', type: 'switch' },
  ],
  detailFields: [
    { label: 'Nombre', render: (r) => r.name },
    { label: 'Activo', render: (r) => <YesNoBadge value={r.active} /> },
  ],
  emptyFormValues: {
    name: '',
    active: true,
  },
});
