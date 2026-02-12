import type {
  AuthResponse, ProfileResponse, HealthInfoResponse,
  AllergyListItemResponse, MedicationListItemResponse,
  EmergencyContactResponse, AddressResponse,
} from '@/types/api';

export const MOCK_AUTH: AuthResponse = {
  userId: 'mock-user-001',
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

export const MOCK_PROFILE: ProfileResponse = {
  fullName: 'Lucas Oliveira',
  birthDate: '1992-06-15',
  phone: '(11) 98765-4321',
  workplace: 'Hospital São Paulo',
};

export const MOCK_HEALTH: HealthInfoResponse = {
  bloodType: 'O+',
  allergyCount: 3,
  medicationCount: 2,
  medicalNotes: 'Histórico familiar de hipertensão. Última consulta cardiológica em janeiro/2026. Nenhuma cirurgia prévia.',
};

export const MOCK_ALLERGIES: AllergyListItemResponse[] = [
  { id: 'a1', name: 'Amendoim', severity: 'HIGH', notes: 'Risco de anafilaxia — manter EpiPen acessível' },
  { id: 'a2', name: 'Dipirona', severity: 'MEDIUM', notes: 'Causa urticária' },
  { id: 'a3', name: 'Poeira', severity: 'LOW', notes: 'Rinite alérgica leve' },
];

export const MOCK_MEDICATIONS: MedicationListItemResponse[] = [
  { id: 'm1', name: 'Losartana', dosage: '50mg', frequency: '1x ao dia', notes: 'Tomar pela manhã em jejum' },
  { id: 'm2', name: 'Vitamina D', dosage: '2000 UI', frequency: '1x ao dia', notes: 'Suplementação contínua' },
];

export const MOCK_CONTACTS: EmergencyContactResponse[] = [
  { id: 'c1', name: 'Ana Oliveira', relationship: 'Cônjuge', phone: '(11) 91234-5678', priority: 1 },
  { id: 'c2', name: 'Carlos Oliveira', relationship: 'Pai', phone: '(11) 93456-7890', priority: 2 },
];

export const MOCK_ADDRESSES: AddressResponse[] = [
  { id: 'd1', label: 'HOME', isPrimary: true, street: 'Rua Augusta', number: '1200', city: 'São Paulo', state: 'SP', zip: '01304-001', country: 'Brasil' },
  { id: 'd2', label: 'WORK', isPrimary: false, street: 'Rua Napoleão de Barros', number: '715', city: 'São Paulo', state: 'SP', zip: '04024-002', country: 'Brasil' },
];
