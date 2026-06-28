import type { Metadata } from 'next';
import { ResourcePage } from '@/components/resource/resource-page';

export const metadata: Metadata = { title: 'Empleados · SIR CRM' };

export default function EmployeesPage() {
  return <ResourcePage resourceKey="employees" />;
}
