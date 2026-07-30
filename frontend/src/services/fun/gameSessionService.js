import { apiFetch } from '../common/api';

export const gameSessionService = {
  getSession: (gameType = 'tic-tac-toe') => {
    return apiFetch(`/api/fun/game-sessions/${gameType}`);
  },

  joinSession: (gameType = 'tic-tac-toe') => {
    return apiFetch(`/api/fun/game-sessions/${gameType}/join`, {
      method: 'POST'
    });
  },

  makeMove: (gameType = 'tic-tac-toe', index) => {
    return apiFetch(`/api/fun/game-sessions/${gameType}/move`, {
      method: 'POST',
      body: { index }
    });
  },

  resetSession: (gameType = 'tic-tac-toe') => {
    return apiFetch(`/api/fun/game-sessions/${gameType}/reset`, {
      method: 'POST'
    });
  }
};
