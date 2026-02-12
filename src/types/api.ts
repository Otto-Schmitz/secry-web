// Auth
export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Profile
export interface ProfileResponse {
  fullName: string;
  birthDate: string | null;
  phone: string | null;
  workplace: string | null;
}

export interface UpdateProfileRequest {
  fullName?: string;
  birthDate?: string;
  phone?: string;
  workplace?: string;
}

// Health
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';

export interface HealthInfoResponse {
  bloodType: BloodType;
  allergyCount: number;
  medicationCount: number;
  medicalNotes?: string;
}

export interface UpdateHealthRequest {
  bloodType?: BloodType;
  medicalNotes?: string;
}

// Allergies
export type AllergySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AllergyListItemResponse {
  id: string;
  name: string;
  severity: AllergySeverity | '';
  notes?: string;
}

export interface CreateAllergyRequest {
  name: string;
  severity?: AllergySeverity;
  notes?: string;
}

export interface UpdateAllergyRequest {
  name?: string;
  severity?: AllergySeverity;
  notes?: string;
}

// Medications
export interface MedicationListItemResponse {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
}

export interface CreateMedicationRequest {
  name: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
}

export interface UpdateMedicationRequest {
  name?: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
}

// Emergency Contacts
export interface EmergencyContactResponse {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
}

export interface CreateEmergencyContactRequest {
  name: string;
  relationship?: string;
  phone: string;
  priority?: number;
}

export interface UpdateEmergencyContactRequest {
  name?: string;
  relationship?: string;
  phone?: string;
  priority?: number;
}

// Addresses
export type AddressLabel = 'HOME' | 'WORK' | 'OTHER';

export interface AddressResponse {
  id: string;
  label: AddressLabel;
  isPrimary: boolean;
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CreateAddressRequest {
  label: AddressLabel;
  isPrimary?: boolean;
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface UpdateAddressRequest {
  label?: AddressLabel;
  isPrimary?: boolean;
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

// Error
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  traceId?: string;
}
