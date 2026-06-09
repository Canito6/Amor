import { apiFetch } from './api';

export const messageService = {
  getMessages: () => {
    return apiFetch('/api/messages');
  },

  createMessage: (content) => {
    return apiFetch('/api/messages', {
      method: 'POST',
      body: { content }
    });
  },

  updateMessage: (id, content) => {
    return apiFetch(`/api/messages/${id}`, {
      method: 'PUT',
      body: { content }
    });
  },

  reactToMessage: (id, emoji) => {
    return apiFetch(`/api/messages/${id}/react`, {
      method: 'PUT',
      body: { emoji }
    });
  },

  deleteMessage: (id) => {
    return apiFetch(`/api/messages/${id}`, {
      method: 'DELETE'
    });
  }
};
