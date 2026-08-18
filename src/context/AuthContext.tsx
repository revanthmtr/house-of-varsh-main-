import React, { createContext, useContext, useState, useEffect } from 'react';
import { resolveApiUrl } from '../utils/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read from both hov_token and chinni_token for 100% backwards compatibility
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('hov_token') || localStorage.getItem('chinni_token') || null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem('hov_token', token);
        localStorage.setItem('chinni_token', token);
      } catch {}

      fetch(resolveApiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          // Token is definitively invalid/expired
          throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => {
        if (err.message === 'Unauthorized') {
          setToken(null);
          setUser(null);
          try {
            localStorage.removeItem('hov_token');
            localStorage.removeItem('chinni_token');
          } catch {}
        }
      })
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    try {
      localStorage.setItem('hov_token', newToken);
      localStorage.setItem('chinni_token', newToken);
    } catch {}
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    try {
      localStorage.removeItem('hov_token');
      localStorage.removeItem('chinni_token');
    } catch {}
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
