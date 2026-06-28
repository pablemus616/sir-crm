import { createResource } from '@/lib/resources/create-resource';
import { createClientSchema } from '@/lib/schemas/commercial';
import type { Client } from '@/lib/api/types/commercial';
import { ClientContactsList } from '@/components/resource/client-detail';

export const clientsResource = createResource<Client, typeof createClientSchema>({
  key: 'clients',
  label: 'Clientes',
  singular: 'Cliente',
  endpoint: 'clients',
  access: 'auth',
  searchParam: 'search',
  columns: [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      id: 'sector',
      header: 'Sector',
      cell: ({ row }) => row.original.sector ?? '—',
    },
    {
      id: 'employeeSize',
      header: 'Empleados',
      cell: ({ row }) =>
        row.original.employeeSize != null ? String(row.original.employeeSize) : '—',
    },
  ],
  formSchema: createClientSchema,
  formFields: [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Empresa S.A.' },
    { name: 'sectorId', label: 'Sector', type: 'select', optionsEndpoint: 'sectors', placeholder: 'Seleccionar sector…' },
    { name: 'employeeSize', label: 'Tamaño (empleados)', type: 'number' },
  ],
  detailFields: [
    { label: 'Nombre', render: (r) => r.name },
    { label: 'Sector', render: (r) => r.sector ?? '—' },
    { label: 'Empleados', render: (r) => (r.employeeSize != null ? String(r.employeeSize) : '—') },
    { label: 'Contactos', render: (r) => <ClientContactsList clientId={r.id} /> },
  ],
  emptyFormValues: {
    name: '',
    sectorId: undefined,
    employeeSize: undefined,
  },
});
