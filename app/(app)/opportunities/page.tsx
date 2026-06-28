import type { Metadata } from 'next';
import { OpportunitiesView } from './opportunities-view';

export const metadata: Metadata = { title: 'Oportunidades · SIR CRM' };

export default function OpportunitiesPage() {
  return <OpportunitiesView />;
}
