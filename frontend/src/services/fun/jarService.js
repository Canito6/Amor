import { apiFetch } from '../common/api';

export const jarService = {
  getJarNotes: (page, limit) => {
    const query = (page && limit) ? `?page=${page}&limit=${limit}` : '';
    return apiFetch(`/api/fun/jar-notes${query}`);
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
