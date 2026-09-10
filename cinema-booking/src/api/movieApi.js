import axiosClient from './axiosClient';

export const movieApi = {
  getNowShowing: (params) => axiosClient.get('/movies/now-showing', { params }),
  getComingSoon: (params) => axiosClient.get('/movies/coming-soon', { params }),
  getMovieDetail: (id) => axiosClient.get(`/movies/${id}`),
  searchMovies: (params) => axiosClient.get('/movies/search', { params }),
};

export default movieApi;
