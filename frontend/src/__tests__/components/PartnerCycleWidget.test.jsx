import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PartnerCycleWidget from '../../components/dashboard/widgets/PartnerCycleWidget';
import { cycleService } from '../../services/cycle/cycleService';

vi.mock('../../services/cycle/cycleService', () => ({
  cycleService: {
    getPartnerSummary: vi.fn()
  }
}));

describe('PartnerCycleWidget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza null quando a partilha do parceiro está desativada (enabled: false)', async () => {
    cycleService.getPartnerSummary.mockResolvedValue({ enabled: false });

    const { container } = render(<PartnerCycleWidget />);

    await waitFor(() => {
      expect(cycleService.getPartnerSummary).toHaveBeenCalledTimes(1);
    });

    expect(container.firstChild).toBeNull();
  });

  it('renderiza null quando ocorre erro ao carregar o resumo', async () => {
    cycleService.getPartnerSummary.mockRejectedValue(new Error('Erro de ligação'));

    const { container } = render(<PartnerCycleWidget />);

    await waitFor(() => {
      expect(cycleService.getPartnerSummary).toHaveBeenCalledTimes(1);
    });

    expect(container.firstChild).toBeNull();
  });

  it('renderiza o resumo básico de apoio ao par quando a partilha está ativa com nível basic', async () => {
    cycleService.getPartnerSummary.mockResolvedValue({
      enabled: true,
      partnerName: 'Maria',
      level: 'basic',
      currentPhase: 'follicular',
      isPeriodActive: false,
      partnerInsight: 'O teu par está na fase folicular — a energia está a subir.',
      hasEnoughData: true,
      disclaimer: 'As previsões são apenas informativas.'
    });

    render(<PartnerCycleWidget />);

    await waitFor(() => {
      expect(screen.getByText(/Apoio ao Par \(Maria\)/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Fase Folicular/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/O teu par está na fase folicular/i)).toBeInTheDocument();
    expect(screen.queryByText(/atualmente no período menstrual/i)).not.toBeInTheDocument();
  });

  it('renderiza alerta de período ativo e sintomas adicionais quando o nível é detailed', async () => {
    cycleService.getPartnerSummary.mockResolvedValue({
      enabled: true,
      partnerName: 'Ana',
      level: 'detailed',
      currentPhase: 'menstrual',
      isPeriodActive: true,
      partnerInsight: 'O teu par está na fase menstrual — gestos de carinho são bem-vindos.',
      latestSymptoms: ['colicas', 'cansaco'],
      latestMood: '😴',
      hasEnoughData: true,
      disclaimer: 'As previsões são apenas informativas.'
    });

    render(<PartnerCycleWidget />);

    await waitFor(() => {
      expect(screen.getByText(/Apoio ao Par \(Ana\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/atualmente no período menstrual/i)).toBeInTheDocument();
    expect(screen.getByText(/colicas/i)).toBeInTheDocument();
    expect(screen.getByText(/cansaco/i)).toBeInTheDocument();
  });
});
