import type { Metadata } from 'next';
import { ContactHistoryView } from './contact-history-view';

export const metadata: Metadata = { title: 'Historial de contacto · SIR CRM' };

export default function ContactHistoryPage() {
  return <ContactHistoryView />;
}
