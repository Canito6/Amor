import { apiFetch } from './api';

export const likelyService = {
  getLikelyQuestions: () => {
    return apiFetch('/api/fun/likely-questions');
  },

  createLikelyQuestion: (questionData) => {
    return apiFetch('/api/fun/likely-questions', {
      method: 'POST',
      body: questionData
    });
  },

  voteLikelyQuestion: (id, voteData) => {
    return apiFetch(`/api/fun/likely-questions/${id}/vote`, {
      method: 'PATCH',
      body: voteData
    });
  },

  deleteLikelyQuestion: (id) => {
    return apiFetch(`/api/fun/likely-questions/${id}`, {
      method: 'DELETE'
    });
  }
};
