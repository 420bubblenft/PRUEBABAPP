import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Pill,
  Phone,
  Eye,
  Edit,
  PlusCircle,
  Printer,
  ChevronRight,
  LayoutGrid,
  List,
  UserPlus,
  AlertTriangle,
  History,
} from 'lucide-react';
import { Patient } from '../types';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onUpdateDosage: (patient: Patient) => void;
  onPrintPrescription: (patient: Patient) => void;
  onOpenNewPatientModal: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  onSelectPatient,
  onEditPatient,
  onUpdateDosage,
  onPrintPrescription,
  onOpenNewPatientModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'en_observacion' | 'completado'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter patients based on search and status
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Status filter
      if (statusFilter !== 'all' && patient.status !== statusFilter) {
        return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase().trim();
      const matchName = `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(term);
      const matchRegId = patient.registrationId.toLowerCase().includes(term);
      const matchPhone = patient.phone.toLowerCase().includes(term);
      const matchMed = patient.currentMedication.name.toLowerCase().includes(term);
      const matchDiag = (patient.diagnosis || '').toLowerCase().includes(term);

      return matchName || matchRegId || matchPhone || matchMed || matchDiag;
    });
  }, [patients, searchTerm, statusFilter]);

  const statusLabels: Record<Patient['status'], { label: string; textClass: string; dotClass: string }> = {
    activo: { label: 'Activo', textClass: 'text-emerald-400', dotClass: 'bg-emerald-400' },
    en_observacion: { label: 'Observación', textClass: 'text-amber-400', dotClass: 'bg-amber-400' },
    completado: { label: 'Completado', textClass: 'text-cyan-400', dotClass: 'bg-cyan-400' },
    suspendido: { label: 'Suspendido', textClass: 'text-rose-400', dotClass: 'bg-rose-400' },
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, ID de registro, teléfono o medicamento..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-200"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filter Tabs & View Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/90 border border-slate-700/80 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({patients.length})
            </button>
            <button
              onClick={() => setStatusFilter('activo')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'activo'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setStatusFilter('en_observacion')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'en_observacion'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Observación
            </button>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-0.5 p-1 bg-slate-800/90 border border-slate-700/80 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista de tabla clínica"
              aria-label="Vista de tabla"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista de tarjetas de pacientes"
              aria-label="Vista de tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Patients Display */}
      {filteredPatients.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            {searchTerm ? 'No se encontraron pacientes' : 'Aún no hay pacientes registrados'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {searchTerm
              ? `No hay registros coincidentes para "${searchTerm}". Intente con otro criterio de búsqueda.`
              : 'Comience agregando el primer paciente con su identificación y el medicamento que se le suministra.'}
          </p>
          <button
            onClick={onOpenNewPatientModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm shadow-teal-950"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Paciente</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">ID Registro</th>
                  <th scope="col" className="py-3 px-4">Paciente</th>
                  <th scope="col" className="py-3 px-4">Contacto Telefónico</th>
                  <th scope="col" className="py-3 px-4">Medicamento Suministrado</th>
                  <th scope="col" className="py-3 px-4">Cantidad / Dosis</th>
                  <th scope="col" className="py-3 px-4">Estado</th>
                  <th scope="col" className="py-3 px-4 text-right">Acciones Clínicas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPatients.map((patient) => {
                  const status = statusLabels[patient.status] || {
                    label: patient.status,
                    textClass: 'text-slate-300',
                    dotClass: 'bg-slate-400',
                  };

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectPatient(patient)}
                    >
                      {/* Registration ID */}
                      <td className="py-3 px-4 font-mono font-bold text-teal-300 whitespace-nowrap">
                        {patient.registrationId}
                      </td>

                      {/* Name & Age */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {patient.diagnosis ? patient.diagnosis : 'Sin diagnóstico anotado'}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{patient.phone}</span>
                        </div>
                      </td>

                      {/* Medication Name & Frequency */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-white flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{patient.currentMedication.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {patient.currentMedication.frequency}
                        </div>
                      </td>

                      {/* Amount Supplied (Cantidad de medicamento) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-sm text-emerald-400">
                          {patient.currentMedication.amount}{' '}
                          <span className="text-xs font-normal text-slate-300">
                            {patient.currentMedication.unit}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Vía {patient.currentMedication.route}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                          <span className={`font-medium ${status.textClass}`}>{status.label}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onUpdateDosage(patient)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Modificar Dosis suministrada"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrintPrescription(patient)}
                            className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Imprimir Ficha / Receta"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditPatient(patient)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Editar Datos"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSelectPatient(patient)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Ver expediente clínico completo"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const status = statusLabels[patient.status] || {
              label: patient.status,
              textClass: 'text-slate-300',
              dotClass: 'bg-slate-400',
            };

            return (
              <div
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all hover:shadow-lg cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: ID & Status */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="font-mono text-xs font-bold text-teal-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {patient.registrationId}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                      <span className={`font-medium ${status.textClass}`}>{status.label}</span>
                    </div>
                  </div>

                  {/* Patient Name & Details */}
                  <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                    {patient.firstName} {patient.lastName}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3 h-3" />
                    <span>{patient.phone}</span>
                  </div>

                  {patient.diagnosis && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-1">
                      {patient.diagnosis}
                    </p>
                  )}

                  {/* Medication & Dosage Box */}
                  <div className="mt-3 p-3 rounded-lg bg-slate-800/80 border border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Medicamento Suministrado
                      </span>
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {patient.currentMedication.amount} {patient.currentMedication.unit}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white mt-1">
                      {patient.currentMedication.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {patient.currentMedication.frequency} · Vía {patient.currentMedication.route}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div
                  className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Expediente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateDosage(patient)}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
                      title="Modificar Dosis"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPrintPrescription(patient)}
                      className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Imprimir Ficha"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditPatient(patient)}
                      className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
