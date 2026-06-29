import type { Metadata } from 'next';
import { CandidateContactsView } from './candidate-contacts-view';

export const metadata: Metadata = { title: 'Interacciones con candidatos · SIR CRM' };

export default function CandidateContactsPage() {
  return <CandidateContactsView />;
}
