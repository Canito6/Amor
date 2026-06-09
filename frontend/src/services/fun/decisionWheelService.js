import { apiFetch } from './api';

export const decisionWheelService = {
  getDecisionWheels: () => {
    return apiFetch('/api/fun/decision-wheels');
  },

  createDecisionWheel: (wheelData) => {
    return apiFetch('/api/fun/decision-wheels', {
      method: 'POST',
      body: wheelData
    });
  },

  deleteDecisionWheel: (id) => {
    return apiFetch(`/api/fun/decision-wheels/${id}`, {
      method: 'DELETE'
    });
  }
};
