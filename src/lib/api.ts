import { API_BASE_URL } from './config';
import type {
  RegisterRequest, LoginRequest, AuthResponse, RefreshResponse,
  ProfileResponse, UpdateProfileRequest,
  HealthInfoResponse, UpdateHealthRequest,
  AllergyListItemResponse, CreateAllergyRequest, UpdateAllergyRequest,
  MedicationListItemResponse, CreateMedicationRequest, UpdateMedicationRequest,
  EmergencyContactResponse, CreateEmergencyContactRequest, UpdateEmergencyContactRequest,
  AddressResponse, CreateAddressRequest, UpdateAddressRequest,
} from '@/types/api';

async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  if (res.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(error.message || `Erro ${res.status}`);
  }

  return res.json();
}

// Auth (no auth header needed)
export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: LoginRequest) =>
    apiClient<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  refresh: (refreshToken: string) =>
    apiClient<RefreshResponse>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  logout: (refreshToken: string) =>
    apiClient<void>('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
};

// Profile
export const profileApi = {
  get: () => apiClient<ProfileResponse>('/me/profile'),
  update: (data: UpdateProfileRequest) =>
    apiClient<ProfileResponse>('/me/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// Health
export const healthApi = {
  get: (includeNotes = false) =>
    apiClient<HealthInfoResponse>(`/me/health?includeNotes=${includeNotes}`),
  update: (data: UpdateHealthRequest) =>
    apiClient<HealthInfoResponse>('/me/health', { method: 'PUT', body: JSON.stringify(data) }),
};

// Allergies
export const allergyApi = {
  list: (includeNotes = false) =>
    apiClient<AllergyListItemResponse[]>(`/me/allergies?includeNotes=${includeNotes}`),
  create: (data: CreateAllergyRequest) =>
    apiClient<AllergyListItemResponse>('/me/allergies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateAllergyRequest) =>
    apiClient<AllergyListItemResponse>(`/me/allergies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiClient<void>(`/me/allergies/${id}`, { method: 'DELETE' }),
};

// Medications
export const medicationApi = {
  list: (includeNotes = false) =>
    apiClient<MedicationListItemResponse[]>(`/me/medications?includeNotes=${includeNotes}`),
  create: (data: CreateMedicationRequest) =>
    apiClient<MedicationListItemResponse>('/me/medications', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateMedicationRequest) =>
    apiClient<MedicationListItemResponse>(`/me/medications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiClient<void>(`/me/medications/${id}`, { method: 'DELETE' }),
};

// Emergency Contacts
export const emergencyContactApi = {
  list: () => apiClient<EmergencyContactResponse[]>('/me/emergency-contacts'),
  create: (data: CreateEmergencyContactRequest) =>
    apiClient<EmergencyContactResponse>('/me/emergency-contacts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateEmergencyContactRequest) =>
    apiClient<EmergencyContactResponse>(`/me/emergency-contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiClient<void>(`/me/emergency-contacts/${id}`, { method: 'DELETE' }),
};

// Addresses
export const addressApi = {
  list: () => apiClient<AddressResponse[]>('/me/addresses'),
  create: (data: CreateAddressRequest) =>
    apiClient<AddressResponse>('/me/addresses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateAddressRequest) =>
    apiClient<AddressResponse>(`/me/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiClient<void>(`/me/addresses/${id}`, { method: 'DELETE' }),
};
