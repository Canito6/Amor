import { apiFetch } from './api';

export const jarService = {
  getJarNotes: () => {
    return apiFetch('/api/fun/jar-notes');
  },

  getRandomJarNote: () => {
    return apiFetch('/api/fun/jar-notes/random');
  },

  createJarNote: (noteData) => {
    return apiFetch('/api/fun/jar-notes', {
      method: 'POST',
      body: noteData
    });
  },

  deleteJarNote: (id) => {
    return apiFetch(`/api/fun/jar-notes/${id}`, {
      method: 'DELETE'
    });
  }
};
