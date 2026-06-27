import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/lib/test/query-wrapper';
import { useOverview, useChartBySector, usePipeline } from '../metrics';
import type {
  OverviewMetrics,
  PipelineStageMetric,
  ChartDatum,
} from '../metrics-types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetch<T>(data: T) {
  const envelope = { ok: true, message: '', data };
  const urls: string[] = [];

  const mock = vi.fn((input: RequestInfo | URL) => {
    urls.push(typeof input === 'string' ? input : (input as URL).toString());
    return Promise.resolve(
      new Response(JSON.stringify(envelope), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  vi.stubGlobal('fetch', mock);

  return { urls };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// useOverview
// ---------------------------------------------------------------------------

describe('useOverview', () => {
  const overviewData: OverviewMetrics = {
    clients: 10,
    openOpportunities: 5,
    pipelineValue: 120000,
    activeCandidates: 3,
    placementsThisMonth: 2,
    pendingRequests: 1,
  };

  it('calls /api/proxy/metrics/overview with no query string when no filters', async () => {
    const { urls } = mockFetch(overviewData);
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useOverview(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(urls[0]).toBe('/api/proxy/metrics/overview');
    expect(result.current.data).toEqual(overviewData);
  });

  it('includes filter params in the URL when filters are provided', async () => {
    const { urls } = mockFetch(overviewData);
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => useOverview({ from: '2026-01-01', sectorId: 3 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(urls[0]).toContain('from=2026-01-01');
    expect(urls[0]).toContain('sectorId=3');
    expect(urls[0]).toMatch(/^\/api\/proxy\/metrics\/overview\?/);
    expect(result.current.data).toEqual(overviewData);
  });

  it('returns typed OverviewMetrics data', async () => {
    mockFetch(overviewData);
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useOverview(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data;
    expect(typeof data?.clients).toBe('number');
    expect(typeof data?.pipelineValue).toBe('number');
    expect(typeof data?.pendingRequests).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// usePipeline (parameterised list hook)
// ---------------------------------------------------------------------------

describe('usePipeline', () => {
  const pipelineData: PipelineStageMetric[] = [
    { stageId: 1, stageName: 'Prospecto', sortOrder: 1, count: 4, amount: 8000 },
    { stageId: 2, stageName: 'Propuesta', sortOrder: 2, count: 2, amount: 20000 },
  ];

  it('calls /api/proxy/metrics/pipeline with filter params in the URL', async () => {
    const { urls } = mockFetch(pipelineData);
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => usePipeline({ from: '2026-01-01', sectorId: 3 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(urls[0]).toMatch(/^\/api\/proxy\/metrics\/pipeline\?/);
    expect(urls[0]).toContain('from=2026-01-01');
    expect(urls[0]).toContain('sectorId=3');
  });

  it('returns typed PipelineStageMetric[] data', async () => {
    mockFetch(pipelineData);
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => usePipeline({ from: '2026-01-01' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data?.[0]).toMatchObject({
      stageId: 1,
      stageName: 'Prospecto',
      count: 4,
    });
  });
});

// ---------------------------------------------------------------------------
// useChartBySector (chart hook)
// ---------------------------------------------------------------------------

describe('useChartBySector', () => {
  const chartData: ChartDatum[] = [
    { sectorId: 7, sectorName: 'Tech', opportunities: 12, won: 5, amount: 50000 },
  ];

  it('calls /api/proxy/metrics/charts/by-sector with filter params in the URL', async () => {
    const { urls } = mockFetch(chartData);
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => useChartBySector({ from: '2026-01-01', sectorId: 3 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(urls[0]).toMatch(/^\/api\/proxy\/metrics\/charts\/by-sector\?/);
    expect(urls[0]).toContain('from=2026-01-01');
    expect(urls[0]).toContain('sectorId=3');
  });

  it('returns typed ChartDatum[] data', async () => {
    mockFetch(chartData);
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => useChartBySector({ sectorId: 7 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data?.[0]).toMatchObject({
      sectorId: 7,
      sectorName: 'Tech',
      opportunities: 12,
    });
  });
});
