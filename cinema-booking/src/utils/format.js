import { serverTime } from './booking';
export const formatCurrency = (amount) => {
  if (amount == null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString.length === 10 ? `${dateString}T00:00:00+07:00` : serverTime(dateString));
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString.length === 10 ? `${dateString}T00:00:00+07:00` : serverTime(dateString));
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
};
