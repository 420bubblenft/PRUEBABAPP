import React from 'react';
import { X, Printer, Stethoscope, Download } from 'lucide-react';
import { Patient, DoctorProfile } from '../types';

interface PrintPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  doctor: DoctorProfile;
}

export const PrintPrescriptionModal: React.FC<PrintPrescriptionModalProps> = ({
  isOpen,
  onClose,
  patient,
  doctor,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl text-slate-100 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls (Hidden in print) */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-white">
              Vista de Impresión / Receta Clínica
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-teal-950"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area (White paper styling with high clinical contrast) */}
        <div className="overflow-y-auto p-4 sm:p-8 flex-1 bg-slate-950 flex justify-center">
          <div
            id="printable-prescription"
            className="w-full max-w-2xl bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-lg border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* Clinical Header */}
            <div className="border-b-2 border-slate-800 pb-5 mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-teal-800 font-bold text-lg tracking-tight">
                  <Stethoscope className="w-5 h-5" />
                  <span>{doctor.fullName}</span>
                </div>
                <div className="text-xs text-slate-700 font-medium mt-0.5">
                  {doctor.specialty} · Cédula Prof: {doctor.medicalLicense}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {doctor.clinicName} · Tel: {doctor.phone}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div className="font-semibold text-slate-800">FICHA DE PRESCRIPCIÓN</div>
                <div className="mt-1">Fecha: {currentDate}</div>
                <div className="font-mono text-teal-700 font-bold mt-0.5">{patient.registrationId}</div>
              </div>
            </div>

            {/* Patient Info Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-6 text-xs text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Paciente</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {patient.firstName} {patient.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Teléfono</span>
                <span className="font-mono text-slate-800">{patient.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Edad / Sexo</span>
                <span>{patient.age ? `${patient.age} años` : '—'} / {patient.gender}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Alergias</span>
                <span className="text-rose-700 font-medium">{patient.allergies || 'Ninguna conocida'}</span>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="mb-6">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-600 block mb-1">
                Diagnóstico Clínico
              </span>
              <p className="text-sm font-medium text-slate-800 bg-slate-50/50 p-2.5 rounded border border-slate-100">
                {patient.diagnosis || 'Control de consulta y seguimiento farmacológico'}
              </p>
            </div>

            {/* Prescribed Medication (Recipe block) */}
            <div className="mb-8 border-2 border-teal-700/30 rounded-xl p-5 bg-teal-50/30">
              <div className="flex items-center justify-between mb-3 border-b border-teal-200 pb-2">
                <span className="text-xs uppercase font-bold tracking-wider text-teal-900">
                  Rp. Medicamento y Suministro Prescrito
                </span>
                <span className="font-mono font-bold text-teal-900 text-sm">
                  {patient.currentMedication.amount} {patient.currentMedication.unit}
                </span>
              </div>

              <div className="text-base font-bold text-slate-900 mb-1">
                {patient.currentMedication.name}
              </div>

              <div className="text-xs text-slate-700 space-y-1 mt-2">
                <div>
                  <strong>Posología y Frecuencia:</strong> {patient.currentMedication.frequency}
                </div>
                <div>
                  <strong>Vía de administración:</strong> {patient.currentMedication.route}
                </div>
                {patient.currentMedication.instructions && (
                  <div className="pt-2 text-slate-800">
                    <strong>Instrucciones específicas:</strong> {patient.currentMedication.instructions}
                  </div>
                )}
              </div>
            </div>

            {/* Sign line */}
            <div className="pt-12 mt-8 border-t border-slate-300 flex justify-between items-end text-xs text-slate-600">
              <div>
                <div className="text-[11px] text-slate-500">
                  Documento emitido exclusivamente para control médico y suministro del paciente.
                </div>
              </div>
              <div className="text-center min-w-[200px]">
                <div className="border-t border-slate-800 pt-1 font-semibold text-slate-900">
                  {doctor.fullName}
                </div>
                <div className="text-[11px] text-slate-500">
                  Cédula Profesional: {doctor.medicalLicense}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Firma y Sello del Médico</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
