/**
 * MedControl Doctor - Lógica y Conexión Firebase Standalone (script.js)
 * Proyecto Firebase: pruebafinal-9704d
 */

// 1. Configuración de Firebase para tu proyecto
const firebaseConfig = {
  projectId: "pruebafinal-9704d",
  appId: "1:124732646460:web:eebfb0c110e5e1d4c14f39",
  apiKey: "AIzaSyBH9nI6Ozho7ATEr7OyJc2ztSj-MVvkMJk",
  authDomain: "pruebafinal-9704d.firebaseapp.com",
  storageBucket: "pruebafinal-9704d.firebasestorage.app",
  messagingSenderId: "124732646460"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Estado Global
let currentUser = null;
let patientsList = [];
let isRegisterMode = false;
let currentFilter = 'all';

// Pacientes iniciales para demostración clínica
const SAMPLE_PATIENTS = [
  {
    id: "pat-001",
    registrationId: "PAC-2026-001",
    firstName: "Carlos",
    lastName: "Hernández Morales",
    phone: "+52 55 4123 9081",
    age: 58,
    gender: "Masculino",
    allergies: "Penicilina",
    diagnosis: "Hipertensión Arterial Grado 2",
    medicationName: "Losartán Potásico",
    medicationAmount: 50,
    medicationUnit: "mg",
    medicationFrequency: "Cada 12 horas",
    medicationRoute: "Oral",
    medicationInstructions: "Tomar después del desayuno y de la cena.",
    status: "activo"
  },
  {
    id: "pat-002",
    registrationId: "PAC-2026-002",
    firstName: "María Elena",
    lastName: "Gutiérrez Salazar",
    phone: "+52 55 9823 4410",
    age: 46,
    gender: "Femenino",
    allergies: "Ninguna",
    diagnosis: "Diabetes Mellitus Tipo 2",
    medicationName: "Metformina Clorhidrato",
    medicationAmount: 850,
    medicationUnit: "mg",
    medicationFrequency: "Cada 12 horas con alimentos",
    medicationRoute: "Oral",
    medicationInstructions: "Ingerir con los alimentos principales.",
    status: "activo"
  },
  {
    id: "pat-003",
    registrationId: "PAC-2026-003",
    firstName: "Roberto",
    lastName: "Vargas Peñaloza",
    phone: "+52 55 6190 2844",
    age: 34,
    gender: "Masculino",
    allergies: "AINEs",
    diagnosis: "Asma Bronquial Persistente",
    medicationName: "Budesonida / Formoterol",
    medicationAmount: 160,
    medicationUnit: "mcg",
    medicationFrequency: "Cada 12 horas (2 disparos)",
    medicationRoute: "Inhalatoria",
    medicationInstructions: "Enjuagar la boca tras su uso.",
    status: "en_observacion"
  },
  {
    id: "pat-004",
    registrationId: "PAC-2026-004",
    firstName: "Ana Sofía",
    lastName: "Mendoza Rivas",
    phone: "+52 55 3301 7712",
    age: 29,
    gender: "Femenino",
    allergies: "Lactosa",
    diagnosis: "Hipotiroidismo Primario",
    medicationName: "Levotiroxina Sódica",
    medicationAmount: 75,
    medicationUnit: "mcg",
    medicationFrequency: "Cada 24 horas en ayunas",
    medicationRoute: "Oral",
    medicationInstructions: "Tomar al despertar con agua 45 min antes de comer.",
    status: "activo"
  }
];

// Notificaciones Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3500);
}

// 2. Escuchar Estado de Autenticación de Firebase
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById('authView').classList.add('hidden');
    document.getElementById('mainView').classList.remove('hidden');
    document.getElementById('navCloudBadge').classList.remove('hidden');
    document.getElementById('navDoctorInfo').textContent = (user.displayName || user.email) + " · Administrador Único";
    document.getElementById('cloudStatusText').textContent = "Firebase Firestore Conectado (" + user.email + ")";

    // Cargar pacientes desde Firestore en tiempo real
    subscribeToFirestorePatients(user.uid);
  } else {
    currentUser = null;
    document.getElementById('authView').classList.remove('hidden');
    document.getElementById('mainView').classList.add('hidden');
  }
});

