import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      setUser({ username: localStorage.getItem('username') || 'User' });
    }
    setLoading(false);
  }, [token]);

  async function login(username, password) {
    const { data } = await api.post('/token/', { username, password });
    const tkn = data.token;
    localStorage.setItem('token', tkn);
    localStorage.setItem('username', username);
    setAuthToken(tkn);
    setToken(tkn);
    setUser({ username });
    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
