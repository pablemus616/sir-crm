import type { Metadata } from 'next';
import { RequestsInbox } from './requests-inbox';

export const metadata: Metadata = { title: 'Solicitudes · SIR CRM' };

export default function ContactRequestsPage() {
  return <RequestsInbox />;
}
