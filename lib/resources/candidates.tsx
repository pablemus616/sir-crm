import { createResource } from '@/lib/resources/create-resource';
import { createCandidateSchema } from '@/lib/schemas/recruitment';
import {
  CANDIDATE_STATUSES,
  type Candidate,
} from '@/lib/api/types/recruitment';
import {
  candidateStatusLabels,
  candidateStatusBadge,
} from '@/lib/domain/recruitment-labels';
import { formatGTQ, formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';

const statusOptions = CANDIDATE_STATUSES.map((status) => ({
  label: candidateStatusLabels[status],
  value: status,
}));

function fullName(c: Candidate): string {
  return `${c.firstName} ${c.lastName}`;
}

export const candidatesResource = createResource<Candidate, typeof createCandidateSchema>({
  key: 'candidates',
  label: 'Candidatos',
  singular: 'Candidato',
  endpoint: 'candidates',
  access: 'auth',
  searchParam: 'name',
  defaultLimit: 20,
  formContainer: 'sheet',
  columns: [
    {
      id: 'name',
      header: 'Nombre',
      cell: ({ row }) => fullName(row.original),
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
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={candidateStatusBadge(row.original.status)}>
          {candidateStatusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      id: 'expectedSalary',
      header: 'Salario esperado',
      cell: ({ row }) =>
        row.original.expectedSalary != null
          ? formatGTQ(row.original.expectedSalary)
          : '—',
    },
  ],
  formSchema: createCandidateSchema,
  formFields: [
    { name: 'firstName', label: 'Primer nombre', type: 'text', placeholder: 'Juan' },
    { name: 'secondName', label: 'Segundo nombre', type: 'text' },
    { name: 'lastName', label: 'Primer apellido', type: 'text', placeholder: 'Pérez' },
    { name: 'surName', label: 'Segundo apellido', type: 'text' },
    { name: 'nationalId', label: 'Documento (DPI)', type: 'text' },
    { name: 'phoneNumber', label: 'Teléfono', type: 'text', placeholder: '5555-5555' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'correo@ejemplo.com' },
    { name: 'birthDate', label: 'Fecha de nacimiento', type: 'date' },
    { name: 'headline', label: 'Titular', type: 'text', placeholder: 'ej. Desarrollador Full-Stack' },
    { name: 'source', label: 'Fuente', type: 'text', placeholder: 'ej. LinkedIn' },
    { name: 'expectedSalary', label: 'Salario esperado', type: 'number' },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      options: statusOptions,
      placeholder: 'Seleccionar estado…',
    },
    { name: 'notes', label: 'Notas', type: 'textarea' },
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
    { label: 'Titular', render: (r) => r.headline ?? '—' },
    { label: 'Fuente', render: (r) => r.source ?? '—' },
    {
      label: 'Salario esperado',
      render: (r) => (r.expectedSalary != null ? formatGTQ(r.expectedSalary) : '—'),
    },
    {
      label: 'Estado',
      render: (r) => (
        <Badge variant={candidateStatusBadge(r.status)}>
          {candidateStatusLabels[r.status]}
        </Badge>
      ),
    },
    { label: 'Notas', render: (r) => r.notes ?? '—' },
    { label: 'Alta', render: (r) => formatDate(r.createdAt) },
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
    headline: '',
    source: '',
    expectedSalary: undefined,
    status: undefined,
    notes: '',
  },
});
