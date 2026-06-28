import type { Metadata } from 'next';
import { ResourcePage } from '@/components/resource/resource-page';

export const metadata: Metadata = { title: 'Roles · SIR CRM' };

export default function RolesPage() {
  return <ResourcePage resourceKey="roles" />;
}
