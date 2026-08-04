import { apiFetch } from '../common/api';

export const couponService = {
  getCoupons: () => {
    return apiFetch('/api/fun/coupons');
  },

  createCoupon: (couponData) => {
    return apiFetch('/api/fun/coupons', {
      method: 'POST',
      body: couponData
    });
  },

  redeemCoupon: (id) => {
    return apiFetch(`/api/fun/coupons/${id}/redeem`, {
      method: 'PATCH'
    });
  },

  deleteCoupon: (id) => {
    return apiFetch(`/api/fun/coupons/${id}`, {
      method: 'DELETE'
    });
  },

  generateAI: (type = 'mimo') => {
    return apiFetch('/api/fun/coupons/generate-ai', {
      method: 'POST',
      body: { type }
    });
  }
};
