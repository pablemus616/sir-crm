import type { Metadata } from 'next';
import { ResourceView } from '@/components/resource/resource-view';
import { positionAreasResource } from '@/lib/resources/position-areas';

export const metadata: Metadata = { title: 'Áreas · SIR CRM' };

export default function PositionAreasPage() {
  return <ResourceView resource={positionAreasResource} />;
}
