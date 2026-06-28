import type {
  CandidateStatus,
  ApplicationStage,
  PlacementStatus,
} from '@/lib/api/types/recruitment';

/* ------------------------------------------------------------------ */
/* Labels (Spanish)                                                    */
/* ------------------------------------------------------------------ */

export const candidateStatusLabels: Record<CandidateStatus, string> = {
  new: 'Nuevo',
  active: 'Activo',
  placed: 'Colocado',
  on_hold: 'En espera',
  discarded: 'Descartado',
};

export const applicationStageLabels: Record<ApplicationStage, string> = {
  applied: 'Postulado',
  screening: 'Preselección',
  interview: 'Entrevista',
  offer: 'Oferta',
  hired: 'Contratado',
  rejected: 'Rechazado',
  withdrawn: 'Retirado',
};

export const placementStatusLabels: Record<PlacementStatus, string> = {
  active: 'Activa',
  ended: 'Finalizada',
  cancelled: 'Cancelada',
};

/* ------------------------------------------------------------------ */
/* Stage machine (mirrors backend ApplicationsService EXACTLY)         */
/* ------------------------------------------------------------------ */

export const APPLICATION_TRANSITIONS: Record<ApplicationStage, ApplicationStage[]> = {
  applied: ['screening', 'rejected', 'withdrawn'],
  screening: ['interview', 'rejected', 'withdrawn'],
  interview: ['offer', 'rejected', 'withdrawn'],
  offer: ['hired', 'rejected', 'withdrawn'],
  hired: [],
  rejected: [],
  withdrawn: [],
};

/** Allowed next stages from the given stage (empty array for terminal stages). */
export function allowedNextStages(stage: ApplicationStage): ApplicationStage[] {
  return APPLICATION_TRANSITIONS[stage];
}

/* ------------------------------------------------------------------ */
/* Badge-variant helpers (consistent with commercial-labels.ts)        */
/* ------------------------------------------------------------------ */

export function candidateStatusBadge(
  status: CandidateStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'placed') return 'default';
  if (status === 'discarded') return 'destructive';
  if (status === 'on_hold') return 'outline';
  return 'secondary';
}

export function applicationStageBadge(
  stage: ApplicationStage,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (stage === 'hired') return 'default';
  if (stage === 'rejected' || stage === 'withdrawn') return 'destructive';
  if (stage === 'offer') return 'outline';
  return 'secondary';
}

export function placementStatusBadge(
  status: PlacementStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'active') return 'default';
  if (status === 'cancelled') return 'destructive';
  return 'secondary';
}
