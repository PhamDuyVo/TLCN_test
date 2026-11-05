export const normalizeUser = (user) => user && ({
  ...user,
  full_name: user.fullName ?? user.full_name,
  role: user.role?.toLowerCase(),
  status: user.status?.toLowerCase(),
});

export function clearSession(storage) {
  for (const key of ['access_token', 'refresh_token', 'user_info']) storage.removeItem(key);
}

export function saveSession(storage, data) {
  const token = data.accessToken ?? data.token;
  if (!token || !data.user) throw new Error('Invalid authentication response');
  const user = normalizeUser(data.user);
  clearSession(storage);
  storage.setItem('access_token', token);
  if (data.refreshToken) storage.setItem('refresh_token', data.refreshToken);
  storage.setItem('user_info', JSON.stringify(user));
  return user;
}

export async function restoreSession(storage, getMe) {
  if (!storage.getItem('access_token')) {
    clearSession(storage);
    return null;
  }
  try {
    const res = await getMe();
    if (!res.success || !res.data) throw new Error('Invalid session');
    const user = normalizeUser(res.data);
    storage.setItem('user_info', JSON.stringify(user));
    return user;
  } catch {
    clearSession(storage);
    return null;
  }
}

export function authRequest(data) {
  const { full_name, otp_code, new_password, current_password, old_password, ...rest } = data;
  return {
    ...rest,
    ...(full_name !== undefined && { fullName: full_name }),
    ...(otp_code !== undefined && { otpCode: otp_code }),
    ...(new_password !== undefined && { newPassword: new_password }),
    ...((current_password ?? old_password) !== undefined && { oldPassword: current_password ?? old_password }),
  };
}
