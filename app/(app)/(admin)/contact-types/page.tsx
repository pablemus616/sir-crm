import type { Metadata } from 'next';
import { ResourceView } from '@/components/resource/resource-view';
import { contactTypesResource } from '@/lib/resources/contact-types';

export const metadata: Metadata = { title: 'Tipos de contacto · SIR CRM' };

export default function ContactTypesPage() {
  return <ResourceView resource={contactTypesResource} />;
}
