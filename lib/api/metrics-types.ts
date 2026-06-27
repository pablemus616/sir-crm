export type OpportunityStatus = 'open' | 'won' | 'lost';

export interface MetricsFilters {
  from?: string;
  to?: string;
  sectorId?: number;
  areaId?: number;
  clientId?: number;
  responsibleEmployeeId?: number;
  recruiterId?: number;
  stageId?: number;
  status?: OpportunityStatus;
}

export interface OverviewMetrics {
  clients: number;
  openOpportunities: number;
  pipelineValue: number;
  activeCandidates: number;
  placementsThisMonth: number;
  pendingRequests: number;
}

export interface CommercialMetrics {
  totalOpportunities: number;
  totalWon: number;
  conversionWonTotal: number;
  conversionWonProposals: number;
  proposalsSent: number;
  proposalsAmount: number;
  wonValue: number;
  weightedValue: number;
}

export interface PipelineStageMetric {
  stageId: number;
  stageName: string;
  sortOrder: number;
  count: number;
  amount: number;
}

export interface ContactMetric {
  employeeId: number;
  contactTypeId: number | null;
  contactTypeName: string | null;
  direction: string;
  count: number;
  totalCallLength: number;
  avgCallLength: number;
}

export interface RequestsMetrics {
  total: number;
  handled: number;
  handleRate: number;
  converted: number;
  conversionRate: number;
  avgResponseSeconds: number;
}

export interface RecruitmentFunnelStage {
  stage: string;
  count: number;
}

export interface PlacementMetric {
  recruiterId: number;
  clientId: number;
  count: number;
  totalFee: number;
  avgTimeToFillSeconds: number;
}

export interface ChartDatum {
  clientId?: number | null;
  sectorId?: number | null;
  areaId?: number | null;
  clientName?: string | null;
  sectorName?: string | null;
  areaName?: string | null;
  opportunities: number;
  won: number;
  amount: number;
}
