import axiosClient from './axiosClient';

export const bookingApi = {
  createBooking: (bookingData) => axiosClient.post('/bookings', bookingData),
  getBookingDetail: (code) => axiosClient.get(`/bookings/${code}`),
  getMyBookings: () => axiosClient.get('/bookings/my-tickets'),
  applyPromotion: (data) => axiosClient.post('/promotions/apply', data),
  getCombos: () => axiosClient.get('/combos'),
};

export default bookingApi;
