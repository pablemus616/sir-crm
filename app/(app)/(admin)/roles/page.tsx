import type { Metadata } from 'next';
import { ResourceView } from '@/components/resource/resource-view';
import { rolesResource } from '@/lib/resources/roles';

export const metadata: Metadata = { title: 'Roles · SIR CRM' };

export default function RolesPage() {
  return <ResourceView resource={rolesResource} />;
}
