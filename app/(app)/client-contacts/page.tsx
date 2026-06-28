import type { Metadata } from 'next';
import { ResourcePage } from '@/components/resource/resource-page';

export const metadata: Metadata = { title: 'Contactos · SIR CRM' };

export default function ClientContactsPage() {
  return <ResourcePage resourceKey="client-contacts" />;
}
