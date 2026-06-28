import { createResource } from '@/lib/resources/create-resource';
import { createPositionAreaSchema } from '@/lib/schemas/catalogs';
import type { PositionArea } from '@/lib/api/types/catalogs';
import { YesNoBadge } from '@/components/ui/yes-no-badge';

export const positionAreasResource = createResource<PositionArea, typeof createPositionAreaSchema>({
  key: 'position-areas',
  label: 'Áreas',
  singular: 'Área',
  endpoint: 'position-areas',
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
  formSchema: createPositionAreaSchema,
  formFields: [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'ej. Ventas' },
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
