export function dataOf(response) {
  if (!response?.success) throw new Error(response?.message || 'Không thể tải dữ liệu.');
  return response.data;
}
export const errorMessage = (error) => error.response?.data?.message || error.message || 'Kết nối thất bại. Vui lòng thử lại.';
// Offset-less backend LocalDateTime values use Vietnam cinema time.
export function serverTime(value) {
  if (!value) return NaN;
  return Date.parse(/[zZ]$|[+-]\d\d:\d\d$/.test(value) ? value : `${value}+07:00`);
}
export function secondsRemaining(expiresAt, now = Date.now()) {
  const end = serverTime(expiresAt);
  return Number.isFinite(end) ? Math.max(0, Math.ceil((end - now) / 1000)) : 0;
}
export const vietnamDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const sameSeats = (a = [], b = []) => a.length === b.length && a.every(id => b.includes(id));
export const canSelectSeat = (seat, ownIds = []) => seat.status === 'AVAILABLE' || ownIds.includes(seat.id);
export const comboItems = (quantities) => Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([id, quantity]) => ({ comboId: Number(id), quantity }));
export function safeUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}

export const timedHold = (hold) => ({ ...hold, clockOffset: Number.isFinite(serverTime(hold?.serverTime)) ? serverTime(hold.serverTime) - Date.now() : 0 });