// 3. Autenticación con Google
document.getElementById('btnGoogleLogin').addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    showToast("¡Sesión iniciada con Google en Firebase!");
  } catch (err) {
    console.error(err);
    showAuthError("Error de Google: " + (err.message || err));
  }
});

// 4. Autenticación con Correo y Contraseña (signInWithEmailAndPassword)
document.getElementById('emailLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAuthError();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;

  try {
    if (isRegisterMode) {
      await auth.createUserWithEmailAndPassword(email, pass);
      showToast("¡Cuenta de Administrador creada en Firebase!");
    } else {
      // Iniciar sesión real con signInWithEmailAndPassword
      await auth.signInWithEmailAndPassword(email, pass);
      showToast("¡Bienvenido, Doctor!");
    }
  } catch (err) {
    console.error("Firebase Auth Error:", err);
    let msg = err.message || "Error al autenticar en Firebase.";
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      msg = "Credenciales incorrectas en Firebase. Si es primera vez, pulsa 'Crear cuenta'.";
    } else if (err.code === 'auth/operation-not-allowed') {
      msg = "Email/Password no está habilitado en tu consola de Firebase. Habilítalo en Authentication > Sign-in method.";
    }
    showAuthError(msg);
  }
});

// Alternar entre Login y Registro
document.getElementById('btnToggleRegisterMode').addEventListener('click', () => {
  isRegisterMode = !isRegisterMode;
  const btnSubmit = document.getElementById('btnSubmitAuth');
  const btnToggle = document.getElementById('btnToggleRegisterMode');
  if (isRegisterMode) {
    btnSubmit.textContent = "Crear Cuenta (createUserWithEmailAndPassword)";
    btnToggle.textContent = "¿Ya tienes cuenta? Volver a Iniciar Sesión";
  } else {
    btnSubmit.textContent = "Iniciar Sesión (signInWithEmailAndPassword)";
    btnToggle.textContent = "¿Primera vez? Crear cuenta de Administrador en Firebase";
  }
});

// Alternar ver/ocultar contraseña
document.getElementById('btnTogglePassword').addEventListener('click', () => {
  const input = document.getElementById('loginPassword');
  input.type = input.type === 'password' ? 'text' : 'password';
});

// Cerrar sesión
document.getElementById('btnLogout').addEventListener('click', () => {
  auth.signOut();
  showToast("Sesión cerrada");
});

function showAuthError(msg) {
  const box = document.getElementById('authAlert');
  box.textContent = msg;
  box.classList.remove('hidden');
}

function hideAuthError() {
  document.getElementById('authAlert').classList.add('hidden');
}

// 5. Sincronización en Tiempo Real con Firestore
function subscribeToFirestorePatients(doctorId) {
  db.collection('patients')
    .where('doctorId', '==', doctorId)
    .onSnapshot((snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      if (list.length > 0) {
        patientsList = list;
        renderPatientsTable();
        updateStats();
      } else {
        // Si la base en la nube está vacía, sube automáticamente los 4 pacientes iniciales
        uploadInitialSamplePatients(doctorId);
      }
    }, (err) => {
      console.error("Firestore snapshot error:", err);
      // Fallback a memoria local
      if (patientsList.length === 0) {
        patientsList = [...SAMPLE_PATIENTS];
        renderPatientsTable();
        updateStats();
      }
    });
}

