import React from 'react';
import { Users, Pill, Activity, Clock, ShieldAlert } from 'lucide-react';
import { Patient } from '../types';

interface DashboardStatsProps {
  patients: Patient[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ patients }) => {
  const totalPatients = patients.length;
  const activeTreatments = patients.filter((p) => p.status === 'activo').length;
  const inObservation = patients.filter((p) => p.status === 'en_observacion').length;
  const totalDosageLogs = patients.reduce((acc, p) => acc + (p.dosageHistory?.length || 0), 0);
  const patientsWithAllergies = patients.filter((p) => p.allergies && p.allergies.toLowerCase() !== 'ninguna' && p.allergies.trim().length > 0).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Patients */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Pacientes</span>
          <Users className="w-4 h-4 text-teal-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{totalPatients}</span>
          <span className="text-xs text-slate-400">en padrón clínico</span>
        </div>
      </div>

      {/* Active Medication Treatments */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Tratamiento Activo</span>
          <Pill className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">{activeTreatments}</span>
          <span className="text-xs text-slate-400">con dosis prescrita</span>
        </div>
      </div>

      {/* Under Observation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">En Observación</span>
          <Activity className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400 tracking-tight">{inObservation}</span>
          <span className="text-xs text-slate-400">titulación de dosis</span>
        </div>
      </div>

      {/* Total Adjustments & Doses Logged */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Ajustes Históricos</span>
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{totalDosageLogs}</span>
          <span className="text-xs text-slate-400">registros de dosis</span>
        </div>
      </div>
    </div>
  );
};
