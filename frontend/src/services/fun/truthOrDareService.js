import { apiFetch } from '../common/api';

export const truthOrDareService = {
  getSession: () => {
    return apiFetch('/api/fun/truth-or-dare');
  },

  joinSession: () => {
    return apiFetch('/api/fun/truth-or-dare/join', {
      method: 'POST'
    });
  },

  drawCard: (type, customText = '') => {
    return apiFetch('/api/fun/truth-or-dare/draw', {
      method: 'POST',
      body: { type, customText }
    });
  },

  completeCard: () => {
    return apiFetch('/api/fun/truth-or-dare/complete', {
      method: 'POST'
    });
  },

  refuseCard: () => {
    return apiFetch('/api/fun/truth-or-dare/refuse', {
      method: 'POST'
    });
  },

  completePenalty: () => {
    return apiFetch('/api/fun/truth-or-dare/complete-penalty', {
      method: 'POST'
    });
  },

  updateSettings: (level, mode) => {
    return apiFetch('/api/fun/truth-or-dare/settings', {
      method: 'POST',
      body: { level, mode }
    });
  },

  resetGame: () => {
    return apiFetch('/api/fun/truth-or-dare/reset', {
      method: 'POST'
    });
  }
};
