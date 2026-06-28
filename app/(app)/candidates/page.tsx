import type { Metadata } from 'next';
import { ResourcePage } from '@/components/resource/resource-page';

export const metadata: Metadata = { title: 'Candidatos · SIR CRM' };

export default function CandidatesPage() {
  return <ResourcePage resourceKey="candidates" />;
}
