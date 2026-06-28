import { createResource } from '@/lib/resources/create-resource';
import { createClientContactSchema } from '@/lib/schemas/commercial';
import type { ClientContact } from '@/lib/api/types/commercial';

export const clientContactsResource = createResource<ClientContact, typeof createClientContactSchema>(
  {
    key: 'client-contacts',
    label: 'Contactos',
    singular: 'Contacto',
    endpoint: 'client-contacts',
    access: 'auth',
    searchParam: 'search',
    formSchema: createClientContactSchema,
    filters: [{ key: 'clientId', label: 'Cliente', type: 'select', optionsEndpoint: 'clients' }],
    columns: [
      { accessorKey: 'name', header: 'Nombre' },
      {
        id: 'phoneNumber',
        header: 'Teléfono',
        cell: ({ row }) => row.original.phoneNumber ?? '—',
      },
      {
        id: 'email',
        header: 'Correo',
        cell: ({ row }) => row.original.email ?? '—',
      },
      {
        id: 'client',
        header: 'Cliente',
        cell: ({ row }) => row.original.client?.name ?? `#${row.original.clientId}`,
      },
    ],
    formFields: [
      { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Juan Pérez' },
      { name: 'phoneNumber', label: 'Teléfono', type: 'text', placeholder: '+52 55 1234 5678' },
      { name: 'email', label: 'Correo', type: 'email', placeholder: 'juan@empresa.com' },
      { name: 'clientId', label: 'Cliente', type: 'select', optionsEndpoint: 'clients', placeholder: 'Seleccionar cliente…' },
    ],
    detailFields: [
      { label: 'Nombre', render: (r) => r.name },
      { label: 'Teléfono', render: (r) => r.phoneNumber ?? '—' },
      { label: 'Correo', render: (r) => r.email ?? '—' },
      { label: 'Cliente', render: (r) => r.client?.name ?? `#${r.clientId}` },
    ],
    emptyFormValues: {
      name: '',
      phoneNumber: '',
      email: '',
      clientId: undefined,
    },
  },
);
