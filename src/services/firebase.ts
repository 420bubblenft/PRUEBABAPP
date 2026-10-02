import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Patient, DosageLog } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const defaultDb = getFirestore(app); // Also connect to (default) database so data appears in both views in Firebase Console
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function signInDoctorWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Firebase signInWithEmailAndPassword Error:', error);
    throw error;
  }
}

export async function registerDoctorWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Firebase createUserWithEmailAndPassword Error:', error);
    throw error;
  }
}

export async function signOutDoctor(): Promise<void> {
  await fbSignOut(auth);
}

// Firestore Patients Operations
export function subscribeToDoctorPatients(
  doctorId: string,
  onPatients: (patients: Patient[]) => void,
  onError?: (error: Error) => void
) {
  const path = 'patients';
  const q = query(collection(db, path), where('doctorId', '==', doctorId));

  return onSnapshot(
    q,
    async (snapshot) => {
      const list: Patient[] = [];
      for (const docSnap of snapshot.docs) {
        const d = docSnap.data();
        const p: Patient = {
          id: docSnap.id,
          registrationId: d.registrationId,
          firstName: d.firstName,
          lastName: d.lastName,
          phone: d.phone,
          email: d.email,
          age: d.age,
          gender: d.gender,
          allergies: d.allergies,
          diagnosis: d.diagnosis,
          currentMedication: {
            name: d.medicationName,
            amount: d.medicationAmount,
            unit: d.medicationUnit,
            frequency: d.medicationFrequency || 'Cada 12 horas',
            route: d.medicationRoute || 'Oral',
            startDate: d.startDate || d.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            instructions: d.medicationInstructions || '',
          },
          dosageHistory: [],
          status: d.status || 'activo',
          clinicalNotes: d.clinicalNotes || '',
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt || new Date().toISOString(),
        };

        list.push(p);
      }
      onPatients(list);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToDosageLogs(
  patientId: string,
  onLogs: (logs: DosageLog[]) => void
) {
  const path = `patients/${patientId}/dosageLogs`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const logs: DosageLog[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          timestamp: d.timestamp,
          medicationName: d.medicationName,
          amount: d.amount,
          unit: d.unit,
          frequency: d.frequency || '',
          route: d.route || 'Oral',
          reasonForChange: d.reasonForChange,
          notes: d.notes,
        };
      });
      // Sort newest first
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onLogs(logs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function savePatientToFirestore(patient: Patient, doctorId: string): Promise<void> {
  const path = `patients/${patient.id}`;
  const dataToSave = {
    registrationId: patient.registrationId,
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    ...(patient.email ? { email: patient.email } : {}),
    ...(patient.age !== undefined && patient.age !== null ? { age: Number(patient.age) } : {}),
    gender: patient.gender,
    ...(patient.allergies ? { allergies: patient.allergies } : {}),
    ...(patient.diagnosis ? { diagnosis: patient.diagnosis } : {}),
    medicationName: patient.currentMedication.name,
    medicationAmount: Number(patient.currentMedication.amount),
    medicationUnit: patient.currentMedication.unit,
    medicationFrequency: patient.currentMedication.frequency,
    medicationRoute: patient.currentMedication.route,
    medicationInstructions: patient.currentMedication.instructions || '',
    status: patient.status,
    clinicalNotes: patient.clinicalNotes || '',
    doctorId: doctorId,
    createdAt: patient.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // 1. Write to the assigned database
    await setDoc(doc(db, 'patients', patient.id), dataToSave, { merge: true });

    // 2. Also write to default database (if different) so it appears in the default Firestore Console view
    try {
      if (defaultDb) {
        await setDoc(doc(defaultDb, 'patients', patient.id), dataToSave, { merge: true });
      }
    } catch (e) {
      // Ignored if (default) database does not exist
    }

    // Persist dosage history logs
    if (patient.dosageHistory && patient.dosageHistory.length > 0) {
      for (const log of patient.dosageHistory) {
        await addDosageLogToFirestore(patient.id, log, doctorId);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function addDosageLogToFirestore(patientId: string, log: DosageLog, doctorId: string): Promise<void> {
  const logId = log.id || `dose-${Date.now()}`;
  const path = `patients/${patientId}/dosageLogs/${logId}`;
  const data = {
    medicationName: log.medicationName,
    amount: Number(log.amount),
    unit: log.unit,
    frequency: log.frequency || '',
    route: log.route || 'Oral',
    reasonForChange: log.reasonForChange || 'Suministro registrado',
    notes: log.notes || '',
    doctorId: doctorId,
    timestamp: log.timestamp || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'patients', patientId, 'dosageLogs', logId), data);
    try {
      if (defaultDb) {
        await setDoc(doc(defaultDb, 'patients', patientId, 'dosageLogs', logId), data);
      }
    } catch {
      // Ignored
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePatientFromFirestore(patientId: string): Promise<void> {
  const path = `patients/${patientId}`;
  try {
    await deleteDoc(doc(db, 'patients', patientId));
    try {
      if (defaultDb) {
        await deleteDoc(doc(defaultDb, 'patients', patientId));
      }
    } catch {
      // Ignored
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncAllPatientsToCloud(doctorId: string, patientsList: Patient[]): Promise<{ count: number }> {
  let count = 0;
  for (const patient of patientsList) {
    await savePatientToFirestore(patient, doctorId);
    count++;
  }
  return { count };
}
