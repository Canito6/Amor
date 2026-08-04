import { apiFetch } from '../common/api';

export const battleshipService = {
  getSession: () => {
    return apiFetch('/api/fun/battleship');
  },

  joinSession: () => {
    return apiFetch('/api/fun/battleship/join', {
      method: 'POST'
    });
  },

  placeShips: (shipPlacements) => {
    return apiFetch('/api/fun/battleship/setup', {
      method: 'POST',
      body: { shipPlacements }
    });
  },

  attack: (targetIndex) => {
    return apiFetch('/api/fun/battleship/attack', {
      method: 'POST',
      body: { targetIndex }
    });
  },

  dismissChallenge: () => {
    return apiFetch('/api/fun/battleship/dismiss-challenge', {
      method: 'POST'
    });
  },

  updateSettings: (level, mode) => {
    return apiFetch('/api/fun/battleship/settings', {
      method: 'POST',
      body: { level, mode }
    });
  },

  resetGame: () => {
    return apiFetch('/api/fun/battleship/reset', {
      method: 'POST'
    });
  }
};
