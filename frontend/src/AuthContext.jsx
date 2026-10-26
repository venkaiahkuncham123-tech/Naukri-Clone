import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('naukri_user') || 'null'); } catch { return null; }
  });

  const save = (u, token) => {
    if (token) localStorage.setItem('naukri_token', token);
    if (u) localStorage.setItem('naukri_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('naukri_token');
    localStorage.removeItem('naukri_user');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('naukri_token');
    if (token && !user) {
      api.get('/api/auth/me').then((r) => save(r.data.user, token)).catch(() => logout());
    }
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider value={{ user, save, logout, isRecruiter: user?.role === 'recruiter', isSeeker: user?.role !== 'recruiter' }}>
      {children}
    </AuthContext.Provider>
  );
}
