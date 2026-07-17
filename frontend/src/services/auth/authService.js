import { apiFetch } from '../common/api';

export const authService = {
  register: (username, email, password, loginSecurityMethod, phoneNumber, inviteCode) => {
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: { username, email, password, loginSecurityMethod, phoneNumber, inviteCode }
    });
  },

  login: (username, password, trustedDeviceToken) => {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      body: { username, password, trustedDeviceToken }
    });
  },

  verifyLogin: (userId, code, trustDevice) => {
    return apiFetch('/api/auth/verify-login', {
      method: 'POST',
      body: { userId, code, trustDevice }
    });
  },

  forgotPassword: (email) => {
    return apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email }
    });
  },

  resetPassword: (email, codigo, novaPassword) => {
    return apiFetch('/api/auth/reset-password', {
      method: 'POST',
      body: { email, codigo, novaPassword }
    });
  },

  forcarMudancaPassword: (userId, novaPassword) => {
    return apiFetch('/api/auth/forcar-mudanca-password', {
      method: 'POST',
      body: { userId, novaPassword }
    });
  },

  getCoupleInfo: () => {
    return apiFetch('/api/auth/couple-info', {
      method: 'GET'
    });
  },

  updateCoupleInfo: (data) => {
    return apiFetch('/api/auth/couple-info', {
      method: 'POST',
      body: data
    });
  },

  linkCouple: (inviteToken) => {
    return apiFetch('/api/auth/link-couple', {
      method: 'POST',
      body: { inviteToken }
    });
  },

  updateMood: (moodEmoji) => {
    return apiFetch('/api/auth/mood', {
      method: 'POST',
      body: { moodEmoji }
    });
  },

  getCoupleStats: () => {
    return apiFetch('/api/auth/couple-stats', {
      method: 'GET'
    });
  },

  uploadAvatar: (formData) => {
    return apiFetch('/api/auth/profile-avatar', {
      method: 'POST',
      body: formData
    });
  },

  subscribePush: (subscription) => {
    return apiFetch('/api/auth/push-subscribe', {
      method: 'POST',
      body: subscription
    });
  },

  unsubscribePush: (endpoint) => {
    return apiFetch('/api/auth/push-unsubscribe', {
      method: 'POST',
      body: { endpoint }
    });
  },

  getVapidPublicKey: () => {
    return apiFetch('/api/auth/vapid-public-key', {
      method: 'GET'
    });
  },

  getDashboardWidgets: () => {
    return apiFetch('/api/auth/dashboard-widgets', {
      method: 'GET'
    });
  },

  saveDashboardWidgets: (widgets) => {
    return apiFetch('/api/auth/dashboard-widgets', {
      method: 'POST',
      body: { widgets }
    });
  },

  logout: () => {
    return apiFetch('/api/auth/logout', {
      method: 'POST'
    });
  }
};
