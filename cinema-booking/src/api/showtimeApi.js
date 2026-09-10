import axiosClient from './axiosClient';

export const showtimeApi = {
  getShowtimesByMovie: (movieId, params) => axiosClient.get(`/showtimes/movie/${movieId}`, { params }),
  getShowtimeDetail: (id) => axiosClient.get(`/showtimes/${id}`),
  getSeatLayout: (showtimeId) => axiosClient.get(`/showtimes/${showtimeId}/seats`),
};

export default showtimeApi;
