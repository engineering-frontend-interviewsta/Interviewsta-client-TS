import { djangoClient } from '../api/axiosInstance';
import { AUTH_ENDPOINTS } from '../constants/apiEndpoints';
import type { AuthApiResponse } from '../types/auth';

function toUser(data: AuthApiResponse['user']): { email: string; displayName: string; phone: string; country: string } {
  return {
    email: data.email,
    displayName: data.name ?? '',
    phone: data.phone ?? '',
    country: data.country ?? '',
  };
}

export async function login(email: string, password: string): Promise<{ data: AuthApiResponse }> {
  return djangoClient.post<AuthApiResponse>(AUTH_ENDPOINTS.LOGIN, { email, password });
}

export async function register(
  name: string,
  email: string,
  password: string,
  role = 'student',
  phone = '',
  country = ''
): Promise<{ data: AuthApiResponse }> {
  return djangoClient.post<AuthApiResponse>(AUTH_ENDPOINTS.REGISTER, {
    name,
    email,
    password,
    role,
    ...(phone?.trim() && { phone: phone.trim() }),
    ...(country?.trim() && { country: country.trim() }),
  });
}

export async function logout(): Promise<void> {
  await djangoClient.post(AUTH_ENDPOINTS.LOGOUT);
}

export async function refresh(): Promise<{ data: { access: string } }> {
  return djangoClient.post<{ access: string }>(AUTH_ENDPOINTS.REFRESH);
}

export async function me(): Promise<{ data: AuthApiResponse['user'] & { role: string } }> {
  return djangoClient.get(AUTH_ENDPOINTS.ME);
}

export async function forgotPassword(
  email: string,
  frontendUrl: string = typeof window !== 'undefined' ? window.location.origin : ''
): Promise<void> {
  await djangoClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email, frontend_url: frontendUrl });
}

export async function googleLogin(
  code: string,
  redirectUri: string,
  role = 'student'
): Promise<{ data: AuthApiResponse }> {
  return djangoClient.post<AuthApiResponse>(AUTH_ENDPOINTS.GOOGLE, {
    code,
    redirect_uri: redirectUri,
    role,
  });
}

export async function githubLogin(
  code: string,
  redirectUri: string,
  role = 'student'
): Promise<{ data: AuthApiResponse }> {
  return djangoClient.post<AuthApiResponse>(AUTH_ENDPOINTS.GITHUB, {
    code,
    redirect_uri: redirectUri,
    role,
  });
}

export { toUser };
