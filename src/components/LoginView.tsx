import React, { useState } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Cloud,
  ExternalLink,
  UserPlus,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { signInWithGoogle, signInDoctorWithEmail, registerDoctorWithEmail } from '../services/firebase';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('joelvalenzuela0999@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ code?: string; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // REAL Firebase Authentication via signInWithEmailAndPassword or createUserWithEmailAndPassword
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorDetails(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim();

    try {
      if (isRegisterMode) {
        // Real Firebase Authentication: createUserWithEmailAndPassword
        await registerDoctorWithEmail(cleanEmail, password);
      } else {
        // Real Firebase Authentication: signInWithEmailAndPassword
        await signInDoctorWithEmail(cleanEmail, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      const code = err?.code || '';
      let msg = 'Error de autenticación en Firebase.';

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        msg = isRegisterMode
          ? 'Error al crear la cuenta. Verifique los datos ingresados.'
          : 'Credenciales incorrectas en Firebase. Si aún no ha creado la cuenta con esta contraseña, active la opción "Crear cuenta de Administrador".';
      } else if (code === 'auth/email-already-in-use') {
        msg = 'Este correo ya está registrado en Firebase. Por favor inicie sesión en lugar de registrarse.';
        setIsRegisterMode(false);
      } else if (code === 'auth/weak-password') {
        msg = 'La contraseña en Firebase debe tener al menos 6 caracteres.';
      } else if (code === 'auth/invalid-email') {
        msg = 'El formato de correo electrónico no es válido.';
      } else if (code === 'auth/operation-not-allowed') {
        msg = 'El proveedor de Correo/Contraseña no está habilitado en la consola de Firebase. Debe habilitarlo en Firebase Console > Authentication > Sign-in method.';
      } else {
        msg = err?.message || msg;
      }

      setError(msg);
      setErrorDetails({ code, message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-in with Firebase
  const handleGoogleSignIn = async () => {
    setError(null);
    setErrorDetails(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError('Error al conectar con Google Firebase: ' + (err?.message || 'Ventana cerrada o no autorizada.'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Local fallback login (if offline or testing)
  const handleOfflineFallback = () => {
    const success = StorageService.login(password, email);
    if (success) {
      onLoginSuccess();
    } else {
      setError('Contraseña local incorrecta. Para acceso sin conexión la clave por defecto es "doctor123" o PIN "1234".');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Medical Brand Seal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-900/40 mb-4 border border-teal-400/20">
            <Stethoscope className="w-8 h-8" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            MedControl <span className="text-teal-400 text-sm font-semibold tracking-normal border border-teal-500/40 px-2 py-0.5 rounded">DOCTOR</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Portal Privado de Administración Médica y Control de Pacientes
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-700/60">
            <div>
              <span className="text-xs uppercase tracking-wider text-teal-400 font-semibold block">
                Firebase Authentication Real
              </span>
              <h2 className="text-lg font-semibold text-slate-100">
                {isRegisterMode ? 'Registrar Administrador en Firebase' : 'Iniciar Sesión en Firebase'}
              </h2>
            </div>
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs sm:text-sm flex flex-col gap-2 animate-fadeIn">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>

              {errorDetails?.code === 'auth/operation-not-allowed' && (
                <div className="mt-2 pt-2 border-t border-red-800/60 text-xs text-red-300">
                  <p className="font-semibold mb-1">Para habilitar Email/Password en Firebase Console:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Entra a la consola del proyecto.</li>
                    <li>Ve a <strong>Authentication</strong> &gt; <strong>Sign-in method</strong>.</li>
                    <li>Habilita <strong>Email/Password (Correo electrónico/contraseña)</strong> y guarda.</li>
                  </ol>
                  <a
                    href="https://console.firebase.google.com/project/pruebafinal-9704d/authentication/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-teal-300 hover:text-teal-200 underline font-medium"
                  >
                    <span>Abrir Consola de Firebase Auth (pruebafinal-9704d)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Google Sign-in with Firebase */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-medium rounded-lg text-sm transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-slate-600/30 border-t-slate-800 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>Ingresar con Google (1 Clic)</span>
            </button>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-700"></div>
              <span className="px-3 text-[11px] text-slate-400 uppercase tracking-wider">
                o signInWithEmailAndPassword
              </span>
              <div className="flex-1 border-t border-slate-700"></div>
            </div>
          </div>

          {/* Form that executes signInWithEmailAndPassword */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="emailInput">
                Correo Electrónico del Médico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="emailInput"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@ejemplo.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300" htmlFor="passwordInput">
                  Contraseña de Firebase
                </label>
                <span className="text-[11px] text-slate-500">Mínimo 6 caracteres</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Iniciar Sesión button executing signInWithEmailAndPassword */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium rounded-lg text-sm transition-all shadow-md shadow-teal-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Conectando con Firebase Auth...</span>
                </>
              ) : isRegisterMode ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Crear Cuenta en Firebase (createUserWithEmailAndPassword)</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Iniciar Sesión (signInWithEmailAndPassword)</span>
                </>
              )}
            </button>

            {/* Toggle between signIn and createUser */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError(null);
                  setErrorDetails(null);
                }}
                className="text-xs text-teal-400 hover:text-teal-300 underline font-medium transition-colors cursor-pointer"
              >
                {isRegisterMode
                  ? '¿Ya tienes cuenta creada? Volver a Iniciar Sesión'
                  : '¿Primera vez con este correo? Crear cuenta de Administrador'}
              </button>
            </div>
          </form>

          {/* Emergency local offline login option */}
          <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>¿Sin conexión a internet?</span>
            <button
              type="button"
              onClick={handleOfflineFallback}
              className="text-slate-300 hover:text-white underline cursor-pointer"
            >
              Acceso local sin conexión
            </button>
          </div>
        </div>

        {/* Footer status */}
        <div className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
          <span>Conectado a Firebase Authentication (<code>pruebafinal-9704d</code>)</span>
        </div>
      </div>
    </div>
  );
};
