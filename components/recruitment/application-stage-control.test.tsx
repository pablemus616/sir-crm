import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// El componente solo consume useChangeApplicationStage; lo mockeamos para no
// arrastrar TanStack Query ni la red. allowedNextStages/labels son puros y reales.
const mutate = vi.fn();
vi.mock('@/lib/api/applications', () => ({
  useChangeApplicationStage: () => ({ mutate, isPending: false }),
}));

import { ApplicationStageControl } from './application-stage-control';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ApplicationStageControl', () => {
  it('etapa terminal "hired": muestra el badge "Contratado" y NINGÚN control de movimiento', () => {
    render(<ApplicationStageControl id={1} stage="hired" />);
    expect(screen.getByText('Contratado')).toBeInTheDocument();
    expect(screen.queryByText('Mover etapa')).toBeNull();
  });

  it('etapa no terminal "applied": muestra el badge "Postulado" y el disparador "Mover etapa"', () => {
    render(<ApplicationStageControl id={1} stage="applied" />);
    expect(screen.getByText('Postulado')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mover etapa' }),
    ).toBeInTheDocument();
  });
});
