import type { Opportunity } from '@/lib/api/types/commercial';

/** Resumen de empleado tal como llega embebido en relaciones (leftJoinAndSelect parcial). */
export interface EmployeeRef {
  id: number;
  firstName?: string;
  lastName?: string;
}

/* ------------------------------------------------------------------ */
/* Candidates                                                          */
/* ------------------------------------------------------------------ */

export const CANDIDATE_STATUSES = [
  'new',
  'active',
  'placed',
  'on_hold',
  'discarded',
] as const;
export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

export interface Candidate {
  id: number;
  firstName: string;
  secondName?: string | null;
  lastName: string;
  surName?: string | null;
  nationalId?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  birthDate?: string | null;
  headline?: string | null;
  source?: string | null;
  expectedSalary?: number | null;
  status: CandidateStatus;
  notes?: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Applications                                                        */
/* ------------------------------------------------------------------ */

export const APPLICATION_STAGES = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
] as const;
export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export interface Application {
  id: number;
  candidateId: number;
  candidate?: Candidate | null;
  opportunityId: number;
  opportunity?: Opportunity | null;
  referredByEmployeeId?: number | null;
  referredBy?: EmployeeRef | null;
  stage: ApplicationStage;
  source?: string | null;
  notes?: string | null;
  appliedAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Placements                                                          */
/* ------------------------------------------------------------------ */

export const PLACEMENT_STATUSES = ['active', 'ended', 'cancelled'] as const;
export type PlacementStatus = (typeof PLACEMENT_STATUSES)[number];

export interface Placement {
  id: number;
  applicationId: number;
  application?: Application | null;
  candidateId: number;
  candidate?: Candidate | null;
  opportunityId: number;
  opportunity?: Opportunity | null;
  placedByEmployeeId: number;
  placedBy?: EmployeeRef | null;
  placementDate: string;
  startDate?: string | null;
  endDate?: string | null;
  endReason?: string | null;
  agreedSalary?: number | null;
  fee?: number | null;
  status: PlacementStatus;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Candidate Contacts                                                  */
/* ------------------------------------------------------------------ */

export interface CandidateContactRecruiter {
  id: number;
  firstName?: string;
  secondName?: string | null;
  lastName?: string;
  surName?: string | null;
}

export interface CandidateContactCandidate {
  id: number;
  firstName: string;
  secondName?: string | null;
  lastName: string;
  surName?: string | null;
}

export interface CandidateContact {
  id: number;
  candidateId: number;
  opportunityId?: number | null;
  contactType?: { id: number; name: string } | null;
  contactTime: string;
  callLength?: number | null;
  contactDesc?: string | null;
  phoneNumberDialed?: string | null;
  direction?: 'inbound' | 'outbound' | null;
  recruiterEmployeeId: number;
  recruiter?: CandidateContactRecruiter | null;
  candidate?: CandidateContactCandidate | null;
  opportunity?: { id: number; title?: string | null } | null;
  createdAt: string;
}
