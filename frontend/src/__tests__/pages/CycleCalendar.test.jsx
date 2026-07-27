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
    deleteAllEntries: vi.fn(),
    getPartnerSummary: vi.fn().mockResolvedValue({ enabled: false })
  }
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

describe('CycleCalendar Page Component', () => {
  const mockSummaryNoOnboarding = {
    stats: {
      hasEnoughData: false,
      disclaimer: 'As previsões são apenas informativas e não substituem aconselhamento médico nem servem como método contracetivo.',
      totalEntries: 0
    },
    preferences: {
      gender: 'mulher',
      onboardingCompleted: false,
      shareWithPartner: false,
      partnerShareLevel: 'basic',
      hiddenFromMenu: false,
      remindersEnabled: true
    }
  };

  const mockSummaryWithOnboarding = {
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
      gender: 'mulher',
      onboardingCompleted: true,
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
    cycleService.getSummary.mockResolvedValue(mockSummaryWithOnboarding);
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

  it('mostra o modal de onboarding quando onboardingCompleted é false e oculta quando é true', async () => {
    cycleService.getSummary.mockResolvedValue(mockSummaryNoOnboarding);
    cycleService.getEntries.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <CycleCalendar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Configuração Inicial do Ciclo/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Passo 1: Identificação/i)).toBeInTheDocument();
  });

  it('não abre o modal de onboarding automaticamente se onboardingCompleted for true', async () => {
    cycleService.getSummary.mockResolvedValue(mockSummaryWithOnboarding);
    cycleService.getEntries.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <CycleCalendar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Calendário Menstrual/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Configuração Inicial do Ciclo/i)).not.toBeInTheDocument();
  });

  it('o botão "Refazer Questionário de Onboarding" na aba de definições reabre o modal', async () => {
    cycleService.getSummary.mockResolvedValue(mockSummaryWithOnboarding);
    cycleService.getEntries.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <CycleCalendar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Calendário Menstrual/i)).toBeInTheDocument();
    });

    // Ir para a aba de definições
    fireEvent.click(screen.getByText(/Definições & Privacidade/i));

    // Clicar em Refazer Questionário
    const btnRefazer = screen.getByRole('button', { name: /Refazer Questionário de Onboarding/i });
    fireEvent.click(btnRefazer);

    expect(screen.getByText(/Configuração Inicial do Ciclo/i)).toBeInTheDocument();
  });

  it('o toggle de partilha e alternador de nível atualizam as preferências chamando cycleService.updatePreferences', async () => {
    cycleService.getSummary.mockResolvedValue(mockSummaryWithOnboarding);
    cycleService.getEntries.mockResolvedValue([]);
    cycleService.updatePreferences.mockResolvedValue({
      shareWithPartner: false,
      partnerShareLevel: 'none'
    });

    render(
      <MemoryRouter>
        <CycleCalendar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Calendário Menstrual/i)).toBeInTheDocument();
    });

    // Ir para definições
    fireEvent.click(screen.getByText(/Definições & Privacidade/i));

    // Desativar toggle de partilha
    const toggleShare = screen.getByLabelText(/Partilhar informação de ciclo com o parceiro/i);
    fireEvent.click(toggleShare);

    await waitFor(() => {
      expect(cycleService.updatePreferences).toHaveBeenCalledWith({
        shareWithPartner: false,
        partnerShareLevel: 'none'
      });
    });
  });
});
