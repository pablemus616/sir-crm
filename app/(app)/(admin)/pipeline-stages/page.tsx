import type { Metadata } from 'next';
import { ResourceView } from '@/components/resource/resource-view';
import { pipelineStagesResource } from '@/lib/resources/pipeline-stages';

export const metadata: Metadata = { title: 'Etapas · SIR CRM' };

export default function PipelineStagesPage() {
  return <ResourceView resource={pipelineStagesResource} />;
}
