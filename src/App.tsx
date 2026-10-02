/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './services/storage';
import { Patient, DoctorProfile } from './types';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { PatientList } from './components/PatientList';
import { PatientFormModal } from './components/PatientFormModal';
import { DosageUpdateModal } from './components/DosageUpdateModal';
import { PatientDetailModal } from './components/PatientDetailModal';
import { PrintPrescriptionModal } from './components/PrintPrescriptionModal';
import { DoctorSettingsModal } from './components/DoctorSettingsModal';
import { Stethoscope, CheckCircle2, Cloud, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import {
  auth,
  testConnection,
  savePatientToFirestore,
  addDosageLogToFirestore,
  deletePatientFromFirestore,
  subscribeToDoctorPatients,
  signOutDoctor,
  signInWithGoogle,
  syncAllPatientsToCloud,
} from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => StorageService.isLoggedIn());
  const [doctor, setDoctor] = useState<DoctorProfile>(() => StorageService.getDoctorProfile());
  const [patients, setPatients] = useState<Patient[]>(() => StorageService.getPatients());
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState(false);

  // Modal States
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const [isDosageModalOpen, setIsDosageModalOpen] = useState(false);
  const [patientForDosage, setPatientForDosage] = useState<Patient | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [patientForPrint, setPatientForPrint] = useState<Patient | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const refreshPatients = useCallback(() => {
    const list = StorageService.getPatients();
    setPatients(list);
  }, []);

  // Test connection on mount as mandated by Firebase skill
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        setIsAuthenticated(true);
        // Sync doctor profile with Google profile
        if (user.displayName && doctor.fullName === 'Dr. Joel Valenzuela') {
          const updated = StorageService.updateDoctorProfile({
            fullName: user.displayName,
            email: user.email || doctor.email,
          });
          setDoctor(updated);
        }

        // Automatically push existing local patients to Firebase Firestore on login
        try {
          const localList = StorageService.getPatients();
          if (localList.length > 0) {
            await syncAllPatientsToCloud(user.uid, localList);
          }
        } catch (e) {
          console.warn('Initial cloud sync notice:', e);
        }
      } else {
        setFirebaseUser(null);
      }
    });

    return () => unsubscribe();
  }, [doctor]);

  // Subscribe to real-time Firestore updates if authenticated with Firebase
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = subscribeToDoctorPatients(
      firebaseUser.uid,
      (cloudPatients) => {
        if (cloudPatients.length > 0) {
          // Merge / update local patients
          setPatients(cloudPatients);
          StorageService.savePatients(cloudPatients);
        } else {
          // If cloud has 0 patients but local has patients, sync initial local to cloud
          const localList = StorageService.getPatients();
          if (localList.length > 0) {
            syncAllPatientsToCloud(firebaseUser.uid, localList);
          }
        }
      },
      (error) => {
        console.warn('Real-time listener notice:', error);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  const handleConnectGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      const localList = StorageService.getPatients();
      const res = await syncAllPatientsToCloud(user.uid, localList);
      showToast(`¡Conectado! Se guardaron ${res.count} pacientes en Firebase (pruebafinal-9704d).`);
    } catch (e: any) {
      console.error(e);
      showToast('Error al conectar con Google: ' + (e?.message || 'Error'));
    }
  };

  const handleSyncToFirebase = async () => {
    if (!firebaseUser) {
      showToast('Inicia sesión con Google o Correo para sincronizar con Firebase.');
      return;
    }
    setIsFirebaseSyncing(true);
    try {
      const list = StorageService.getPatients();
      const res = await syncAllPatientsToCloud(firebaseUser.uid, list);
      showToast(`¡Éxito! ${res.count} pacientes guardados en Firebase Firestore (pruebafinal-9704d).`);
    } catch (e: any) {
      console.error(e);
      showToast('Error al guardar en Firebase: ' + (e?.message || 'Error'));
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setDoctor(StorageService.getDoctorProfile());
    refreshPatients();
  };

  const handleLogout = async () => {
    if (firebaseUser) {
      try {
        await signOutDoctor();
      } catch (e) {
        console.error(e);
      }
    }
    StorageService.logout();
    setIsAuthenticated(false);
    setFirebaseUser(null);
  };

  // Open Handlers
  const handleOpenNewPatient = () => {
    setPatientToEdit(null);
    setIsPatientFormOpen(true);
  };

  const handleOpenEditPatient = (patient: Patient) => {
    setPatientToEdit(patient);
    setIsPatientFormOpen(true);
  };

  const handleOpenUpdateDosage = (patient: Patient) => {
    setPatientForDosage(patient);
    setIsDosageModalOpen(true);
  };

  const handleOpenDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailModalOpen(true);
  };

  const handleOpenPrint = (patient: Patient) => {
    setPatientForPrint(patient);
    setIsPrintModalOpen(true);
  };

  // Save & Update Callbacks
  const handlePatientSaved = async (saved: Patient) => {
    setIsPatientFormOpen(false);
    refreshPatients();

    if (selectedPatient && selectedPatient.id === saved.id) {
      setSelectedPatient(saved);
    }

    // Persist to Firebase if connected
    if (firebaseUser) {
      try {
        await savePatientToFirestore(saved, firebaseUser.uid);
        showToast(`Paciente ${saved.firstName} ${saved.lastName} guardado en Firebase Nube.`);
      } catch (e) {
        console.error('Firebase save error:', e);
        showToast(`Paciente guardado localmente.`);
      }
    } else {
      showToast(`Paciente ${saved.firstName} ${saved.lastName} (${saved.registrationId}) guardado.`);
    }
  };

  const handleDosageUpdated = async (updated: Patient) => {
    refreshPatients();
    if (selectedPatient && selectedPatient.id === updated.id) {
      setSelectedPatient(updated);
    }

    // Persist to Firebase if connected
    if (firebaseUser) {
      try {
        await savePatientToFirestore(updated, firebaseUser.uid);
        if (updated.dosageHistory && updated.dosageHistory.length > 0) {
          await addDosageLogToFirestore(updated.id, updated.dosageHistory[0], firebaseUser.uid);
        }
        showToast(`Dosis actualizada a ${updated.currentMedication.amount} ${updated.currentMedication.unit} y sincronizada en Firebase.`);
      } catch (e) {
        console.error('Firebase dosage update error:', e);
        showToast(`Dosis actualizada.`);
      }
    } else {
      showToast(`Dosis actualizada a ${updated.currentMedication.amount} ${updated.currentMedication.unit}.`);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    StorageService.deletePatient(patientId);
    refreshPatients();
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(null);
      setIsDetailModalOpen(false);
    }

    if (firebaseUser) {
      try {
        await deletePatientFromFirestore(patientId);
      } catch (e) {
        console.error(e);
      }
    }

    showToast('Registro de paciente eliminado.');
  };

  const handleExportCsv = () => {
    const csvStr = StorageService.exportToCsv();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pacientes_dosis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Planilla CSV exportada con éxito.');
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-teal-500/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        doctor={doctor}
        isFirebaseActive={Boolean(firebaseUser)}
        onOpenNewPatientModal={handleOpenNewPatient}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onExportCsv={handleExportCsv}
        onLogout={handleLogout}
      />

      {/* Main Clinical Portal Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Doctor Welcome Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Panel de Control Clínico</span>
              <span className="text-xs font-semibold font-mono text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded">
                ADMINISTRADOR ÚNICO
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Gestión de expedientes, registro de dosis y seguimiento médico</span>
              {firebaseUser && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1 text-xs">
                    <Cloud className="w-3.5 h-3.5" /> Conectado a Firestore ({firebaseUser.email})
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:text-right">
            {firebaseUser ? (
              <button
                type="button"
                onClick={handleSyncToFirebase}
                disabled={isFirebaseSyncing}
                className="px-3 py-1.5 text-xs bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Sincronizar base de datos con Firebase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFirebaseSyncing ? 'animate-spin' : ''}`} />
                <span>{isFirebaseSyncing ? 'Sincronizando...' : 'Sincronizar con Nube'}</span>
              </button>
            ) : null}
            <div className="text-xs text-slate-400 font-mono">
              <div>{doctor.clinicName}</div>
              <div className="text-[11px] text-teal-400 font-semibold">{doctor.medicalLicense}</div>
            </div>
          </div>
        </div>

        {/* Firebase Cloud Sync Status Card */}
        {!firebaseUser ? (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-100">
                  Pacientes almacenados localmente en el navegador
                </p>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Para que tus {patients.length} pacientes aparezcan en la base de datos de Firebase (<code>pruebafinal-9704d</code>), inicia sesión con Firebase:
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleConnectGoogle}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors"
              >
                <span>Conectar con Google</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium text-xs cursor-pointer transition-colors"
              >
                <span>Login Correo/Clave</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">Base de Datos Firebase Firestore Conectada</span>
                  <span className="font-mono text-[11px] text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                    pruebafinal-9704d
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {patients.length} pacientes cargados · Doctor: {firebaseUser.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSyncToFirebase}
                disabled={isFirebaseSyncing}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-950/60 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFirebaseSyncing ? 'animate-spin' : ''}`} />
                <span>{isFirebaseSyncing ? 'Guardando en Firebase...' : 'Subir Pacientes a Firebase Ahora'}</span>
              </button>
              <a
                href="https://console.firebase.google.com/project/pruebafinal-9704d/firestore"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 font-medium text-xs transition-colors"
              >
                <span>Ver en Consola</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        <DashboardStats patients={patients} />

        {/* Patient Workspace Section */}
        <section aria-label="Listado y Gestión de Pacientes">
          <PatientList
            patients={patients}
            onSelectPatient={handleOpenDetail}
            onEditPatient={handleOpenEditPatient}
            onUpdateDosage={handleOpenUpdateDosage}
            onPrintPrescription={handleOpenPrint}
            onOpenNewPatientModal={handleOpenNewPatient}
          />
        </section>
      </main>

      {/* Application Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <span>MedControl Doctor · Sistema de Gestión de Pacientes con Firebase Firestore</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {doctor.fullName} · {doctor.specialty}
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isPatientFormOpen && (
        <PatientFormModal
          isOpen={isPatientFormOpen}
          onClose={() => setIsPatientFormOpen(false)}
          onSave={handlePatientSaved}
          patientToEdit={patientToEdit}
        />
      )}

      {isDosageModalOpen && patientForDosage && (
        <DosageUpdateModal
          isOpen={isDosageModalOpen}
          onClose={() => setIsDosageModalOpen(false)}
          patient={patientForDosage}
          onDosageUpdated={handleDosageUpdated}
        />
      )}

      {isDetailModalOpen && selectedPatient && (
        <PatientDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          patient={selectedPatient}
          onEditPatient={(p) => {
            setIsDetailModalOpen(false);
            handleOpenEditPatient(p);
          }}
          onUpdateDosage={(p) => {
            handleOpenUpdateDosage(p);
          }}
          onPrintPrescription={(p) => {
            handleOpenPrint(p);
          }}
          onDeletePatient={handleDeletePatient}
        />
      )}

      {isPrintModalOpen && patientForPrint && (
        <PrintPrescriptionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          patient={patientForPrint}
          doctor={doctor}
        />
      )}

      {isSettingsModalOpen && (
        <DoctorSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          doctor={doctor}
          onDoctorUpdated={(updated) => {
            setDoctor(updated);
            showToast('Perfil del doctor actualizado.');
          }}
          onDataRestored={() => {
            refreshPatients();
            setDoctor(StorageService.getDoctorProfile());
            showToast('Base de datos restaurada.');
          }}
        />
      )}
    </div>
  );
}
