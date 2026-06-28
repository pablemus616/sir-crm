export type Seniority = 'junior' | 'mid' | 'senior' | 'lead';
export type OpportunityStatus = 'open' | 'won' | 'lost';
export type ContactDirection = 'inbound' | 'outbound';

export interface PipelineStage {
  id: number;
  name: string;
  sortOrder: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
  active: boolean;
}

export interface Client {
  id: number;
  name: string;
  sector?: string | null;
  sectorId?: number | null;
  employeeSize?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientContact {
  id: number;
  name: string;
  phoneNumber?: string | null;
  email?: string | null;
  clientId: number;
  client?: Client;
}

export interface Opportunity {
  id: number;
  clientId: number;
  client?: Client;
  areaId?: number | null;
  area?: { id: number; name: string } | null;
  responsibleEmployeeId: number;
  responsibleEmployee?: { id: number; firstName?: string; lastName?: string } | null;
  clientContactId?: number | null;
  clientContact?: ClientContact | null;
  pipelineStageId: number;
  pipelineStage?: PipelineStage;
  originContactRequestId?: number | null;
  title?: string | null;
  seniority?: Seniority | null;
  headcount: number;
  probability: number;
  amount?: number | null;
  currency: string;
  status: OpportunityStatus;
  source?: string | null;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  expectedCloseDate?: string | null;
  proposalSentAt?: string | null;
  wonAt?: string | null;
  lostAt?: string | null;
  lostReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactRequest {
  id: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  wasHandled: boolean;
  handledByEmployeeId?: number | null;
  resultingClientId?: number | null;
  createdAt: string;
}

export interface ContactHistory {
  id: number;
  contactId: number;
  contact?: ClientContact | null;
  contactType?: { id: number; name: string } | null;
  contactTime: string;
  callLength?: number | null;
  contactDesc?: string | null;
  phoneNumberDialed?: string | null;
  direction?: ContactDirection | null;
  opportunityId?: number | null;
  opportunity?: { id: number; title?: string | null } | null;
  employeeId?: number | null;
  employee?: { id: number; firstName?: string; lastName?: string } | null;
}
