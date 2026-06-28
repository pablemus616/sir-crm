import type { Metadata } from 'next';
import { ResourceView } from '@/components/resource/resource-view';
import { clientsResource } from '@/lib/resources/clients';

export const metadata: Metadata = { title: 'Clientes · SIR CRM' };

export default function ClientsPage() {
  return <ResourceView resource={clientsResource} />;
}
