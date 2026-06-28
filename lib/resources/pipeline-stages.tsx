import { createResource } from '@/lib/resources/create-resource';
import { createPipelineStageSchema } from '@/lib/schemas/catalogs';
import type { PipelineStage } from '@/lib/api/types/commercial';

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
      cell: ({ row }) => (row.original.isWon ? 'Sí' : 'No'),
    },
    {
      id: 'isLost',
      header: 'Perdedora',
      cell: ({ row }) => (row.original.isLost ? 'Sí' : 'No'),
    },
    {
      id: 'active',
      header: 'Activa',
      cell: ({ row }) => (row.original.active ? 'Sí' : 'No'),
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
    { label: 'Ganadora', render: (r) => (r.isWon ? 'Sí' : 'No') },
    { label: 'Perdedora', render: (r) => (r.isLost ? 'Sí' : 'No') },
    { label: 'Activa', render: (r) => (r.active ? 'Sí' : 'No') },
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
