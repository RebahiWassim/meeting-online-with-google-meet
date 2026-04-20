import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { TokenStorage, authFetch } from '../auth/tokenManager';
import { UserProfile } from '../types/reservation.types';

const AUTH_URL = 'https://authservice-version-90.onrender.com' ;

// ─── Context types ────────────────────────────────────────────────────────────

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const savedUser  = TokenStorage.getUser();
    const savedToken = TokenStorage.getAccess();
    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  // ── Login with email/password ─────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const res = await fetch('https://authservice-version-90.onrender.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'Sara.Mansouri@test.com', 
        password: '123456789' 
      })
    })
    .then(res => res.json())
    .then(data => console.log('Réponse:', data))
    .catch(err => console.error('Erreur:', err));
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Email ou mot de passe incorrect');
    }

    const data = await res.json();

    const profile = await fetchProfile(data.accessToken);
    TokenStorage.save(data.accessToken, data.refreshToken, profile);
    setToken(data.accessToken);
    setUser(profile);
  };

  // ── Fetch full user profile ───────────────────────────────────────────────

  const fetchProfile = async (accessToken: string): Promise<UserProfile> => {
    const res = await fetch(`${AUTH_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Impossible de récupérer le profil');
    return res.json();
  };

  // ── Refresh profile (e.g. after completing profile) ───────────────────────

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authFetch(`${AUTH_URL}/auth/profile`);
      if (res.ok) {
        const profile: UserProfile = await res.json();
        const savedAccess  = TokenStorage.getAccess()!;
        const savedRefresh = TokenStorage.getRefresh()!;
        TokenStorage.save(savedAccess, savedRefresh, profile);
        setUser(profile);
      }
    } catch { /* silent */ }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = async () => {
    try {
      await authFetch(`${AUTH_URL}/auth/logout`, { method: 'POST' });
    } catch { /* ignore network errors on logout */ }
    TokenStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
