export interface DosageLog {
  id: string;
  timestamp: string;
  medicationName: string;
  amount: number;
  unit: 'mg' | 'ml' | 'mcg' | 'comprimidos' | 'gotas' | 'UI' | 'g' | 'ampollas';
  frequency: string;
  route: 'Oral' | 'Intravenosa (IV)' | 'Intramuscular (IM)' | 'Subcutánea' | 'Tópica' | 'Inhalatoria' | 'Sublingual';
  reasonForChange?: string;
  notes?: string;
}

export interface CurrentMedication {
  name: string;
  amount: number;
  unit: 'mg' | 'ml' | 'mcg' | 'comprimidos' | 'gotas' | 'UI' | 'g' | 'ampollas';
  frequency: string;
  route: 'Oral' | 'Intravenosa (IV)' | 'Intramuscular (IM)' | 'Subcutánea' | 'Tópica' | 'Inhalatoria' | 'Sublingual';
  startDate: string;
  instructions: string;
}

export interface Patient {
  id: string;
  registrationId: string; // Identificador único clínico (ej: PAC-2026-001)
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  age?: number;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  allergies?: string;
  diagnosis: string;
  currentMedication: CurrentMedication;
  dosageHistory: DosageLog[];
  status: 'activo' | 'en_observacion' | 'completado' | 'suspendido';
  clinicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfile {
  username: string;
  passwordHash: string; // simple hashed or protected string for local admin
  fullName: string;
  specialty: string;
  medicalLicense: string; // Cédula profesional
  clinicName: string;
  email: string;
  phone: string;
  lastLogin?: string;
}
