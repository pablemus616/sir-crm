import type { Metadata } from 'next';
import { ResourceView } from '@/components/resource/resource-view';
import { permissionsResource } from '@/lib/resources/permissions';

export const metadata: Metadata = { title: 'Permisos · SIR CRM' };

export default function PermissionsPage() {
  return <ResourceView resource={permissionsResource} />;
}
