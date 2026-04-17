// ── LoginSuccessPage ──────────────────────────────────────────────────────────
// Handles the smart redirect from Google OAuth callback.
// URL: /login-success?accessToken=...&refreshToken=...&role=...&redirect=/doctor
// Saves tokens to localStorage then navigates to the correct dashboard.

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TokenStorage, authFetch } from '../auth/tokenManager';

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000';

export default function LoginSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken  = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const redirect     = params.get('redirect') || '/';

    if (!accessToken || !refreshToken) {
      setError('Paramètres manquants dans le lien de redirection.');
      return;
    }

    // Fetch the full user profile then save everything
    fetch(`${AUTH_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Profil inaccessible');
        return res.json();
      })
      .then(profile => {
        TokenStorage.save(accessToken, refreshToken, profile);
        navigate(redirect, { replace: true });
      })
      .catch(() => {
        setError('Impossible de récupérer votre profil. Veuillez vous reconnecter.');
      });
  }, [params, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🏥</div>
        <p className="text-gray-500 text-sm">Connexion en cours…</p>
      </div>
    </div>
  );
}
