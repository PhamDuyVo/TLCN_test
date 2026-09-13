import axiosClient from './axiosClient';

export const movieApi = {
  getAllMovies: (status) => axiosClient.get('/movies', { params: { status } }),
  getMovieById: (id) => axiosClient.get(`/movies/${id}`),
};

export default movieApi;
