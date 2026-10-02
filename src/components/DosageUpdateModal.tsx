import React, { useState } from 'react';
import { X, Pill, ArrowRight, Save, History, AlertCircle } from 'lucide-react';
import { Patient, CurrentMedication } from '../types';
import { StorageService } from '../services/storage';

interface DosageUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onDosageUpdated: (updatedPatient: Patient) => void;
}

const COMMON_UNITS: CurrentMedication['unit'][] = [
  'mg',
  'ml',
  'mcg',
  'comprimidos',
  'gotas',
  'UI',
  'g',
  'ampollas',
];

const COMMON_ROUTES: CurrentMedication['route'][] = [
  'Oral',
  'Intravenosa (IV)',
  'Intramuscular (IM)',
  'Subcutánea',
  'Tópica',
  'Inhalatoria',
  'Sublingual',
];

const COMMON_REASONS = [
  'Titulación de dosis por respuesta clínica',
  'Ajuste según exámenes de laboratorio de control',
  'Reducción progresiva / Desescalamiento terapéutico',
  'Dosis de mantenimiento a largo plazo',
  'Incremento por control subóptimo de síntomas',
  'Ajuste por peso / función renal o hepática',
];

export const DosageUpdateModal: React.FC<DosageUpdateModalProps> = ({
  isOpen,
  onClose,
  patient,
  onDosageUpdated,
}) => {
  const current = patient.currentMedication;

  const [newAmount, setNewAmount] = useState<number | ''>(current.amount);
  const [newUnit, setNewUnit] = useState<CurrentMedication['unit']>(current.unit);
  const [newFrequency, setNewFrequency] = useState(current.frequency);
  const [newRoute, setNewRoute] = useState<CurrentMedication['route']>(current.route);
  const [reason, setReason] = useState('Titulación de dosis por respuesta clínica');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newAmount === '' || Number(newAmount) <= 0) {
      setError('La nueva cantidad de medicamento debe ser un número positivo.');
      return;
    }

    if (!reason.trim()) {
      setError('Debe especificar el motivo clínico de la modificación de la dosis.');
      return;
    }

    try {
      const updated = StorageService.updateMedicationDosage(patient.id, {
        amount: Number(newAmount),
        unit: newUnit,
        frequency: newFrequency.trim(),
        route: newRoute,
        reasonForChange: reason.trim(),
        notes: notes.trim(),
      });
      onDosageUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la dosis.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Modificar Dosis Suministrada
              </h2>
              <p className="text-xs text-slate-400">
                {patient.firstName} {patient.lastName} · <span className="font-mono text-teal-300">{patient.registrationId}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Dose Indicator */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">
                Dosis Actual en Curso
              </span>
              <div className="text-sm font-semibold text-white">
                {current.name}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {current.frequency} · Vía {current.route}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {current.amount} <span className="text-sm font-normal text-slate-300">{current.unit}</span>
              </div>
              <span className="text-[11px] text-slate-400">suministro vigente</span>
            </div>
          </div>

          {/* New Dose Inputs */}
          <div>
            <label className="block text-xs font-semibold text-teal-300 uppercase tracking-wider mb-2">
              Nueva Cantidad a Suministrar
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="amountInput">
                  Cantidad *
                </label>
                <input
                  id="amountInput"
                  type="number"
                  step="any"
                  min="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="ej. 100"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-emerald-500/60 rounded-lg text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1" htmlFor="unitSelect">
                  Unidad
                </label>
                <select
                  id="unitSelect"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value as CurrentMedication['unit'])}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Route & Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1" htmlFor="freqInput">
                Frecuencia
              </label>
              <input
                id="freqInput"
                type="text"
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value)}
                placeholder="ej. Cada 8 horas"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1" htmlFor="routeSelect">
                Vía de Administración
              </label>
              <select
                id="routeSelect"
                value={newRoute}
                onChange={(e) => setNewRoute(e.target.value as CurrentMedication['route'])}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {COMMON_ROUTES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason for change */}
          <div>
            <label className="block text-xs text-slate-300 mb-1" htmlFor="reasonInput">
              Motivo Clínico del Ajuste de Dosis *
            </label>
            <input
              id="reasonInput"
              type="text"
              list="reasons-list"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ej. Titulación por control de síntomas"
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <datalist id="reasons-list">
              {COMMON_REASONS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-300 mb-1" htmlFor="notesInput">
              Observaciones Clínicas / Tolerancia del Paciente
            </label>
            <textarea
              id="notesInput"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles de evaluación, respuesta farmacológica, instrucciones dadas..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Dose comparison preview */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-400">Comparativa:</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400">{current.amount} {current.unit}</span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-emerald-400 font-bold">{newAmount || '—'} {newUnit}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-950/60 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Registrar Nueva Dosis</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
