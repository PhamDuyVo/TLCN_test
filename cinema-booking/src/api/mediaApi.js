import axios from 'axios';
import axiosClient from './axiosClient';

export const mediaApi = {
  list: (movieId) => axiosClient.get(`/admin/movies/${movieId}/media`),
  intent: (movieId, type) => axiosClient.post(`/admin/movies/${movieId}/media/intents`, { type }, { timeout: 45000 }),
  complete: (movieId, intentId) => axiosClient.post(`/admin/movies/${movieId}/media/intents/${intentId}/complete`, {}, { timeout: 45000 }),
  remove: (movieId, type) => axiosClient.delete(`/admin/movies/${movieId}/media/${type}`),
  upload: async (intent, file, onProgress) => {
    if (file.size > intent.maxBytes) throw new Error(`Tệp vượt giới hạn ${(intent.maxBytes / 1024 / 1024).toFixed(0)} MB`);
    const form = new FormData();
    Object.entries(intent.parameters).forEach(([key, value]) => form.append(key, String(value)));
    form.append('api_key', intent.apiKey);
    form.append('signature', intent.signature);
    form.append('file', file);
    // Separate client: never send the application's JWT to Cloudinary.
    await axios.post(intent.uploadUrl, form, {
      timeout: 600000,
      onUploadProgress: ({ loaded, total }) => onProgress(total ? Math.round(loaded * 100 / total) : 0),
    });
  },
};
