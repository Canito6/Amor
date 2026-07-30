import { apiFetch } from '../common/api';

export const gameScoreService = {
  getSummary: (period = 'all') => {
    return apiFetch(`/api/fun/game-scores/summary?period=${period}`);
  },

  submitScore: (gameType, points, metadata = {}) => {
    return apiFetch('/api/fun/game-scores', {
      method: 'POST',
      body: {
        gameType,
        points,
        metadata
      }
    });
  },

  resetScores: () => {
    return apiFetch('/api/fun/game-scores/reset', {
      method: 'DELETE'
    });
  }
};
