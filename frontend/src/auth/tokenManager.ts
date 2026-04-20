// ── Token & Session management ───────────────────────────────────────────────
// Stores accessToken + refreshToken + user profile in localStorage.
// Provides a fetch wrapper that auto-refreshes the access token on 401.

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000';

// ─── Storage helpers ─────────────────────────────────────────────────────────

export const TokenStorage = {
  getAccess: (): string | null => localStorage.getItem('accessToken'),
  getRefresh: (): string | null => localStorage.getItem('refreshToken'),
  getUser: (): import('../types/reservation.types').UserProfile | null => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  save: (
    accessToken: string,
    refreshToken: string,
    user: import('../types/reservation.types').UserProfile
  ) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

// ─── Token refresh ───────────────────────────────────────────────────────────

let _refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const refreshToken = TokenStorage.getRefresh();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${AUTH_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    TokenStorage.clear();
    window.location.href = '/login';
    throw new Error('Session expirée');
  }

  const data = await res.json();
  // Update only the access token (refreshToken may or may not be rotated)
  const newAccess: string = data.accessToken;
  const newRefresh: string = data.refreshToken || refreshToken;
  const user = TokenStorage.getUser()!;
  TokenStorage.save(newAccess, newRefresh, user);
  return newAccess;
}

async function refreshOnce(): Promise<string> {
  if (!_refreshPromise) {
    _refreshPromise = doRefresh().finally(() => { _refreshPromise = null; });
  }
  return _refreshPromise;
}

// ─── Authenticated fetch wrapper ─────────────────────────────────────────────

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = TokenStorage.getAccess();

  const makeRequest = (tok: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
        ...(options.headers || {}),
      },
    });

  let res = await makeRequest(token);

  // Token expired → refresh and retry once
  if (res.status === 401) {
    try {
      const newToken = await refreshOnce();
      res = await makeRequest(newToken);
    } catch {
      // refreshOnce already cleared storage & redirected
      throw new Error('Session expirée, veuillez vous reconnecter.');
    }
  }

  return res;
}
