import type { Metadata } from 'next';
import { ResourceView } from '@/components/resource/resource-view';
import { employeesResource } from '@/lib/resources/employees';

export const metadata: Metadata = { title: 'Empleados · SIR CRM' };

export default function EmployeesPage() {
  return <ResourceView resource={employeesResource} />;
}
