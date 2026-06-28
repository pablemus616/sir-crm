import { createResource } from '@/lib/resources/create-resource';
import { createContactTypeSchema } from '@/lib/schemas/catalogs';
import type { ContactType } from '@/lib/api/types/catalogs';

export const contactTypesResource = createResource<ContactType, typeof createContactTypeSchema>({
  key: 'contact-types',
  label: 'Tipos de contacto',
  singular: 'Tipo de contacto',
  endpoint: 'contact-types',
  access: 'admin',
  columns: [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
  ],
  formSchema: createContactTypeSchema,
  formFields: [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'ej. Llamada' },
  ],
  detailFields: [
    { label: 'Nombre', render: (r) => r.name },
  ],
  emptyFormValues: {
    name: '',
  },
});
