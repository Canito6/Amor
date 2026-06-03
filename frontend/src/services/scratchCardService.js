import { apiFetch } from './api';

export const scratchCardService = {
  getScratchCards: () => {
    return apiFetch('/api/fun/scratch-cards');
  },

  createScratchCard: (cardData) => {
    return apiFetch('/api/fun/scratch-cards', {
      method: 'POST',
      body: cardData
    });
  },

  scratchCard: (id) => {
    return apiFetch(`/api/fun/scratch-cards/${id}/scratch`, {
      method: 'PATCH'
    });
  },

  deleteScratchCard: (id) => {
    return apiFetch(`/api/fun/scratch-cards/${id}`, {
      method: 'DELETE'
    });
  }
};