// Subir pacientes iniciales a Firestore
async function uploadInitialSamplePatients(doctorId) {
  try {
    for (const p of SAMPLE_PATIENTS) {
      await db.collection('patients').doc(p.id).set({
        ...p,
        doctorId: doctorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    showToast("4 pacientes iniciales sincronizados en Firestore (pruebafinal-9704d)");
  } catch (err) {
    console.warn("Subida inicial notice:", err);
  }
}

// Botón manual de subida a Firebase
document.getElementById('btnSyncCloud').addEventListener('click', async () => {
  if (!currentUser) return;
  const btn = document.getElementById('btnSyncCloud');
  btn.disabled = true;
  btn.textContent = "Subiendo...";

  try {
    const listToSync = patientsList.length > 0 ? patientsList : SAMPLE_PATIENTS;
    for (const p of listToSync) {
      await db.collection('patients').doc(p.id).set({
        ...p,
        doctorId: currentUser.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    showToast(`¡Éxito! ${listToSync.length} pacientes subidos a Firestore`);
  } catch (err) {
    console.error(err);
    showToast("Error al subir a Firebase: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Subir Pacientes a Firebase";
  }
});

// 6. Renderizado de Pacientes y Estadísticas
function renderPatientsTable() {
  const tbody = document.getElementById('patientsTableBody');
  tbody.innerHTML = '';

  const q = document.getElementById('searchInput').value.toLowerCase().trim();

  const filtered = patientsList.filter(p => {
    if (currentFilter !== 'all' && p.status !== currentFilter) return false;
    if (!q) return true;
    const matchName = (p.firstName + " " + p.lastName).toLowerCase().includes(q);
    const matchId = (p.registrationId || '').toLowerCase().includes(q);
    const matchPhone = (p.phone || '').toLowerCase().includes(q);
    const matchMed = (p.medicationName || '').toLowerCase().includes(q);
    return matchName || matchId || matchPhone || matchMed;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No se encontraron registros de pacientes.</td></tr>`;
    return;
  }

  filtered.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="reg-id-badge">${p.registrationId}</span></td>
      <td>
        <strong>${p.firstName} ${p.lastName}</strong>
        <div style="font-size:11px; color:#94a3b8;">${p.diagnosis || 'Consulta regular'}</div>
      </td>
      <td style="font-family:monospace;">${p.phone}</td>
      <td>
        <strong>${p.medicationName}</strong>
        <div style="font-size:11px; color:#94a3b8;">${p.medicationFrequency || 'Cada 12h'} · Vía ${p.medicationRoute || 'Oral'}</div>
      </td>
      <td>
        <span class="med-amount-text">${p.medicationAmount} ${p.medicationUnit}</span>
      </td>
      <td>
        <span style="font-size:11px; font-weight:600; color:${p.status === 'activo' ? '#34d399' : '#fbbf24'};">
          ${p.status === 'activo' ? '● Activo' : '● Observación'}
        </span>
      </td>
      <td class="text-right">
        <button class="action-btn" title="Modificar Dosis" onclick="openDosageModal('${p.id}')">💊</button>
        <button class="action-btn" title="Imprimir Receta" onclick="openPrintModal('${p.id}')">🖨️</button>
        <button class="action-btn" title="Editar Paciente" onclick="openEditPatientModal('${p.id}')">✏️</button>
        <button class="action-btn" title="Eliminar" onclick="deletePatient('${p.id}')">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateStats() {
  document.getElementById('statTotal').textContent = patientsList.length;
  document.getElementById('statActive').textContent = patientsList.filter(p => p.status === 'activo').length;
  document.getElementById('statObs').textContent = patientsList.filter(p => p.status === 'en_observacion').length;
  document.getElementById('statDoses').textContent = patientsList.length;
}

// Búsqueda y Filtros
document.getElementById('searchInput').addEventListener('input', renderPatientsTable);
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.getAttribute('data-filter');
    renderPatientsTable();
  });
});

// 7. Modales de Paciente y Dosis
const patientModal = document.getElementById('patientModal');
document.getElementById('btnOpenNewPatientModal').addEventListener('click', () => {
  document.getElementById('patientForm').reset();
  document.getElementById('editPatientId').value = '';
  document.getElementById('modalTitle').textContent = "Registrar Nuevo Paciente";
  const count = patientsList.length + 1;
  document.getElementById('regId').value = `PAC-2026-${String(count).padStart(3, '0')}`;
  patientModal.classList.remove('hidden');
});

document.getElementById('btnClosePatientModal').addEventListener('click', () => patientModal.classList.add('hidden'));
document.getElementById('btnCancelPatient').addEventListener('click', () => patientModal.classList.add('hidden'));

// Guardar Paciente (Crear o Editar)
document.getElementById('patientForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const editId = document.getElementById('editPatientId').value;
  const patientData = {
    registrationId: document.getElementById('regId').value.trim().toUpperCase(),
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    age: Number(document.getElementById('age').value) || null,
    gender: document.getElementById('gender').value,
    allergies: document.getElementById('allergies').value.trim(),
    diagnosis: document.getElementById('diagnosis').value.trim(),
    medicationName: document.getElementById('medName').value.trim(),
    medicationAmount: Number(document.getElementById('medAmount').value),
    medicationUnit: document.getElementById('medUnit').value,
    medicationFrequency: document.getElementById('medFrequency').value.trim(),
    medicationRoute: document.getElementById('medRoute').value,
    medicationInstructions: document.getElementById('medInstructions').value.trim(),
    status: 'activo'
  };

  const docId = editId || `pat-${Date.now()}`;
  patientData.id = docId;

  if (currentUser) {
    patientData.doctorId = currentUser.uid;
    await db.collection('patients').doc(docId).set(patientData, { merge: true });
  } else {
    // Modo local
    const index = patientsList.findIndex(p => p.id === docId);
    if (index >= 0) patientsList[index] = patientData;
    else patientsList.unshift(patientData);
    renderPatientsTable();
    updateStats();
  }

  patientModal.classList.add('hidden');
  showToast("Paciente guardado con éxito");
});

window.openEditPatientModal = function(id) {
  const p = patientsList.find(x => x.id === id);
  if (!p) return;
  document.getElementById('editPatientId').value = p.id;
  document.getElementById('modalTitle').textContent = "Editar Paciente";
  document.getElementById('regId').value = p.registrationId;
  document.getElementById('firstName').value = p.firstName;
  document.getElementById('lastName').value = p.lastName;
  document.getElementById('phone').value = p.phone;
  document.getElementById('age').value = p.age || '';
  document.getElementById('gender').value = p.gender || 'Masculino';
  document.getElementById('allergies').value = p.allergies || '';
  document.getElementById('diagnosis').value = p.diagnosis || '';
  document.getElementById('medName').value = p.medicationName;
  document.getElementById('medAmount').value = p.medicationAmount;
  document.getElementById('medUnit').value = p.medicationUnit;
  document.getElementById('medFrequency').value = p.medicationFrequency || '';
  document.getElementById('medRoute').value = p.medicationRoute || 'Oral';
  document.getElementById('medInstructions').value = p.medicationInstructions || '';
  patientModal.classList.remove('hidden');
};

// Modal de Dosis
const dosageModal = document.getElementById('dosageModal');
window.openDosageModal = function(id) {
  const p = patientsList.find(x => x.id === id);
  if (!p) return;
  document.getElementById('dosagePatientId').value = p.id;
  document.getElementById('dosageCurrentText').textContent = `${p.medicationName}: ${p.medicationAmount} ${p.medicationUnit}`;
  document.getElementById('newAmount').value = p.medicationAmount;
  document.getElementById('newUnit').value = p.medicationUnit;
  document.getElementById('newFrequency').value = p.medicationFrequency || 'Cada 12 horas';
  dosageModal.classList.remove('hidden');
};

document.getElementById('btnCloseDosageModal').addEventListener('click', () => dosageModal.classList.add('hidden'));
document.getElementById('btnCancelDosage').addEventListener('click', () => dosageModal.classList.add('hidden'));

document.getElementById('dosageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('dosagePatientId').value;
  const newAmount = Number(document.getElementById('newAmount').value);
  const newUnit = document.getElementById('newUnit').value;
  const newFreq = document.getElementById('newFrequency').value;
  const reason = document.getElementById('doseReason').value;

  const updates = {
    medicationAmount: newAmount,
    medicationUnit: newUnit,
    medicationFrequency: newFreq,
    updatedAt: new Date().toISOString()
  };

  if (currentUser) {
    await db.collection('patients').doc(id).update(updates);
    // Registrar log
    await db.collection('patients').doc(id).collection('dosageLogs').add({
      amount: newAmount,
      unit: newUnit,
      frequency: newFreq,
      reason: reason,
      timestamp: new Date().toISOString(),
      doctorId: currentUser.uid
    });
  } else {
    const p = patientsList.find(x => x.id === id);
    if (p) Object.assign(p, updates);
    renderPatientsTable();
  }

  dosageModal.classList.add('hidden');
  showToast(`Dosis actualizada a ${newAmount} ${newUnit}`);
});

// Eliminar paciente
window.deletePatient = async function(id) {
  if (!confirm("¿Está seguro de eliminar este paciente de la base de datos?")) return;
  if (currentUser) {
    await db.collection('patients').doc(id).delete();
  }
  patientsList = patientsList.filter(p => p.id !== id);
  renderPatientsTable();
  updateStats();
  showToast("Paciente eliminado");
};

// Imprimir Receta
const printModal = document.getElementById('printModal');
window.openPrintModal = function(id) {
  const p = patientsList.find(x => x.id === id);
  if (!p) return;
  const container = document.getElementById('prescriptionPrintable');
  container.innerHTML = `
    <div class="presc-header">
      <div>
        <h2>Dr. Joel Valenzuela</h2>
        <div style="font-size:12px; color:#475569;">Medicina General · Cédula: MED-784920-CM</div>
        <div style="font-size:12px; color:#64748b;">Consultorio Médico Especializado</div>
      </div>
      <div style="text-align:right; font-size:12px; color:#64748b;">
        <strong>RECETA MÉDICA</strong>
        <div>Fecha: ${new Date().toLocaleDateString('es-ES')}</div>
        <div style="font-family:monospace; font-weight:700; color:#0f766e;">${p.registrationId}</div>
      </div>
    </div>

    <div class="presc-patient-info">
      <div><strong>Paciente:</strong> ${p.firstName} ${p.lastName} &nbsp;|&nbsp; <strong>Teléfono:</strong> ${p.phone}</div>
      <div style="margin-top:4px;"><strong>Diagnóstico:</strong> ${p.diagnosis || 'Tratamiento farmacológico'} &nbsp;|&nbsp; <strong>Alergias:</strong> ${p.allergies || 'Ninguna'}</div>
    </div>

    <div class="presc-recipe-box">
      <h3>Rp. ${p.medicationName}</h3>
      <div class="presc-amount">${p.medicationAmount} ${p.medicationUnit}</div>
      <div style="margin-top:8px; font-size:13px; color:#334155;"><strong>Frecuencia:</strong> ${p.medicationFrequency || 'Cada 12 horas'}</div>
      <div style="font-size:13px; color:#334155;"><strong>Vía de administración:</strong> ${p.medicationRoute || 'Oral'}</div>
      ${p.medicationInstructions ? `<div style="margin-top:8px; font-style:italic;">Indicaciones: ${p.medicationInstructions}</div>` : ''}
    </div>

    <div class="presc-sign">
      <div class="presc-sign-box">
        <strong>Dr. Joel Valenzuela</strong><br>
        Firma y Sello Médico
      </div>
    </div>
  `;
  printModal.classList.remove('hidden');
};

document.getElementById('btnClosePrintModal').addEventListener('click', () => printModal.classList.add('hidden'));

// Exportar CSV
document.getElementById('btnExportCsv').addEventListener('click', () => {
  const headers = ["ID Registro", "Nombres", "Apellidos", "Teléfono", "Diagnóstico", "Medicamento", "Cantidad", "Unidad", "Frecuencia"];
  const rows = patientsList.map(p => [
    `"${p.registrationId}"`,
    `"${p.firstName}"`,
    `"${p.lastName}"`,
    `"${p.phone}"`,
    `"${p.diagnosis || ''}"`,
    `"${p.medicationName}"`,
    p.medicationAmount,
    `"${p.medicationUnit}"`,
    `"${p.medicationFrequency || ''}"`
  ]);
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `pacientes_firebase_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Planilla CSV descargada");
});
