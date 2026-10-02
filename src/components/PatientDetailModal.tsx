import React from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Pill,
  Clock,
  Printer,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  User,
  History,
  FileText,
  Activity,
  PlusCircle,
} from 'lucide-react';
import { Patient } from '../types';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onEditPatient: (patient: Patient) => void;
  onUpdateDosage: (patient: Patient) => void;
  onPrintPrescription: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  patient,
  onEditPatient,
  onUpdateDosage,
  onPrintPrescription,
  onDeletePatient,
}) => {
  if (!isOpen) return null;

  // Clean phone number for tel: and whatsapp links
  const cleanPhone = patient.phone.replace(/[^0-9+]/g, '');
  const waNumber = patient.phone.replace(/[^0-9]/g, '');

  const statusLabels: Record<Patient['status'], { label: string; color: string }> = {
    activo: { label: 'Tratamiento Activo', color: 'text-emerald-400' },
    en_observacion: { label: 'En Observación', color: 'text-amber-400' },
    completado: { label: 'Tratamiento Completado', color: 'text-cyan-400' },
    suspendido: { label: 'Tratamiento Suspendido', color: 'text-rose-400' },
  };

  const statusInfo = statusLabels[patient.status] || {
    label: patient.status,
    color: 'text-slate-300',
  };

  const handleDeleteConfirm = () => {
    if (
      window.confirm(
        `¿Está seguro de eliminar el registro clínico del paciente ${patient.firstName} ${patient.lastName} (${patient.registrationId})? Esta acción no se puede deshacer.`
      )
    ) {
      onDeletePatient(patient.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl text-slate-100 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold font-mono">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {patient.firstName} {patient.lastName}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                  {patient.registrationId}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{patient.gender}</span>
                {patient.age && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>{patient.age} años</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onPrintPrescription(patient)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Generar Ficha / Receta para imprimir"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Imprimir Ficha</span>
            </button>
            <button
              onClick={() => onEditPatient(patient)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Editar datos del paciente"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
              title="Eliminar paciente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Top Grid: Quick Contact and Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Phone & Contact */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                Contacto Telefónico
              </span>
              <div className="text-base font-semibold text-white font-mono mb-2">
                {patient.phone}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border border-teal-800/80 rounded-md transition-colors"
                >
                  <Phone className="w-3 h-3" /> Llamar
                </a>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 rounded-md transition-colors"
                >
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </a>
              </div>
              {patient.email && (
                <div className="text-xs text-slate-400 mt-2 truncate">
                  {patient.email}
                </div>
              )}
            </div>

            {/* Diagnosis */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 md:col-span-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Diagnóstico / Motivo de Consulta
              </span>
              <div className="text-sm font-medium text-slate-100">
                {patient.diagnosis || 'Sin diagnóstico especificado'}
              </div>
              {patient.allergies && (
                <div className="mt-2 text-xs flex items-center gap-1.5 text-rose-300 bg-rose-950/40 border border-rose-900/50 px-2.5 py-1 rounded-md">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>
                    <strong>Alergias:</strong> {patient.allergies}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Current Medication Card (Prominent Dosage Section) */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-emerald-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold block">
                    Medicamento Suministrado Actualmente
                  </span>
                  <div className="text-lg font-bold text-white">
                    {patient.currentMedication.name}
                  </div>
                </div>
              </div>

              {/* Exact amount & unit prominently displayed */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                    {patient.currentMedication.amount}{' '}
                    <span className="text-sm font-semibold text-slate-300">
                      {patient.currentMedication.unit}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">cantidad actual</span>
                </div>

                <button
                  onClick={() => onUpdateDosage(patient)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-950/60 cursor-pointer"
                  title="Registrar nuevo ajuste o dosis suministrada"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Modificar Dosis</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Frecuencia de Toma:</span>
                <span className="text-slate-200 font-medium">
                  {patient.currentMedication.frequency}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Vía de Administración:</span>
                <span className="text-slate-200 font-medium">
                  {patient.currentMedication.route}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Inicio de la Prescripción:</span>
                <span className="text-slate-200 font-medium font-mono">
                  {patient.currentMedication.startDate}
                </span>
              </div>
            </div>

            {patient.currentMedication.instructions && (
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
                <strong className="text-slate-400">Indicaciones:</strong>{' '}
                {patient.currentMedication.instructions}
              </div>
            )}
          </div>

          {/* Dosage History Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Historial Clínico de Suministros y Modificaciones
              </h3>
              <span className="text-xs text-slate-400">
                {patient.dosageHistory?.length || 0} registros
              </span>
            </div>

            {(!patient.dosageHistory || patient.dosageHistory.length === 0) ? (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
                Sin registros previos de cambios en la dosificación.
              </div>
            ) : (
              <div className="space-y-2.5">
                {patient.dosageHistory.map((log, index) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 text-sm">
                          {log.medicationName}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                          {log.amount} {log.unit}
                        </span>
                        {index === 0 && (
                          <span className="text-[10px] text-teal-400 font-medium uppercase tracking-wider">
                            (Vigente)
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 flex items-center gap-2">
                        <span>{log.frequency}</span>
                        <span aria-hidden="true">·</span>
                        <span>Vía {log.route}</span>
                      </div>
                      {log.reasonForChange && (
                        <div className="text-slate-300">
                          <span className="text-slate-400">Motivo:</span> {log.reasonForChange}
                        </div>
                      )}
                      {log.notes && (
                        <div className="text-slate-400 italic">
                          "{log.notes}"
                        </div>
                      )}
                    </div>
                    <div className="text-slate-400 sm:text-right shrink-0 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confidential Doctor's Evolution Notes */}
          {patient.clinicalNotes && (
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 text-xs">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Notas de Evolución Médica del Doctor
              </span>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {patient.clinicalNotes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/90">
          <span>
            Expediente creado:{' '}
            <strong className="text-slate-300 font-mono">
              {new Date(patient.createdAt).toLocaleDateString('es-ES')}
            </strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
