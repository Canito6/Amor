import { apiFetch } from '../common/api';

export const bucketListService = {
  getBucketItems: (page, limit) => {
    const query = (page && limit) ? `?page=${page}&limit=${limit}` : '';
    return apiFetch(`/api/fun/bucket-items${query}`);
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
