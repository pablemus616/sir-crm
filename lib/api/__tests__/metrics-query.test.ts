import { describe, expect, it } from 'vitest';
import { buildMetricsQuery } from '../metrics-query';

describe('buildMetricsQuery', () => {
  it('omite valores vacíos y undefined', () => {
    expect(buildMetricsQuery({ from: '', sectorId: undefined })).toEqual({});
  });
  it('serializa números a string', () => {
    expect(buildMetricsQuery({ sectorId: 3, clientId: 12 })).toEqual({
      sectorId: '3', clientId: '12',
    });
  });
  it('ignora claves no soportadas', () => {
    expect(buildMetricsQuery({ status: 'won', foo: 1 } as never)).toEqual({
      status: 'won',
    });
  });
});
