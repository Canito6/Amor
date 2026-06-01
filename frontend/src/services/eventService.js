import { apiFetch } from './api';

export const eventService = {
  getEvents: () => {
    return apiFetch('/api/events');
  },

  createEvent: (eventData) => {
    return apiFetch('/api/events', {
      method: 'POST',
      body: eventData
    });
  },

  deleteEvent: (id) => {
    return apiFetch(`/api/events/${id}`, {
      method: 'DELETE'
    });
  }
};
