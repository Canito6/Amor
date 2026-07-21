import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CycleCalendar from '../../pages/cycle/CycleCalendar';
import { cycleService } from '../../services/cycle/cycleService';

vi.mock('../../services/cycle/cycleService', () => ({
  cycleService: {
    getSummary: vi.fn(),
    getEntries: vi.fn(),
    createOrUpdateEntry: vi.fn(),
    updatePreferences: vi.fn(),
    deleteAllEntries: vi.fn()
  }
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

describe('CycleCalendar Page Component', () => {
  const mockSummaryNoData = {
    stats: {
      hasEnoughData: false,
      disclaimer: 'As previsões são apenas informativas e não substituem aconselhamento médico nem servem como método contracetivo.',
      totalEntries: 0
    },
    preferences: {
      shareWithPartner: false,
      partnerShareLevel: 'basic',
      hiddenFromMenu: false,
      remindersEnabled: true
    }
  };

  const mockSummaryWithData = {
    stats: {
      hasEnoughData: true,
      disclaimer: 'As previsões são apenas informativas e não substituem aconselhamento médico nem servem como método contracetivo.',
      totalEntries: 2,
      currentCycleDay: 14,
      currentPhase: 'ovulation',
      isPeriodActive: false,
      phaseInsight: 'Estás na fase de ovulação / janela fértil — é comum sentir mais energia.',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      fertileWindowStart: '2026-06-10T00:00:00.000Z',
      fertileWindowEnd: '2026-06-16T00:00:00.000Z',
      ovulationDate: '2026-06-13T00:00:00.000Z'
    },
    preferences: {
      shareWithPartner: true,
      partnerShareLevel: 'basic',
      hiddenFromMenu: false,
      remindersEnabled: true
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o aviso legal obrigatório e título principal', async () => {
    cycleService.getSummary.mockResolvedValue(mockSummaryNoData);
    cycleService.getEntries.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <CycleCalendar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Calendário Menstrual/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('note')).toHaveTextContent(/As previsões são apenas informativas e não substituem aconselhamento médico/i);
  });

  it('exibe mensagem inicial quando não há histórico suficiente (< 2 ciclos)', async () => {
    cycleService.getSummary.mockResolvedValue(mockSummaryNoData);
    cycleService.getEntries.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <CycleCalendar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Regista pelo menos 2 ciclos para desbloquear previsões/i)).toBeInTheDocument();
    });
  });

  it('exibe o resumo da fase e insight quando há histórico suficiente', async () => {
    cycleService.getSummary.mockResolvedValue(mockSummaryWithData);
    cycleService.getEntries.mockResolvedValue([
      { _id: '1', startDate: '2026-05-01' },
      { _id: '2', startDate: '2026-05-29' }
    ]);

    render(
      <MemoryRouter>
        <CycleCalendar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Dia 14 do teu ciclo/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Estás na fase de ovulação/i)).toBeInTheDocument();
  });

  it('permite alternar entre as abas (Calendário, Registo Diário, Definições)', async () => {
    cycleService.getSummary.mockResolvedValue(mockSummaryNoData);
    cycleService.getEntries.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <CycleCalendar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Calendário Menstrual/i)).toBeInTheDocument();
    });

    // Clicar na aba de Registo Diário
    fireEvent.click(screen.getByText(/Registo Diário/i));
    expect(screen.getByText(/Registo para o dia:/i)).toBeInTheDocument();

    // Clicar na aba de Definições & Privacidade
    fireEvent.click(screen.getByText(/Definições & Privacidade/i));
    expect(screen.getByText(/Privacidade & Definições do Ciclo/i)).toBeInTheDocument();
  });
});
