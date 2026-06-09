import { apiFetch } from '../common/api';

export const dailyCheckInService = {
  getDailyCheckIn: (dateString) => {
    const query = dateString ? `?date=${dateString}` : '';
    return apiFetch(`/api/daily-checkin${query}`);
  },

  submitAnswer: (answerText, dateString) => {
    return apiFetch('/api/daily-checkin/answer', {
      method: 'POST',
      body: { answerText, date: dateString }
    });
  }
};
