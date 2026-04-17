// ── CompleteProfilePage ───────────────────────────────────────────────────────
// Shown to new Google users who need to complete their profile.
// URL: /complete-profile?accessToken=...&refreshToken=...&role=...

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TokenStorage, authFetch } from '../auth/tokenManager';

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000';

export default function CompleteProfilePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    password: '',
    phoneNumber: '',
    bloodType: '',
    gender: '',
    speciality: '',
    establishment: '',
  });

  const role = params.get('role') || 'PATIENT';

  // Save tokens temporarily so authFetch works for the complete-profile call
  useEffect(() => {
    const at = params.get('accessToken');
    const rt = params.get('refreshToken');
    if (at && rt) {
      // Temporarily store with a placeholder user
      localStorage.setItem('accessToken', at);
      localStorage.setItem('refreshToken', rt);
    }
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch(`${AUTH_URL}/auth/complete-profile`, {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erreur lors de la complétion du profil');
      }

      // Fetch full profile and save
      const at = TokenStorage.getAccess()!;
      const rt = TokenStorage.getRefresh()!;
      const profileRes = await fetch(`${AUTH_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${at}` },
      });
      const profile = await profileRes.json();
      TokenStorage.save(at, rt, profile);

      navigate(role === 'DOCTOR' ? '/doctor' : '/patient', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-5xl">🏥</span>
          <h1 className="text-xl font-bold text-gray-800 mt-3">Complétez votre profil</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quelques informations supplémentaires sont nécessaires
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••" />
          </div>

          {role === 'PATIENT' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
                <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Groupe sanguin</label>
                  <input name="bloodType" value={form.bloodType} onChange={handleChange}
                    placeholder="A+, B-, O+…"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Genre</label>
                  <select name="gender" value={form.gender} onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">--</option>
                    <option value="MALE">Masculin</option>
                    <option value="FEMALE">Féminin</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {role === 'DOCTOR' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Spécialité</label>
                <input name="speciality" value={form.speciality} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Établissement</label>
                <input name="establishment" value={form.establishment} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 mt-2 text-sm">
            {loading ? 'Enregistrement…' : 'Enregistrer et continuer'}
          </button>
        </form>
      </div>
    </div>
  );
}