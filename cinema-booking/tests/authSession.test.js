import { test, expect } from 'vitest';
import { authRequest, clearSession, restoreSession, saveSession } from '../src/context/authSession.js';

const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};

test('login and OTP success persist Java tokens and normalize existing UI fields', () => {
  for (const flow of ['login', 'OTP']) {
    const store = storage();
    const user = saveSession(store, { accessToken: flow, refreshToken: 'refresh', user: { fullName: 'Existing User', role: 'ADMIN' } });
    expect(store.getItem('access_token')).toBe(flow);
    expect(user.full_name).toBe('Existing User');
    expect(user.role).toBe('admin');
    clearSession(store);
    for (const key of ['access_token', 'refresh_token', 'user_info']) expect(store.getItem(key)).toBeNull();
  }
});

test('registration, OTP and password requests bridge legacy field spelling', () => {
  expect(authRequest({ full_name: 'Name', email: 'a@b.com', phone: '1', password: 'secret', otp_code: '123456' })).toEqual(
    { fullName: 'Name', email: 'a@b.com', phone: '1', password: 'secret', otpCode: '123456' });
  expect(authRequest({ current_password: 'old', new_password: 'new' })).toEqual({ oldPassword: 'old', newPassword: 'new' });
});

test('stored user without a token cannot restore a session', async () => {
  const store = storage();
  store.setItem('user_info', '{"role":"admin"}');
  const result = await restoreSession(store, () => { throw new Error('must not call /me without token'); });
  expect(result).toBeNull();
  expect(store.getItem('user_info')).toBeNull();
});

test('restore verifies token with server, never cached role; failed verification clears session', async () => {
  const store = storage();
  store.setItem('access_token', 'token');
  store.setItem('user_info', '{"role":"admin"}');
  const result = await restoreSession(store, async () => ({ success: true, data: { role: 'CUSTOMER' } }));
  expect(result.role).toBe('customer');
  expect(await restoreSession(store, async () => ({ success: false }))).toBeNull();
  expect(store.getItem('access_token')).toBeNull();
});

test('missing login token never authenticates a user', () => {
  expect(() => saveSession(storage(), { user: { role: 'ADMIN' } })).toThrow();
});
