import type { Metadata } from 'next';
import { PlacementsView } from './placements-view';

export const metadata: Metadata = { title: 'Placements · SIR CRM' };

export default function PlacementsPage() {
  return <PlacementsView />;
}
