import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BookingSeatPage from '../pages/guest_customer/BookingSeatPage';
import CheckoutPage from '../pages/guest_customer/CheckoutPage';
import BookingSuccessPage from '../pages/guest_customer/BookingSuccessPage';
import useCountdown from '../hooks/useCountdown';
import showtimeApi from '../api/showtimeApi';
import bookingApi from '../api/bookingApi';
import { canSelectSeat, comboItems, secondsRemaining, serverTime, timedHold } from './booking';

vi.mock('../api/showtimeApi', () => ({ default: { getShowtimeSeats: vi.fn(), getHold: vi.fn(), putHold: vi.fn(), deleteHold: vi.fn() } }));
vi.mock('../api/bookingApi', () => ({ default: { getCombos: vi.fn(), quote: vi.fn(), createBooking: vi.fn(), getBookingDetail: vi.fn() } }));
vi.mock('../components/booking/CinemaHall3D', () => ({ default: ({ selectedIds, seats, onToggle }) => <div><p>3D selection: {selectedIds.join(',')}</p><button onClick={() => onToggle(seats[0])}>3D toggle</button></div> }));
const ok = data => ({ success: true, data });
const seats = [{ id: 11, seatNumber: 'A1', seatRow: 'A', seatCol: 1, seatType: 'Standard', finalPrice: 90000, status: 'HOLDING' }, { id: 12, seatNumber: 'A2', seatRow: 'A', seatCol: 2, seatType: 'VIP', finalPrice: 110000, status: 'BOOKED' }];
const showtime = { id: 7, movieTitle: 'Database Movie', cinemaName: 'Cinema', hallName: 'Hall', startTime: '2030-01-01T13:00:00' };
const hold = () => ({ showtimeId: 7, seatIds: [11], expiresAt: new Date(Date.now() + 300000).toISOString(), serverTime: new Date().toISOString(), status: 'ACTIVE' });
const quote = { seatAmount: 90000, comboAmount: 0, totalAmount: 90000, discountAmount: 0, finalAmount: 90000, paymentMethod: 'PAY_AT_COUNTER' };
function page(Component, path, route) { return render(<MemoryRouter initialEntries={[path]}><Routes><Route path={route} element={<Component />} /><Route path="/booking-success" element={<BookingSuccessPage />} /></Routes></MemoryRouter>); }
beforeEach(() => {
  vi.resetAllMocks();
  showtimeApi.getShowtimeSeats.mockResolvedValue(ok({ showtime, seats }));
  showtimeApi.getHold.mockImplementation(async () => ok(hold()));
  showtimeApi.deleteHold.mockImplementation(async () => ok({ ...hold(), seatIds: [] }));
  showtimeApi.putHold.mockImplementation(async (id, seatIds) => ok({ ...hold(), seatIds }));
  bookingApi.getCombos.mockResolvedValue(ok([{ id: 4, name: 'Combo from DB', price: 50000 }]));
  bookingApi.quote.mockResolvedValue(ok(quote));
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('server clock and seat ownership', () => {
  it('uses server time despite client clock skew and clamps expiry', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
    const h = timedHold({ expiresAt: '2030-01-01T10:05:00', serverTime: '2030-01-01T10:00:00' });
    expect(secondsRemaining(h.expiresAt, Date.now() + h.clockOffset)).toBe(300);
    expect(serverTime('2030-01-01T10:00:00')).toBe(Date.parse('2030-01-01T03:00:00Z'));
    expect(secondsRemaining('invalid')).toBe(0);
    const { result } = renderHook(() => useCountdown(h.expiresAt, h.clockOffset));
    expect(result.current.formattedTime).toBe('05:00');
    act(() => { vi.advanceTimersByTime(301000); });
    expect(result.current.isExpired).toBe(true);
    expect(result.current.formattedTime).toBe('00:00');
  });
  it('allows own hold but blocks another holder, booked and unavailable seats', () => {
    expect(canSelectSeat(seats[0], [11])).toBe(true);
    expect(canSelectSeat(seats[0], [])).toBe(false);
    expect(canSelectSeat(seats[1], [])).toBe(false);
    expect(canSelectSeat({ id: 13, status: 'UNAVAILABLE' }, [])).toBe(false);
    expect(comboItems({ 4: 2, 5: 0 })).toEqual([{ comboId: 4, quantity: 2 }]);
  });
});
describe('booking page', () => {
  it('restores server hold and preserves selection through 2D/3D switching', async () => {
    page(BookingSeatPage, '/booking/7', '/booking/:showtimeId');
    const seat = await screen.findByRole('button', { name: 'Ghế A1' });
    expect(seat.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Ghế A2' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '3D', exact: true }));
    await screen.findByText('3D selection: 11');
    fireEvent.click(screen.getByRole('button', { name: '2D', exact: true }));
    expect(screen.getByRole('button', { name: 'Ghế A1' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Ghế A1' }));
    await waitFor(() => expect(showtimeApi.deleteHold).toHaveBeenCalledWith('7'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'TIẾP TỤC THANH TOÁN' }).disabled).toBe(true));
  });
  it('requires explicit restart after server expiry', async () => {
    showtimeApi.getHold.mockResolvedValue(ok({ ...hold(), status: 'EXPIRED', seatIds: [], expiresAt: new Date(Date.now() - 1000).toISOString() }));
    page(BookingSeatPage, '/booking/7', '/booking/:showtimeId');
    fireEvent.click(await screen.findByRole('button', { name: 'Bắt đầu phiên mới' }));
    await waitFor(() => expect(showtimeApi.putHold).toHaveBeenCalledWith('7', []));
  });
  it('does not navigate or retain authoritative availability after a hold conflict', async () => {
    showtimeApi.deleteHold.mockRejectedValue(new Error('Hold conflict'));
    page(BookingSeatPage, '/booking/7', '/booking/:showtimeId');
    fireEvent.click(await screen.findByRole('button', { name: 'Ghế A1' }));
    await screen.findByText('Hold conflict');
    expect(screen.getByRole('button', { name: 'TIẾP TỤC THANH TOÁN' }).disabled).toBe(true);
  });
});
describe('checkout and confirmation', () => {
  it('does not invent tickets when opened without a showtime', () => {
    page(CheckoutPage, '/checkout', '/checkout');
    expect(screen.getByText('Chưa có suất chiếu để thanh toán.')).toBeTruthy();
    expect(bookingApi.quote).not.toHaveBeenCalled();
  });
  it('invalidates prior quote immediately and blocks an invalid voucher', async () => {
    page(CheckoutPage, '/checkout?showtimeId=7', '/checkout');
    await waitFor(() => expect(screen.getByRole('button', { name: 'XÁC NHẬN ĐẶT VÉ' }).disabled).toBe(false));
    bookingApi.quote.mockRejectedValue(new Error('Voucher invalid'));
    fireEvent.change(screen.getByLabelText('MÃ GIẢM GIÁ / VOUCHER'), { target: { value: 'INVALID' } });
    expect(screen.getByRole('button', { name: 'XÁC NHẬN ĐẶT VÉ' }).disabled).toBe(true);
    await screen.findByText('Voucher invalid');
    expect(bookingApi.createBooking).not.toHaveBeenCalled();
  });
  it('uses server quote and sends hold seat IDs, combos and counter payment', async () => {
    bookingApi.createBooking.mockResolvedValue(ok({ bookingCode: 'REAL7' }));
    bookingApi.getBookingDetail.mockResolvedValue(ok({ bookingCode: 'REAL7', status: 'PENDING_PAYMENT', movieTitle: 'Database Movie', seatNumbers: ['A1'], finalAmount: 140000, tickets: [{ id: 1, qrPayload: null }] }));
    page(CheckoutPage, '/checkout?showtimeId=7', '/checkout');
    await screen.findByText('Combo from DB');
    bookingApi.quote.mockResolvedValue(ok({ ...quote, comboAmount: 50000, finalAmount: 140000 }));
    fireEvent.click(screen.getByRole('button', { name: 'Thêm Combo from DB' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'XÁC NHẬN ĐẶT VÉ' }).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'XÁC NHẬN ĐẶT VÉ' }));
    await waitFor(() => expect(bookingApi.createBooking).toHaveBeenCalledWith({ showtimeId: 7, seatIds: [11], combos: [{ comboId: 4, quantity: 1 }], promotionCode: '', paymentMethod: 'PAY_AT_COUNTER' }));
    await screen.findByText('ĐÃ XÁC NHẬN ĐẶT CHỖ');
    expect(screen.getByText('Chưa thanh toán — vui lòng thanh toán tại quầy rạp.')).toBeTruthy();
    expect(screen.queryByText('ĐÃ THANH TOÁN')).toBeNull();
    expect(document.querySelector('svg')).toBeNull();
  });
  it('does not trust a payment success query parameter', async () => {
    page(BookingSuccessPage, '/result?vnp_ResponseCode=00', '/result');
    expect(screen.getByText('Thiếu mã đặt vé. Vui lòng kiểm tra Vé của tôi.')).toBeTruthy();
    expect(bookingApi.getBookingDetail).not.toHaveBeenCalled();
  });
});
