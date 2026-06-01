import { apiFetch } from './api';

export const tabService = {
  getTabs: () => {
    return apiFetch('/api/tabs');
  },

  createTab: (tabData) => {
    return apiFetch('/api/tabs', {
      method: 'POST',
      body: tabData
    });
  },

  updateTab: (id, tabData) => {
    return apiFetch(`/api/tabs/${id}`, {
      method: 'PUT',
      body: tabData
    });
  },

  deleteTab: (id) => {
    return apiFetch(`/api/tabs/${id}`, {
      method: 'DELETE'
    });
  }
};
