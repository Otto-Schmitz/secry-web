import { API_BASE_URL } from './config';
import {
  MOCK_AUTH, MOCK_PROFILE, MOCK_HEALTH, MOCK_ALLERGIES,
  MOCK_MEDICATIONS, MOCK_CONTACTS, MOCK_ADDRESSES,
} from './mock-data';
import type {
  RegisterRequest, LoginRequest, AuthResponse, RefreshResponse,
  ProfileResponse, UpdateProfileRequest,
  HealthInfoResponse, UpdateHealthRequest,
  AllergyListItemResponse, CreateAllergyRequest, UpdateAllergyRequest,
  MedicationListItemResponse, CreateMedicationRequest, UpdateMedicationRequest,
  EmergencyContactResponse, CreateEmergencyContactRequest, UpdateEmergencyContactRequest,
  AddressResponse, CreateAddressRequest, UpdateAddressRequest,
  EmergencyTokenResponse, EmergencyPublicResponse,
} from '@/types/api';

// Usar API real do backend (definir VITE_USE_MOCKS=true para mocks em dev)
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// In-memory mock state (supports add/delete during session)
let mockAllergies = [...MOCK_ALLERGIES];
let mockMedications = [...MOCK_MEDICATIONS];
let mockContacts = [...MOCK_CONTACTS];
let mockAddresses = [...MOCK_ADDRESSES];
let mockHealth = { ...MOCK_HEALTH };
let mockProfile = { ...MOCK_PROFILE };

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// Token refresh state to prevent concurrent refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data: RefreshResponse = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  window.location.href = '/login';
}

async function apiClient<T>(path: string, options: RequestInit = {}, _isRetry = false): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  if (res.status === 401 && !_isRetry) {
    // Attempt token refresh (deduplicate concurrent requests)
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;
    if (refreshed) {
      // Retry the original request with new token
      return apiClient<T>(path, options, true);
    }

    // Refresh failed — clear and redirect
    clearAuthAndRedirect();
    throw new Error('Sessão expirada');
  }

  if (res.status === 401 && _isRetry) {
    clearAuthAndRedirect();
    throw new Error('Sessão expirada');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(error.message || `Erro ${res.status}`);
  }

  return res.json();
}

// Auth
export const authApi = {
  register: (data: RegisterRequest) =>
    USE_MOCKS ? delay(MOCK_AUTH) : apiClient<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: LoginRequest) =>
    USE_MOCKS ? delay(MOCK_AUTH) : apiClient<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  refresh: (refreshToken: string) =>
    USE_MOCKS ? delay({ accessToken: 'mock', refreshToken: 'mock' }) : apiClient<RefreshResponse>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  logout: (refreshToken: string) =>
    USE_MOCKS ? delay(undefined as void) : apiClient<void>('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
};

// Profile
export const profileApi = {
  get: () =>
    USE_MOCKS ? delay(mockProfile) : apiClient<ProfileResponse>('/me/profile'),
  update: (data: UpdateProfileRequest) => {
    if (USE_MOCKS) { Object.assign(mockProfile, data); return delay(mockProfile); }
    return apiClient<ProfileResponse>('/me/profile', { method: 'PUT', body: JSON.stringify(data) });
  },
};

// Health
export const healthApi = {
  get: (includeNotes = false) => {
    if (USE_MOCKS) {
      const h = { ...mockHealth, allergyCount: mockAllergies.length, medicationCount: mockMedications.length };
      if (!includeNotes) delete (h as any).medicalNotes;
      return delay(h as HealthInfoResponse);
    }
    return apiClient<HealthInfoResponse>(`/me/health?includeNotes=${includeNotes}`);
  },
  update: (data: UpdateHealthRequest) => {
    if (USE_MOCKS) { Object.assign(mockHealth, data); return delay(mockHealth); }
    return apiClient<HealthInfoResponse>('/me/health', { method: 'PUT', body: JSON.stringify(data) });
  },
};

