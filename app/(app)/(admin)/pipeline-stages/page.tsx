import type { Metadata } from 'next';
import { ResourcePage } from '@/components/resource/resource-page';

export const metadata: Metadata = { title: 'Etapas · SIR CRM' };

export default function PipelineStagesPage() {
  return <ResourcePage resourceKey="pipeline-stages" />;
}
