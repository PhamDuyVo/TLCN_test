import axiosClient from './axiosClient';

export const adminApi = {
  // Phim
  getMovies: (params) => axiosClient.get('/admin/movies', { params }),
  createMovie: (data) => axiosClient.post('/admin/movies', data),
  updateMovie: (id, data) => axiosClient.put(`/admin/movies/${id}`, data),
  deleteMovie: (id) => axiosClient.delete(`/admin/movies/${id}`),

  // Rạp & Phòng chiếu
  getCinemas: () => axiosClient.get('/admin/cinemas'),
  getRoomsByCinema: (cinemaId) => axiosClient.get(`/admin/cinemas/${cinemaId}/rooms`),

  // Suất chiếu
  createShowtime: (data) => axiosClient.post('/admin/showtimes', data),

  // Người dùng
  getUsers: (params) => axiosClient.get('/admin/users', { params }),
  updateUserStatus: (id, status) => axiosClient.patch(`/admin/users/${id}/status`, { status }),

  // Thống kê
  getDashboardStats: (params) => axiosClient.get('/admin/stats/dashboard', { params }),
};

export default adminApi;