// Allergies
export const allergyApi = {
  list: (includeNotes = false) =>
    USE_MOCKS ? delay(includeNotes ? mockAllergies : mockAllergies.map(({ notes, ...r }) => r) as AllergyListItemResponse[]) : apiClient<AllergyListItemResponse[]>(`/me/allergies?includeNotes=${includeNotes}`),
  create: (data: CreateAllergyRequest) => {
    if (USE_MOCKS) { const item = { id: `a${Date.now()}`, name: data.name, severity: data.severity || '' as any, notes: data.notes }; mockAllergies.push(item); return delay(item); }
    return apiClient<AllergyListItemResponse>('/me/allergies', { method: 'POST', body: JSON.stringify(data) });
  },
  update: (id: string, data: UpdateAllergyRequest) => {
    if (USE_MOCKS) { const i = mockAllergies.find(a => a.id === id); if (i) Object.assign(i, data); return delay(i!); }
    return apiClient<AllergyListItemResponse>(`/me/allergies/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  delete: (id: string) => {
    if (USE_MOCKS) { mockAllergies = mockAllergies.filter(a => a.id !== id); return delay(undefined as void); }
    return apiClient<void>(`/me/allergies/${id}`, { method: 'DELETE' });
  },
};

// Medications
export const medicationApi = {
  list: (includeNotes = false) =>
    USE_MOCKS ? delay(includeNotes ? mockMedications : mockMedications.map(({ notes, ...r }) => r) as MedicationListItemResponse[]) : apiClient<MedicationListItemResponse[]>(`/me/medications?includeNotes=${includeNotes}`),
  create: (data: CreateMedicationRequest) => {
    if (USE_MOCKS) { const item = { id: `m${Date.now()}`, name: data.name, dosage: data.dosage || '', frequency: data.frequency || '', notes: data.notes }; mockMedications.push(item); return delay(item); }
    return apiClient<MedicationListItemResponse>('/me/medications', { method: 'POST', body: JSON.stringify(data) });
  },
  update: (id: string, data: UpdateMedicationRequest) => {
    if (USE_MOCKS) { const i = mockMedications.find(m => m.id === id); if (i) Object.assign(i, data); return delay(i!); }
    return apiClient<MedicationListItemResponse>(`/me/medications/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  delete: (id: string) => {
    if (USE_MOCKS) { mockMedications = mockMedications.filter(m => m.id !== id); return delay(undefined as void); }
    return apiClient<void>(`/me/medications/${id}`, { method: 'DELETE' });
  },
};

// Emergency Contacts
export const emergencyContactApi = {
  list: () =>
    USE_MOCKS ? delay([...mockContacts]) : apiClient<EmergencyContactResponse[]>('/me/emergency-contacts'),
  create: (data: CreateEmergencyContactRequest) => {
    if (USE_MOCKS) { const item = { id: `c${Date.now()}`, name: data.name, phone: data.phone, relationship: data.relationship || '', priority: data.priority || mockContacts.length + 1 }; mockContacts.push(item); return delay(item); }
    return apiClient<EmergencyContactResponse>('/me/emergency-contacts', { method: 'POST', body: JSON.stringify(data) });
  },
  update: (id: string, data: UpdateEmergencyContactRequest) => {
    if (USE_MOCKS) { const i = mockContacts.find(c => c.id === id); if (i) Object.assign(i, data); return delay(i!); }
    return apiClient<EmergencyContactResponse>(`/me/emergency-contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  delete: (id: string) => {
    if (USE_MOCKS) { mockContacts = mockContacts.filter(c => c.id !== id); return delay(undefined as void); }
    return apiClient<void>(`/me/emergency-contacts/${id}`, { method: 'DELETE' });
  },
};

// Addresses
export const addressApi = {
  list: () =>
    USE_MOCKS ? delay([...mockAddresses]) : apiClient<AddressResponse[]>('/me/addresses'),
  create: (data: CreateAddressRequest) => {
    if (USE_MOCKS) { const item = { id: `d${Date.now()}`, label: data.label, isPrimary: data.isPrimary || false, street: data.street || '', number: data.number || '', city: data.city || '', state: data.state || '', zip: data.zip || '', country: data.country || '' }; mockAddresses.push(item); return delay(item); }
    return apiClient<AddressResponse>('/me/addresses', { method: 'POST', body: JSON.stringify(data) });
  },
  update: (id: string, data: UpdateAddressRequest) => {
    if (USE_MOCKS) { const i = mockAddresses.find(a => a.id === id); if (i) Object.assign(i, data); return delay(i!); }
    return apiClient<AddressResponse>(`/me/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  delete: (id: string) => {
    if (USE_MOCKS) { mockAddresses = mockAddresses.filter(a => a.id !== id); return delay(undefined as void); }
    return apiClient<void>(`/me/addresses/${id}`, { method: 'DELETE' });
  },
};

// Export
export const exportApi = {
  getAll: () =>
    USE_MOCKS ? delay({ profile: mockProfile, health: mockHealth, allergies: mockAllergies, medications: mockMedications, emergencyContacts: mockContacts, addresses: mockAddresses, exportedAt: new Date().toISOString() }) : apiClient<any>('/me/export'),
};

// Emergency Token (authenticated)
export const emergencyTokenApi = {
  get: () =>
    USE_MOCKS ? delay({ token: 'mock-emergency-token-abc123', active: true } as EmergencyTokenResponse) : apiClient<EmergencyTokenResponse>('/me/emergency-token'),
  regenerate: () =>
    USE_MOCKS ? delay({ token: `mock-${Date.now()}`, active: true } as EmergencyTokenResponse) : apiClient<EmergencyTokenResponse>('/me/emergency-token/regenerate', { method: 'POST' }),
};

// Emergency Public (no auth required)
export const emergencyPublicApi = {
  get: (token: string) => {
    if (USE_MOCKS) {
      return delay({
        name: 'Lucas Oliveira', bloodType: 'O+', phone: '(11) 98765-4321',
        allergies: [{ name: 'Amendoim', severity: 'HIGH' }, { name: 'Dipirona', severity: 'MEDIUM' }],
        medications: [{ name: 'Losartana', dosage: '50mg', frequency: '1x ao dia' }],
        emergencyContacts: [{ name: 'Ana Oliveira', relationship: 'Cônjuge', phone: '(11) 91234-5678', priority: 1 }],
      } as EmergencyPublicResponse);
    }
    // Public endpoint — no auth header needed
    return fetch(`${API_BASE_URL}/emergency/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({ message: 'Token inválido' }));
          throw new Error(error.message || 'Erro ao carregar dados de emergência');
        }
        return res.json() as Promise<EmergencyPublicResponse>;
      });
  },
};
