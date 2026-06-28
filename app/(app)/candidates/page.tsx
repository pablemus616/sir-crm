import type { Metadata } from 'next';
import { ResourceView } from '@/components/resource/resource-view';
import { candidatesResource } from '@/lib/resources/candidates';

export const metadata: Metadata = { title: 'Candidatos · SIR CRM' };

export default function CandidatesPage() {
  return <ResourceView resource={candidatesResource} />;
}
