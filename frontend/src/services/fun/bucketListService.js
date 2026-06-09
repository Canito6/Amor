import { apiFetch } from './api';

export const bucketListService = {
  getBucketItems: () => {
    return apiFetch('/api/fun/bucket-items');
  },

  createBucketItem: (itemData) => {
    return apiFetch('/api/fun/bucket-items', {
      method: 'POST',
      body: itemData
    });
  },

  completeBucketItem: (id, formData) => {
    return apiFetch(`/api/fun/bucket-items/${id}/complete`, {
      method: 'PATCH',
      body: formData
    });
  },

  deleteBucketItem: (id) => {
    return apiFetch(`/api/fun/bucket-items/${id}`, {
      method: 'DELETE'
    });
  }
};
