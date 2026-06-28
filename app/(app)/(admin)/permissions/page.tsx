import type { Metadata } from 'next';
import { ResourcePage } from '@/components/resource/resource-page';

export const metadata: Metadata = { title: 'Permisos · SIR CRM' };

export default function PermissionsPage() {
  return <ResourcePage resourceKey="permissions" />;
}
