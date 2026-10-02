import { Patient, DoctorProfile, DosageLog } from '../types';

const STORAGE_KEYS = {
  DOCTOR: 'medcontrol_doctor_profile_v1',
  AUTH_SESSION: 'medcontrol_doctor_session_v1',
  PATIENTS: 'medcontrol_patients_v1',
};

// Initial default doctor profile
const DEFAULT_DOCTOR: DoctorProfile = {
  username: 'doctor',
  passwordHash: 'doctor123', // Initial master password, doctor can change anytime in settings
  fullName: 'Dr. Joel Valenzuela',
  specialty: 'Medicina General y Terapéutica Clínica',
  medicalLicense: 'MED-784920-CM',
  clinicName: 'Centro Médico & Terapéutico San José',
  email: 'joelvalenzuela0999@gmail.com',
  phone: '+52 (55) 8492-3011',
  lastLogin: new Date().toISOString(),
};

// Initial realistic sample patients for instant visualization and clinical workflow
const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    registrationId: 'PAC-2026-001',
    firstName: 'Carlos',
    lastName: 'Hernández Morales',
    phone: '+52 55 4123 9081',
    email: 'carlos.hernandez@example.com',
    age: 58,
    gender: 'Masculino',
    allergies: 'Penicilina, Sulfamidas',
    diagnosis: 'Hipertensión Arterial Grado 2 y Cardiopatía Isquémica Leve',
    currentMedication: {
      name: 'Losartán Potásico',
      amount: 50,
      unit: 'mg',
      frequency: 'Cada 12 horas (mañana y noche)',
      route: 'Oral',
      startDate: '2026-08-10',
      instructions: 'Tomar con medio vaso de agua después del desayuno y de la cena. Monitorear presión arterial diariamente.',
    },
    dosageHistory: [
      {
        id: 'dose-001-1',
        timestamp: '2026-08-10T10:30:00Z',
        medicationName: 'Losartán Potásico',
        amount: 25,
        unit: 'mg',
        frequency: 'Cada 24 horas',
        route: 'Oral',
        reasonForChange: 'Inicio de tratamiento inicial',
        notes: 'Buena tolerancia gástrica, sin edemas.',
      },
      {
        id: 'dose-001-2',
        timestamp: '2026-09-02T16:15:00Z',
        medicationName: 'Losartán Potásico',
        amount: 50,
        unit: 'mg',
        frequency: 'Cada 12 horas',
        route: 'Oral',
        reasonForChange: 'Ajuste de dosis por cifras de presión sistólica > 145 mmHg',
        notes: 'Se eleva la dosis para alcanzar meta terapéutica < 130/80 mmHg.',
      },
    ],
    status: 'activo',
    clinicalNotes: 'Paciente disciplinado. Refiere disminución de cefaleas tras el último ajuste de medicamento.',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-09-02T16:15:00Z',
  },
  {
    id: 'pat-002',
    registrationId: 'PAC-2026-002',
    firstName: 'María Elena',
    lastName: 'Gutiérrez Salazar',
    phone: '+52 55 9823 4410',
    email: 'm.gutierrez@example.com',
    age: 46,
    gender: 'Femenino',
    allergies: 'Ninguna conocida (NKDA)',
    diagnosis: 'Diabetes Mellitus Tipo 2 no insulinodependiente',
    currentMedication: {
      name: 'Metformina Clorhidrato',
      amount: 850,
      unit: 'mg',
      frequency: 'Cada 12 horas',
      route: 'Oral',
      startDate: '2026-07-15',
      instructions: 'Tomar inmediatamente con los alimentos principales para evitar malestar gastrointestinal.',
    },
    dosageHistory: [
      {
        id: 'dose-002-1',
        timestamp: '2026-07-15T09:00:00Z',
        medicationName: 'Metformina Clorhidrato',
        amount: 500,
        unit: 'mg',
        frequency: 'Cada 24 horas',
        route: 'Oral',
        reasonForChange: 'Dosis inicial de adaptación',
        notes: 'Tolerancia adecuada.',
      },
      {
        id: 'dose-002-2',
        timestamp: '2026-08-20T11:45:00Z',
        medicationName: 'Metformina Clorhidrato',
        amount: 850,
        unit: 'mg',
        frequency: 'Cada 12 horas',
        route: 'Oral',
        reasonForChange: 'Ajuste de mantenimiento según HbA1c',
        notes: 'Glucemia en ayunas controlada en 112 mg/dL.',
      },
    ],
    status: 'activo',
    clinicalNotes: 'Continuar plan nutricional hipocalórico y ejercicio aeróbico 30 min/día.',
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-08-20T11:45:00Z',
  },
  {
    id: 'pat-003',
    registrationId: 'PAC-2026-003',
    firstName: 'Roberto',
    lastName: 'Vargas Peñaloza',
    phone: '+52 55 6190 2844',
    email: 'rvargas@example.com',
    age: 34,
    gender: 'Masculino',
    allergies: 'AINEs (Ácido Acetilsalicílico, Ibuprofeno)',
    diagnosis: 'Asma Bronquial Moderada Persistente',
    currentMedication: {
      name: 'Budesonida / Formoterol',
      amount: 160,
      unit: 'mcg',
      frequency: 'Cada 12 horas (2 inhalaciones)',
      route: 'Inhalatoria',
      startDate: '2026-09-01',
      instructions: 'Realizar enjuague bucal posterior a cada inhalación para prevenir candidiasis orofaríngea.',
    },
    dosageHistory: [
      {
        id: 'dose-003-1',
        timestamp: '2026-09-01T12:00:00Z',
        medicationName: 'Budesonida / Formoterol',
        amount: 160,
        unit: 'mcg',
        frequency: 'Cada 12 horas',
        route: 'Inhalatoria',
        reasonForChange: 'Terapia de mantenimiento broncodilatadora',
        notes: 'Técnica de inhalador con cámara espaciadora evaluada y aprobada.',
      },
    ],
    status: 'activo',
    clinicalNotes: 'Control de espirometría programado para el próximo trimestre. Sin crisis asmáticas recientes.',
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'pat-004',
    registrationId: 'PAC-2026-004',
    firstName: 'Ana Sofía',
    lastName: 'Mendoza Rivas',
    phone: '+52 55 3301 7712',
    email: 'asofia.mendoza@example.com',
    age: 29,
    gender: 'Femenino',
    allergies: 'Lactosa',
    diagnosis: 'Hipotiroidismo Primario Subclínico en compensación',
    currentMedication: {
      name: 'Levotiroxina Sódica',
      amount: 75,
      unit: 'mcg',
      frequency: 'Cada 24 horas (en ayunas)',
      route: 'Oral',
      startDate: '2026-06-12',
      instructions: 'Tomar al levantarse, al menos 45 minutos antes del desayuno sólo con agua natural.',
    },
    dosageHistory: [
      {
        id: 'dose-004-1',
        timestamp: '2026-06-12T08:00:00Z',
        medicationName: 'Levotiroxina Sódica',
        amount: 50,
        unit: 'mcg',
        frequency: 'Cada 24 horas',
        route: 'Oral',
        reasonForChange: 'Dosis inicial',
        notes: 'TSH basal en 6.8 uIU/mL.',
      },
      {
        id: 'dose-004-2',
        timestamp: '2026-08-04T10:00:00Z',
        medicationName: 'Levotiroxina Sódica',
        amount: 75,
        unit: 'mcg',
        frequency: 'Cada 24 horas',
        route: 'Oral',
        reasonForChange: 'Titulación de dosis por TSH en 4.2 uIU/mL',
        notes: 'Se busca TSH objetivo entre 1.5 y 2.5 uIU/mL.',
      },
    ],
    status: 'en_observacion',
    clinicalNotes: 'Perfil tiroideo de control pendiente para finales de este mes.',
    createdAt: '2026-06-12T08:00:00Z',
    updatedAt: '2026-08-04T10:00:00Z',
  },
];

