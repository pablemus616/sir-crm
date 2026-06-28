import type { Metadata } from 'next';
import { ResourceView } from '@/components/resource/resource-view';
import { clientContactsResource } from '@/lib/resources/client-contacts';

export const metadata: Metadata = { title: 'Contactos · SIR CRM' };

export default function ClientContactsPage() {
  return <ResourceView resource={clientContactsResource} />;
}
