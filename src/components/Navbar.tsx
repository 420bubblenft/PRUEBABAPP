import React from 'react';
import { Stethoscope, UserPlus, LogOut, Settings, Download, FileSpreadsheet, ShieldCheck, Cloud, CloudCheck } from 'lucide-react';
import { DoctorProfile } from '../types';

interface NavbarProps {
  doctor: DoctorProfile;
  isFirebaseActive: boolean;
  onOpenNewPatientModal: () => void;
  onOpenSettingsModal: () => void;
  onExportCsv: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  doctor,
  isFirebaseActive,
  onOpenNewPatientModal,
  onOpenSettingsModal,
  onExportCsv,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 shadow-sm text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand and Doctor Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-900/30 border border-teal-400/20">
              <Stethoscope className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">MedControl</span>
                <span className="text-[11px] font-semibold text-teal-300 bg-teal-950/80 border border-teal-800/80 px-1.5 py-0.5 rounded">
                  PORTAL MÉDICO
                </span>
                {isFirebaseActive && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    <span>FIREBASE ACTIVO</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="font-medium text-slate-200">{doctor.fullName}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="hidden sm:inline text-slate-400 truncate max-w-[180px]">{doctor.specialty}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenNewPatientModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-medium transition-colors shadow-sm shadow-teal-950/50 cursor-pointer"
              title="Registrar un nuevo paciente en el sistema"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar Paciente</span>
            </button>

            <button
              onClick={onExportCsv}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              title="Exportar base de pacientes a Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={onOpenSettingsModal}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Ajustes del Doctor, Firebase y Respaldos"
              aria-label="Ajustes del Doctor"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-900/60 transition-colors cursor-pointer"
              title="Cerrar sesión de administrador"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
