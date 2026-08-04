import { apiFetch } from '../common/api';

export const wordleService = {
  getSession: () => {
    return apiFetch('/api/fun/wordle');
  },

  joinSession: () => {
    return apiFetch('/api/fun/wordle/join', {
      method: 'POST'
    });
  },

  makeGuess: (guessWord) => {
    return apiFetch('/api/fun/wordle/guess', {
      method: 'POST',
      body: { guessWord }
    });
  },

  setManualWord: (word, hint) => {
    return apiFetch('/api/fun/wordle/set-word', {
      method: 'POST',
      body: { word, hint }
    });
  },

  updateSettings: (mode) => {
    return apiFetch('/api/fun/wordle/settings', {
      method: 'POST',
      body: { mode }
    });
  },

  resetGame: () => {
    return apiFetch('/api/fun/wordle/reset', {
      method: 'POST'
    });
  }
};
