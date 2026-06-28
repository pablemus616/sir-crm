import type { Metadata } from 'next';
import { ResourceView } from '@/components/resource/resource-view';
import { sectorsResource } from '@/lib/resources/sectors';

export const metadata: Metadata = { title: 'Sectores · SIR CRM' };

export default function SectorsPage() {
  return <ResourceView resource={sectorsResource} />;
}
