import { useQuery } from '@tanstack/react-query';
import { apiGet } from './client';
import { buildMetricsQuery } from './metrics-query';
import type {
  ChartDatum, CommercialMetrics, ContactMetric, MetricsFilters,
  OverviewMetrics, PipelineStageMetric, PlacementMetric,
  RecruitmentFunnelStage, RequestsMetrics,
} from './metrics-types';

export const metricsKeys = {
  all: ['metrics'] as const,
  one: (name: string, filters: MetricsFilters) =>
    ['metrics', name, filters] as const,
};

function useMetric<T>(name: string, path: string, filters: MetricsFilters) {
  return useQuery({
    queryKey: metricsKeys.one(name, filters),
    queryFn: () => apiGet<T>(`metrics/${path}`, buildMetricsQuery(filters)),
  });
}

export const useOverview = (filters: MetricsFilters = {}) =>
  useQuery({
    queryKey: metricsKeys.one('overview', filters),
    queryFn: () => apiGet<OverviewMetrics>('metrics/overview', buildMetricsQuery(filters)),
  });

export const useCommercial = (f: MetricsFilters) =>
  useMetric<CommercialMetrics>('commercial', 'commercial', f);
export const usePipeline = (f: MetricsFilters) =>
  useMetric<PipelineStageMetric[]>('pipeline', 'pipeline', f);
export const useContacts = (f: MetricsFilters) =>
  useMetric<ContactMetric[]>('contacts', 'contacts', f);
export const useRequests = (f: MetricsFilters) =>
  useMetric<RequestsMetrics>('requests', 'requests', f);
export const useRecruitmentFunnel = (f: MetricsFilters) =>
  useMetric<RecruitmentFunnelStage[]>('recruitment-funnel', 'recruitment/funnel', f);
export const usePlacements = (f: MetricsFilters) =>
  useMetric<PlacementMetric[]>('placements', 'placements', f);
export const useChartByClient = (f: MetricsFilters) =>
  useMetric<ChartDatum[]>('chart-by-client', 'charts/by-client', f);
export const useChartBySector = (f: MetricsFilters) =>
  useMetric<ChartDatum[]>('chart-by-sector', 'charts/by-sector', f);
export const useChartByArea = (f: MetricsFilters) =>
  useMetric<ChartDatum[]>('chart-by-area', 'charts/by-area', f);
