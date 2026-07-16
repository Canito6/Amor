import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RelationshipStats from '../../pages/couple/stats/RelationshipStats';
import { authService } from '../../services/auth/authService';

vi.mock('../../services/auth/authService', () => ({
  authService: {
    getCoupleStats: vi.fn()
  }
}));

vi.mock('../../context/PreferencesContext', () => ({
  usePreferences: () => ({
    language: 'pt'
  })
}));

describe('RelationshipStats page component', () => {
  it('renders loading spinner and then stats data', async () => {
    authService.getCoupleStats.mockResolvedValue({
      messagesCount: 15,
      memoriesCount: 3,
      photosCount: 5,
      scratchCards: { total: 10, scratched: 4 },
      quizzes: { total: 5, completed: 2 },
      likely: { total: 8, matched: 4 },
      decisionWheelsCount: 2,
      currentStreak: 5,
      relationshipDate: '2020-01-01T00:00:00.000Z',
      totalDaysTogether: 2350,
      moodMatchPercentage: 75
    });

    const { container } = render(
      <MemoryRouter>
        <RelationshipStats />
      </MemoryRouter>
    );

    expect(container.querySelector('.spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Estatísticas da Relação/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/2350 Dias Juntos/i)).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getAllByText('15').length).toBeGreaterThan(0);
  });

  it('renders correctly with zero data (empty state)', async () => {
    authService.getCoupleStats.mockResolvedValue({
      messagesCount: 0,
      memoriesCount: 0,
      photosCount: 0,
      scratchCards: { total: 0, scratched: 0 },
      quizzes: { total: 0, completed: 0 },
      likely: { total: 0, matched: 0 },
      decisionWheelsCount: 0,
      currentStreak: 0,
      relationshipDate: '2026-07-01T00:00:00.000Z',
      totalDaysTogether: 15,
      moodMatchPercentage: null
    });

    render(
      <MemoryRouter>
        <RelationshipStats />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Estatísticas da Relação/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Ainda sem dados suficientes para calcular a sintonia.')).toBeInTheDocument();
    expect(screen.getByText('Ainda sem dados suficientes para gerar o gráfico de atividade.')).toBeInTheDocument();
  });
});
