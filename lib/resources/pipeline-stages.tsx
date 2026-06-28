import { createResource } from '@/lib/resources/create-resource';
import { createPipelineStageSchema } from '@/lib/schemas/catalogs';
import type { PipelineStage } from '@/lib/api/types/commercial';
import { YesNoBadge } from '@/components/ui/yes-no-badge';

export const pipelineStagesResource = createResource<PipelineStage, typeof createPipelineStageSchema>({
  key: 'pipeline-stages',
  label: 'Etapas',
  singular: 'Etapa',
  endpoint: 'pipeline-stages',
  access: 'admin',
  defaultLimit: 100,
  filters: [{ key: 'active', label: 'Solo activas', type: 'toggle' }],
  columns: [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      id: 'sortOrder',
      header: 'Orden',
      cell: ({ row }) => String(row.original.sortOrder),
    },
    {
      id: 'probability',
      header: 'Probabilidad',
      cell: ({ row }) => `${row.original.probability}%`,
    },
    {
      id: 'isWon',
      header: 'Ganadora',
      cell: ({ row }) => <YesNoBadge value={row.original.isWon} />,
    },
    {
      id: 'isLost',
      header: 'Perdedora',
      cell: ({ row }) => <YesNoBadge value={row.original.isLost} />,
    },
    {
      id: 'active',
      header: 'Activa',
      cell: ({ row }) => <YesNoBadge value={row.original.active} />,
    },
  ],
  formSchema: createPipelineStageSchema,
  formFields: [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'ej. Prospección' },
    { name: 'sortOrder', label: 'Orden', type: 'number' },
    {
      name: 'probability',
      label: 'Probabilidad',
      type: 'number',
      description: 'Entre 0 y 100',
    },
    { name: 'isWon', label: 'Ganadora', type: 'switch' },
    { name: 'isLost', label: 'Perdedora', type: 'switch' },
    { name: 'active', label: 'Activa', type: 'switch' },
  ],
  detailFields: [
    { label: 'Nombre', render: (r) => r.name },
    { label: 'Orden', render: (r) => String(r.sortOrder) },
    { label: 'Probabilidad', render: (r) => `${r.probability}%` },
    { label: 'Ganadora', render: (r) => <YesNoBadge value={r.isWon} /> },
    { label: 'Perdedora', render: (r) => <YesNoBadge value={r.isLost} /> },
    { label: 'Activa', render: (r) => <YesNoBadge value={r.active} /> },
  ],
  emptyFormValues: {
    name: '',
    sortOrder: undefined,
    probability: undefined,
    isWon: false,
    isLost: false,
    active: true,
  },
});
