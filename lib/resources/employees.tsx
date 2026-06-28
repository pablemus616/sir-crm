import { createResource } from '@/lib/resources/create-resource';
import { createEmployeeSchema } from '@/lib/schemas/admin';
import type { Employee } from '@/lib/api/types/admin';
import { formatGTQ, formatDate } from '@/lib/format';

export const employeesResource = createResource<Employee, typeof createEmployeeSchema>({
  key: 'employees',
  label: 'Empleados',
  singular: 'Empleado',
  endpoint: 'employees',
  access: 'admin',
  defaultLimit: 20,
  formContainer: 'sheet',
  columns: [
    {
      id: 'name',
      header: 'Nombre',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email ?? '—',
    },
    {
      id: 'phoneNumber',
      header: 'Teléfono',
      cell: ({ row }) => row.original.phoneNumber ?? '—',
    },
    {
      id: 'hireDate',
      header: 'Contratación',
      cell: ({ row }) =>
        row.original.hireDate ? formatDate(row.original.hireDate) : '—',
    },
    {
      id: 'salary',
      header: 'Salario',
      cell: ({ row }) =>
        row.original.salary != null ? formatGTQ(row.original.salary) : '—',
    },
  ],
  formSchema: createEmployeeSchema,
  formFields: [
    { name: 'firstName', label: 'Primer nombre', type: 'text', placeholder: 'Juan' },
    { name: 'secondName', label: 'Segundo nombre', type: 'text' },
    { name: 'lastName', label: 'Primer apellido', type: 'text', placeholder: 'Pérez' },
    { name: 'surName', label: 'Segundo apellido', type: 'text' },
    { name: 'nationalId', label: 'Documento (DPI)', type: 'text' },
    { name: 'phoneNumber', label: 'Teléfono', type: 'text', placeholder: '5555-5555' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'correo@ejemplo.com' },
    { name: 'birthDate', label: 'Fecha de nacimiento', type: 'date' },
    { name: 'hireDate', label: 'Fecha de contratación', type: 'date' },
    {
      name: 'salary',
      label: 'Salario',
      type: 'number',
      placeholder: 'Q 0.00',
      description: 'En quetzales (GTQ)',
    },
  ],
  detailFields: [
    {
      label: 'Nombre completo',
      render: (r) =>
        [r.firstName, r.secondName, r.lastName, r.surName].filter(Boolean).join(' '),
    },
    { label: 'Documento (DPI)', render: (r) => r.nationalId ?? '—' },
    { label: 'Teléfono', render: (r) => r.phoneNumber ?? '—' },
    { label: 'Email', render: (r) => r.email ?? '—' },
    { label: 'Fecha de nacimiento', render: (r) => (r.birthDate ? formatDate(r.birthDate) : '—') },
    { label: 'Fecha de contratación', render: (r) => (r.hireDate ? formatDate(r.hireDate) : '—') },
    { label: 'Salario', render: (r) => (r.salary != null ? formatGTQ(r.salary) : '—') },
  ],
  emptyFormValues: {
    firstName: '',
    secondName: '',
    lastName: '',
    surName: '',
    nationalId: '',
    phoneNumber: '',
    email: '',
    birthDate: '',
    hireDate: '',
    salary: undefined,
  },
});
