import type { Metadata } from 'next';
import { ResourcePage } from '@/components/resource/resource-page';

export const metadata: Metadata = { title: 'Clientes · SIR CRM' };

export default function ClientsPage() {
  return <ResourcePage resourceKey="clients" />;
}
