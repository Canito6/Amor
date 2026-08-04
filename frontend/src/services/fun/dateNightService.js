import { apiFetch } from '../common/api';

export const dateNightService = {
  generateAI: (theme = 'caseiro') => {
    return apiFetch('/api/fun/date-night/generate-ai', {
      method: 'POST',
      body: { theme }
    });
  }
};
