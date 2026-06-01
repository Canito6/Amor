import { apiFetch } from './api';

export const quizService = {
  getQuizzes: () => {
    return apiFetch('/api/quizzes');
  },

  createQuiz: (quizData) => {
    return apiFetch('/api/quizzes', {
      method: 'POST',
      body: quizData
    });
  },

  submitGuesses: (id, guesses) => {
    return apiFetch(`/api/quizzes/${id}/guess`, {
      method: 'PUT',
      body: { guesses }
    });
  },

  deleteQuiz: (id) => {
    return apiFetch(`/api/quizzes/${id}`, {
      method: 'DELETE'
    });
  }
};
