import type { Metadata } from 'next';
import { ResourcePage } from '@/components/resource/resource-page';

export const metadata: Metadata = { title: 'Tipos de contacto · SIR CRM' };

export default function ContactTypesPage() {
  return <ResourcePage resourceKey="contact-types" />;
}
