import { apiFetch } from './api';

export const funService = {
  // Raspadinhas do Amor
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
  },

  // Roleta de Decisões
  getDecisionWheels: () => {
    return apiFetch('/api/fun/decision-wheels');
  },

  createDecisionWheel: (wheelData) => {
    return apiFetch('/api/fun/decision-wheels', {
      method: 'POST',
      body: wheelData
    });
  },

  deleteDecisionWheel: (id) => {
    return apiFetch(`/api/fun/decision-wheels/${id}`, {
      method: 'DELETE'
    });
  },

  // Bucket List
  getBucketItems: () => {
    return apiFetch('/api/fun/bucket-items');
  },

  createBucketItem: (itemData) => {
    return apiFetch('/api/fun/bucket-items', {
      method: 'POST',
      body: itemData
    });
  },

  completeBucketItem: (id, formData) => {
    return apiFetch(`/api/fun/bucket-items/${id}/complete`, {
      method: 'PATCH',
      body: formData
    });
  },

  deleteBucketItem: (id) => {
    return apiFetch(`/api/fun/bucket-items/${id}`, {
      method: 'DELETE'
    });
  }
};
