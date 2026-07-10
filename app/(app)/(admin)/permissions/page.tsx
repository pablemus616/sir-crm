import type { Metadata } from 'next';
import { PermissionsBoard } from '@/components/admin/permissions-board';

export const metadata: Metadata = { title: 'Permisos · SIR CRM' };

export default function PermissionsPage() {
  return <PermissionsBoard />;
}
