import { apiFetch } from '../common/api';

export const letterService = {
  getLetters: () => {
    return apiFetch('/api/fun/letters');
  },

  createLetter: (letterData) => {
    return apiFetch('/api/fun/letters', {
      method: 'POST',
      body: letterData
    });
  },

  openLetter: (id) => {
    return apiFetch(`/api/fun/letters/${id}/open`, {
      method: 'PATCH'
    });
  },

  deleteLetter: (id) => {
    return apiFetch(`/api/fun/letters/${id}`, {
      method: 'DELETE'
    });
  },

  generateAI: (category = 'saudades') => {
    return apiFetch('/api/fun/letters/generate-ai', {
      method: 'POST',
      body: { category }
    });
  }
};
