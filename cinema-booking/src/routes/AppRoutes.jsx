import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import StaffLayout from '../layouts/StaffLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../utils/constants';

import {
  HomePage,
  MoviesPage,
  MovieDetailPage,
  BookingSeatPage,
  CheckoutPage,
  BookingSuccessPage,
  ProfilePage,
  TicketHistoryPage,
  LoginPage,
} from '../pages/guest_customer/CustomerPages';

import {
  StaffLoginPage,
  PosBookingPage,
  QrCheckInPage,
  TicketLookupPage,
} from '../pages/staff/StaffPages';

import {
  DashboardPage,
  ManageMoviesPage,
  ManageShowtimesPage,
  ManageCinemasPage,
  ManageUsersPage,
  ManagePromotionsPage,
  ManageBookingsPage,
} from '../pages/admin/AdminPages';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Customer & Guest Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
          <Route path="/booking/:showtimeId" element={<BookingSeatPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-tickets" element={<TicketHistoryPage />} />
        </Route>
      </Route>

      {/* 2. Staff Routes */}
      <Route path="/staff/login" element={<StaffLoginPage />} />
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]} />}>
        <Route element={<StaffLayout />}>
          <Route path="/staff/pos" element={<PosBookingPage />} />
          <Route path="/staff/checkin" element={<QrCheckInPage />} />
          <Route path="/staff/lookup" element={<TicketLookupPage />} />
        </Route>
      </Route>

      {/* 3. Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/movies" element={<ManageMoviesPage />} />
          <Route path="/admin/showtimes" element={<ManageShowtimesPage />} />
          <Route path="/admin/cinemas" element={<ManageCinemasPage />} />
          <Route path="/admin/users" element={<ManageUsersPage />} />
          <Route path="/admin/promotions" element={<ManagePromotionsPage />} />
          <Route path="/admin/bookings" element={<ManageBookingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
