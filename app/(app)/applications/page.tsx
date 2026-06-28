import type { Metadata } from 'next';
import { ApplicationsView } from './applications-view';

export const metadata: Metadata = { title: 'Aplicaciones · SIR CRM' };

export default function ApplicationsPage() {
  return <ApplicationsView />;
}
