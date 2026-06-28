import type { Metadata } from 'next';
import { ResourcePage } from '@/components/resource/resource-page';

export const metadata: Metadata = { title: 'Áreas · SIR CRM' };

export default function PositionAreasPage() {
  return <ResourcePage resourceKey="position-areas" />;
}
