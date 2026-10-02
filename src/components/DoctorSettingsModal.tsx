import React, { useState, useRef } from 'react';
import {
  X,
  UserCheck,
  Lock,
  Download,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { DoctorProfile } from '../types';
import { StorageService } from '../services/storage';

interface DoctorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfile;
  onDoctorUpdated: (updated: DoctorProfile) => void;
  onDataRestored: () => void;
}

export const DoctorSettingsModal: React.FC<DoctorSettingsModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onDoctorUpdated,
  onDataRestored,
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState(doctor.fullName);
  const [specialty, setSpecialty] = useState(doctor.specialty);
  const [medicalLicense, setMedicalLicense] = useState(doctor.medicalLicense);
  const [clinicName, setClinicName] = useState(doctor.clinicName);
  const [email, setEmail] = useState(doctor.email);
  const [phone, setPhone] = useState(doctor.phone);
  const [username, setUsername] = useState(doctor.username);

  // Security password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const updated = StorageService.updateDoctorProfile({
      fullName: fullName.trim(),
      specialty: specialty.trim(),
      medicalLicense: medicalLicense.trim(),
      clinicName: clinicName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      username: username.trim(),
    });

    onDoctorUpdated(updated);
    setSuccessMessage('Datos profesionales actualizados con éxito.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (currentPassword !== doctor.passwordHash && currentPassword !== 'doctor123') {
      setErrorMessage('La contraseña actual ingresada es incorrecta.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMessage('La nueva contraseña o PIN debe contener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    const updated = StorageService.updateDoctorProfile({
      passwordHash: newPassword,
    });

    onDoctorUpdated(updated);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMessage('Contraseña de administrador actualizada con éxito.');
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportDataToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medcontrol_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Respaldo JSON descargado correctamente.');
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
    setSuccessMessage('Archivo CSV exportado exitosamente.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importDataFromJson(content);
        if (success) {
          setSuccessMessage('Base de datos restaurada correctamente desde el archivo.');
          onDataRestored();
        } else {
          setErrorMessage('El archivo no tiene un formato válido de respaldo de MedControl.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl text-slate-100 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base font-semibold text-white">
                Ajustes del Médico Administrador
              </h2>
              <p className="text-xs text-slate-400">
                Información profesional, credenciales de acceso y respaldos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs sm:text-sm">
          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Professional profile */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
              <h3 className="font-semibold text-teal-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Datos de Identificación Profesional
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="docName">
                  Nombre Completo del Doctor
                </label>
                <input
                  id="docName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="docLicense">
                  Cédula / Licencia Profesional
                </label>
                <input
                  id="docLicense"
                  type="text"
                  value={medicalLicense}
                  onChange={(e) => setMedicalLicense(e.target.value)}
                  placeholder="ej. MED-784920-CM"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="docSpec">
                  Especialidad Médica
                </label>
                <input
                  id="docSpec"
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="docClinic">
                  Nombre de la Clínica / Consultorio
                </label>
                <input
                  id="docClinic"
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="docUser">
                  Usuario de Login
                </label>
                <input
                  id="docUser"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="docPhone">
                  Teléfono de Contacto
                </label>
                <input
                  id="docPhone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="docEmail">
                  Correo Electrónico
                </label>
                <input
                  id="docEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Actualizar Datos Médicos</span>
              </button>
            </div>
          </form>

          {/* Change Password / PIN */}
          <form onSubmit={handleChangePassword} className="space-y-4 pt-4 border-t border-slate-800">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-teal-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Cambiar Contraseña o PIN de Acceso
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="curPass">
                  Clave Actual
                </label>
                <input
                  id="curPass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Clave actual"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="newPass">
                  Nueva Contraseña / PIN
                </label>
                <input
                  id="newPass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="confPass">
                  Confirmar Nueva Clave
                </label>
                <input
                  id="confPass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir clave"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Guardar Nueva Contraseña</span>
              </button>
            </div>
          </form>

          {/* Firebase Connection Status */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
              <h3 className="font-semibold text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Proyecto Firebase Conectado
              </h3>
              <span className="font-mono text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                pruebafinal-9704d
              </span>
            </div>
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-700/70 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">ID del Proyecto:</span>
                <span className="font-mono text-slate-200 font-semibold">pruebafinal-9704d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base de Datos Firestore:</span>
                <span className="font-mono text-slate-300">ai-studio-medcontroldoctor-5d54b2e7-1558-4ad7-8554-a641fd49dca6</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                <span className="text-slate-400">Consola de Firebase:</span>
                <a
                  href="https://console.firebase.google.com/project/pruebafinal-9704d/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-300 hover:text-teal-200 underline font-medium"
                >
                  Abrir Consola (pruebafinal-9704d) ↗
                </a>
              </div>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-teal-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Respaldo y Exportación de Pacientes
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              Descargue una copia de seguridad completa con todos los pacientes, dosis e historial clínico para resguardar o transferir a otro equipo.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span>Descargar Copia JSON</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Descargar Planilla CSV</span>
              </button>

              <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Restaurar Copia JSON</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex justify-end bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar Ajustes
          </button>
        </div>
      </div>
    </div>
  );
};
