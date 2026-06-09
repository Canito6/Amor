import { apiFetch } from './api';

export const photoService = {
  getAlbums: () => {
    return apiFetch('/api/albums');
  },

  createAlbum: (name, description) => {
    return apiFetch('/api/albums', {
      method: 'POST',
      body: { name, description }
    });
  },

  deleteAlbum: (id) => {
    return apiFetch(`/api/albums/${id}`, {
      method: 'DELETE'
    });
  },

  getPhotos: (page, limit, albumId) => {
    let url = `/api/photos?page=${page}&limit=${limit}`;
    if (albumId) {
      const albumParam = albumId === 'sem-album' ? 'sem-album' : albumId;
      url += `&albumId=${albumParam}`;
    }
    return apiFetch(url);
  },

  uploadPhoto: (formData) => {
    return apiFetch('/api/photos/upload', {
      method: 'POST',
      body: formData
    });
  },

  deletePhoto: (id) => {
    return apiFetch(`/api/photos/${id}`, {
      method: 'DELETE'
    });
  }
};
