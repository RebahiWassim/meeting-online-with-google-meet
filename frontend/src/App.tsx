import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import DoctorPage from './pages/DoctorPage';
import PatientPage from './pages/PatientPage';

// ── Route protégée : redirige vers /login si non authentifié ─────────────────
function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role?: 'DOCTOR' | 'PATIENT';
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🏥</div>
          <p className="text-gray-500 text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    // Redirige vers le bon dashboard si le rôle ne correspond pas
    return <Navigate to={user.role === 'DOCTOR' ? '/doctor' : '/patient'} replace />;
  }

  return children;
}

// ── Route publique : redirige vers le dashboard si déjà connecté ─────────────
function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to={user.role === 'DOCTOR' ? '/doctor' : '/patient'} replace />;
  }

  return children;
}

// ── Routes ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Racine → redirection selon état auth */}
      <Route path="/" element={<RootRedirect />} />

      {/* Pages publiques */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Callback OAuth Google — reçoit les tokens et redirige */}
      <Route path="/login-success" element={<LoginSuccessPage />} />

      {/* Completion de profil pour les nouveaux utilisateurs Google */}
      <Route path="/complete-profile" element={<CompleteProfilePage />} />

      {/* Dashboards protégés */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute role="DOCTOR">
            <DoctorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient"
        element={
          <ProtectedRoute role="PATIENT">
            <PatientPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'DOCTOR' ? '/doctor' : '/patient'} replace />;
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}