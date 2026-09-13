import axiosClient from './axiosClient';

export const showtimeApi = {
  getShowtimesByMovie: (movieId, date) => axiosClient.get(`/showtimes/movie/${movieId}`, { params: { date } }),
  getShowtimeSeats: (showtimeId) => axiosClient.get(`/showtimes/${showtimeId}/seats`),
};

export default showtimeApi;
