import { apiFetch } from '../common/api';

export const memoryService = {
  getMemories: () => {
    return apiFetch('/api/memories');
  },

  createMemory: (memoryData) => {
    return apiFetch('/api/memories', {
      method: 'POST',
      body: memoryData
    });
  },

  updateMemory: (id, memoryData) => {
    return apiFetch(`/api/memories/${id}`, {
      method: 'PUT',
      body: memoryData
    });
  },

  deleteMemory: (id) => {
    return apiFetch(`/api/memories/${id}`, {
      method: 'DELETE'
    });
  }
};
