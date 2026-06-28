import type { Seniority, OpportunityStatus, ContactDirection } from '@/lib/api/types/commercial';

export const seniorityLabels: Record<Seniority, string> = {
  junior: 'Junior',
  mid: 'Semi senior',
  senior: 'Senior',
  lead: 'Lead',
};

export const opportunityStatusLabels: Record<OpportunityStatus, string> = {
  open: 'Abierta',
  won: 'Ganada',
  lost: 'Perdida',
};

export const contactDirectionLabels: Record<ContactDirection, string> = {
  inbound: 'Entrante',
  outbound: 'Saliente',
};

export function opportunityStatusBadge(
  status: OpportunityStatus,
): 'default' | 'secondary' | 'destructive' {
  if (status === 'won') return 'default';
  if (status === 'lost') return 'destructive';
  return 'secondary';
}
