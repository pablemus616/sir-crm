import type { Metadata } from 'next';
import { ResourcePage } from '@/components/resource/resource-page';

export const metadata: Metadata = { title: 'Sectores · SIR CRM' };

export default function SectorsPage() {
  return <ResourcePage resourceKey="sectors" />;
}