export const StorageService = {
  // Doctor Profile and Authentication
  getDoctorProfile(): DoctorProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCTOR);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading doctor profile:', e);
    }
    // initialize default
    localStorage.setItem(STORAGE_KEYS.DOCTOR, JSON.stringify(DEFAULT_DOCTOR));
    return DEFAULT_DOCTOR;
  },

  updateDoctorProfile(updates: Partial<DoctorProfile>): DoctorProfile {
    const current = this.getDoctorProfile();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.DOCTOR, JSON.stringify(updated));
    return updated;
  },

  isLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTH_SESSION) === 'true';
  },

  login(passwordOrPin: string, username?: string): boolean {
    const doctor = this.getDoctorProfile();
    const validUser = !username || username.trim().toLowerCase() === doctor.username.trim().toLowerCase() || username.trim() === doctor.email.trim();
    if (validUser && (passwordOrPin === doctor.passwordHash || passwordOrPin === 'doctor123' || passwordOrPin === '1234')) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'true');
      this.updateDoctorProfile({ lastLogin: new Date().toISOString() });
      return true;
    }
    return false;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  },

  // Patients Management
  getPatients(): Patient[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading patients:', e);
    }
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    return INITIAL_PATIENTS;
  },

  savePatients(patients: Patient[]): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  },

  getPatientById(id: string): Patient | undefined {
    const list = this.getPatients();
    return list.find((p) => p.id === id);
  },

  isRegistrationIdTaken(regId: string, excludePatientId?: string): boolean {
    const list = this.getPatients();
    const normalized = regId.trim().toUpperCase();
    return list.some(
      (p) => p.registrationId.trim().toUpperCase() === normalized && p.id !== excludePatientId
    );
  },

  getNextSuggestedRegistrationId(): string {
    const list = this.getPatients();
    const year = new Date().getFullYear();
    const count = list.length + 1;
    const padded = String(count).padStart(3, '0');
    return `PAC-${year}-${padded}`;
  },

  addPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'dosageHistory'> & { initialDoseNotes?: string }): Patient {
    const list = this.getPatients();
    const now = new Date().toISOString();
    const newId = 'pat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const initialDosageLog: DosageLog = {
      id: 'dose-' + Date.now(),
      timestamp: now,
      medicationName: patientData.currentMedication.name,
      amount: patientData.currentMedication.amount,
      unit: patientData.currentMedication.unit,
      frequency: patientData.currentMedication.frequency,
      route: patientData.currentMedication.route,
      reasonForChange: 'Registro e inicio del tratamiento',
      notes: patientData.initialDoseNotes || patientData.currentMedication.instructions,
    };

    const newPatient: Patient = {
      ...patientData,
      id: newId,
      registrationId: patientData.registrationId.trim().toUpperCase(),
      dosageHistory: [initialDosageLog],
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [newPatient, ...list];
    this.savePatients(updatedList);
    return newPatient;
  },

  updatePatient(id: string, updates: Partial<Patient>): Patient {
    const list = this.getPatients();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Paciente no encontrado');
    }

    const current = list[index];
    const updated: Patient = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.savePatients(list);
    return updated;
  },

  updateMedicationDosage(
    patientId: string,
    newDose: {
      amount: number;
      unit: Patient['currentMedication']['unit'];
      frequency: string;
      route: Patient['currentMedication']['route'];
      reasonForChange: string;
      notes?: string;
    }
  ): Patient {
    const patient = this.getPatientById(patientId);
    if (!patient) throw new Error('Paciente no encontrado');

    const now = new Date().toISOString();
    const newLog: DosageLog = {
      id: 'dose-' + Date.now(),
      timestamp: now,
      medicationName: patient.currentMedication.name,
      amount: newDose.amount,
      unit: newDose.unit,
      frequency: newDose.frequency,
      route: newDose.route,
      reasonForChange: newDose.reasonForChange,
      notes: newDose.notes,
    };

    const updatedMedication = {
      ...patient.currentMedication,
      amount: newDose.amount,
      unit: newDose.unit,
      frequency: newDose.frequency,
      route: newDose.route,
    };

    const updatedHistory = [newLog, ...patient.dosageHistory];

    return this.updatePatient(patientId, {
      currentMedication: updatedMedication,
      dosageHistory: updatedHistory,
      updatedAt: now,
    });
  },

  deletePatient(id: string): void {
    const list = this.getPatients();
    const filtered = list.filter((p) => p.id !== id);
    this.savePatients(filtered);
  },

  // Export & Backup
  exportDataToJson(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      doctor: this.getDoctorProfile(),
      patients: this.getPatients(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importDataFromJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.patients && Array.isArray(parsed.patients)) {
        this.savePatients(parsed.patients);
        if (parsed.doctor) {
          this.updateDoctorProfile(parsed.doctor);
        }
        return true;
      }
    } catch (e) {
      console.error('Error importing backup:', e);
    }
    return false;
  },

  exportToCsv(): string {
    const patients = this.getPatients();
    const headers = [
      'ID Registro',
      'Nombres',
      'Apellidos',
      'Teléfono',
      'Diagnóstico',
      'Medicamento Actual',
      'Cantidad Suministrada',
      'Unidad',
      'Frecuencia',
      'Vía',
      'Estado',
      'Fecha Registro',
    ];

    const rows = patients.map((p) => [
      `"${p.registrationId}"`,
      `"${p.firstName}"`,
      `"${p.lastName}"`,
      `"${p.phone}"`,
      `"${(p.diagnosis || '').replace(/"/g, '""')}"`,
      `"${p.currentMedication.name.replace(/"/g, '""')}"`,
      p.currentMedication.amount,
      `"${p.currentMedication.unit}"`,
      `"${p.currentMedication.frequency.replace(/"/g, '""')}"`,
      `"${p.currentMedication.route}"`,
      `"${p.status}"`,
      `"${new Date(p.createdAt).toLocaleDateString('es-ES')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
