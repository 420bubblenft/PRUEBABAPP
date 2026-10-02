import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Sparkles, Pill, Phone, Hash, FileText } from 'lucide-react';
import { Patient, CurrentMedication } from '../types';
import { StorageService } from '../services/storage';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  patientToEdit?: Patient | null;
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

const COMMON_FREQUENCIES = [
  'Cada 8 horas (3 veces al día)',
  'Cada 12 horas (2 veces al día)',
  'Cada 24 horas (una vez al día, con alimentos)',
  'Cada 24 horas en ayunas',
  'Cada 6 horas',
  'Dosis única antes de dormir',
  'Según necesidad (SOS por dolor o fiebre)',
];

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patientToEdit,
}) => {
  const isEditing = Boolean(patientToEdit);

  const [registrationId, setRegistrationId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Patient['gender']>('Masculino');
  const [allergies, setAllergies] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [status, setStatus] = useState<Patient['status']>('activo');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Medication fields
  const [medName, setMedName] = useState('');
  const [medAmount, setMedAmount] = useState<number | ''>('');
  const [medUnit, setMedUnit] = useState<CurrentMedication['unit']>('mg');
  const [medRoute, setMedRoute] = useState<CurrentMedication['route']>('Oral');
  const [medFrequency, setMedFrequency] = useState('Cada 12 horas (2 veces al día)');
  const [medInstructions, setMedInstructions] = useState('');
  const [initialDoseNotes, setInitialDoseNotes] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    if (patientToEdit) {
      setRegistrationId(patientToEdit.registrationId);
      setFirstName(patientToEdit.firstName);
      setLastName(patientToEdit.lastName);
      setPhone(patientToEdit.phone);
      setEmail(patientToEdit.email || '');
      setAge(patientToEdit.age ?? '');
      setGender(patientToEdit.gender);
      setAllergies(patientToEdit.allergies || '');
      setDiagnosis(patientToEdit.diagnosis);
      setStatus(patientToEdit.status);
      setClinicalNotes(patientToEdit.clinicalNotes || '');

      setMedName(patientToEdit.currentMedication.name);
      setMedAmount(patientToEdit.currentMedication.amount);
      setMedUnit(patientToEdit.currentMedication.unit);
      setMedRoute(patientToEdit.currentMedication.route);
      setMedFrequency(patientToEdit.currentMedication.frequency);
      setMedInstructions(patientToEdit.currentMedication.instructions);
    } else {
      // Suggest automatic ID
      const suggestedId = StorageService.getNextSuggestedRegistrationId();
      setRegistrationId(suggestedId);
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setAge('');
      setGender('Masculino');
      setAllergies('');
      setDiagnosis('');
      setStatus('activo');
      setClinicalNotes('');

      setMedName('');
      setMedAmount('');
      setMedUnit('mg');
      setMedRoute('Oral');
      setMedFrequency('Cada 12 horas (2 veces al día)');
      setMedInstructions('');
      setInitialDoseNotes('');
    }
    setValidationError(null);
  }, [patientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleGenerateNextId = () => {
    const next = StorageService.getNextSuggestedRegistrationId();
    setRegistrationId(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    const trimmedId = registrationId.trim().toUpperCase();
    if (!trimmedId) {
      setValidationError('El ID de Registro es obligatorio para el expediente del paciente.');
      return;
    }

    if (StorageService.isRegistrationIdTaken(trimmedId, patientToEdit?.id)) {
      setValidationError(`El ID de Registro "${trimmedId}" ya está asignado a otro paciente. Asigne un ID único.`);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('Los Nombres y Apellidos del paciente son obligatorios.');
      return;
    }

    if (!phone.trim()) {
      setValidationError('El Número Telefónico del paciente es obligatorio.');
      return;
    }

    if (!medName.trim()) {
      setValidationError('Debe indicar el Nombre del medicamento suministrado.');
      return;
    }

    if (medAmount === '' || Number(medAmount) <= 0) {
      setValidationError('Debe ingresar una Cantidad de medicamento válida mayor a 0 (ej: 50, 100, 5).');
      return;
    }

    const currentMed: CurrentMedication = {
      name: medName.trim(),
      amount: Number(medAmount),
      unit: medUnit,
      frequency: medFrequency.trim(),
      route: medRoute,
      startDate: patientToEdit?.currentMedication.startDate || new Date().toISOString().split('T')[0],
      instructions: medInstructions.trim() || `Suministrar ${medAmount} ${medUnit} vía ${medRoute}.`,
    };

    if (isEditing && patientToEdit) {
      const updated = StorageService.updatePatient(patientToEdit.id, {
        registrationId: trimmedId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        age: age === '' ? undefined : Number(age),
        gender,
        allergies: allergies.trim() || undefined,
        diagnosis: diagnosis.trim() || 'Control de consulta',
        status,
        clinicalNotes: clinicalNotes.trim(),
        currentMedication: currentMed,
      });
      onSave(updated);
    } else {
      const created = StorageService.addPatient({
        registrationId: trimmedId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        age: age === '' ? undefined : Number(age),
        gender,
        allergies: allergies.trim() || undefined,
        diagnosis: diagnosis.trim() || 'Control de consulta',
        status,
        clinicalNotes: clinicalNotes.trim(),
        currentMedication: currentMed,
        initialDoseNotes: initialDoseNotes.trim(),
      });
      onSave(created);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl text-slate-100 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {isEditing ? 'Editar Registro de Paciente' : 'Registrar Nuevo Paciente'}
              </h2>
              <p className="text-xs text-slate-400">
                Llene los datos personales y el medicamento actualmente suministrado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {validationError && (
            <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Identification & Contact */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> 1. Identificación y Contacto del Paciente
              </h3>
              <span className="text-[11px] text-slate-400">* Campos requeridos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Registration ID */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="regId" className="block text-xs font-medium text-slate-300">
                    ID de Registro *
                  </label>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={handleGenerateNextId}
                      className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-0.5 cursor-pointer"
                      title="Sugerir siguiente correlativo"
                    >
                      <Sparkles className="w-3 h-3" /> Auto
                    </button>
                  )}
                </div>
                <input
                  id="regId"
                  type="text"
                  value={registrationId}
                  onChange={(e) => setRegistrationId(e.target.value.toUpperCase())}
                  placeholder="ej. PAC-2026-001"
                  required
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 uppercase"
                />
              </div>

              {/* First Name */}
              <div>
                <label htmlFor="fname" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nombres *
                </label>
                <input
                  id="fname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ej. Carlos Eduardo"
                  required
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lname" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Apellidos *
                </label>
                <input
                  id="lname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="ej. Hernández Morales"
                  required
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
              {/* Phone */}
              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Número Telefónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="ej. +52 55 1234 5678"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Edad
                </label>
                <input
                  id="age"
                  type="number"
                  min="0"
                  max="125"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="ej. 45"
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Género
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Patient['gender'])}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="allergies" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Alergias Conocidas
                </label>
                <input
                  id="allergies"
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="ej. Penicilina, AINEs o Ninguna"
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Estado del Paciente
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Patient['status'])}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="activo">Tratamiento Activo</option>
                  <option value="en_observacion">En Observación / Titulación</option>
                  <option value="completado">Tratamiento Completado</option>
                  <option value="suspendido">Tratamiento Suspendido</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="diag" className="block text-xs font-medium text-slate-300 mb-1.5">
                Diagnóstico / Motivo de Tratamiento
              </label>
              <input
                id="diag"
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="ej. Hipertensión arterial esencial estadio 2"
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Section 2: Medication & Dosage (Critical User Requirement) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5" /> 2. Medicamento y Cantidad Suministrada
              </h3>
              <span className="text-[11px] text-slate-400">Dosificación prescrita</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Medication Name */}
              <div className="sm:col-span-1">
                <label htmlFor="medName" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nombre del Medicamento *
                </label>
                <input
                  id="medName"
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="ej. Losartán Potásico"
                  required
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Medication Amount (Dosis suministrada) */}
              <div>
                <label htmlFor="medAmount" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cantidad Suministrada *
                </label>
                <input
                  id="medAmount"
                  type="number"
                  step="any"
                  min="0.01"
                  value={medAmount}
                  onChange={(e) => setMedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="ej. 50"
                  required
                  className="w-full px-3 py-2 bg-slate-800/90 border border-emerald-500/50 rounded-lg text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Unit */}
              <div>
                <label htmlFor="medUnit" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Unidad de Medida
                </label>
                <select
                  id="medUnit"
                  value={medUnit}
                  onChange={(e) => setMedUnit(e.target.value as CurrentMedication['unit'])}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Frequency */}
              <div>
                <label htmlFor="medFreq" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Frecuencia de Suministro
                </label>
                <input
                  id="medFreq"
                  type="text"
                  list="frequencies-list"
                  value={medFrequency}
                  onChange={(e) => setMedFrequency(e.target.value)}
                  placeholder="ej. Cada 12 horas"
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <datalist id="frequencies-list">
                  {COMMON_FREQUENCIES.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>

              {/* Route */}
              <div>
                <label htmlFor="medRoute" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Vía de Administración
                </label>
                <select
                  id="medRoute"
                  value={medRoute}
                  onChange={(e) => setMedRoute(e.target.value as CurrentMedication['route'])}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {COMMON_ROUTES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dosage Instructions */}
            <div className="mt-4">
              <label htmlFor="medInstructions" className="block text-xs font-medium text-slate-300 mb-1.5">
                Indicaciones de Administración al Paciente
              </label>
              <textarea
                id="medInstructions"
                rows={2}
                value={medInstructions}
                onChange={(e) => setMedInstructions(e.target.value)}
                placeholder="ej. Ingerir después del desayuno y de la cena. Mantener hidratación continua."
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Doctor's clinical notes */}
            <div className="mt-4">
              <label htmlFor="clinNotes" className="block text-xs font-medium text-slate-300 mb-1.5">
                Notas Clínicas Confidenciales del Doctor
              </label>
              <textarea
                id="clinNotes"
                rows={2}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Observaciones de evolución, respuesta al tratamiento, signos vitales..."
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/95">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-teal-950/60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
