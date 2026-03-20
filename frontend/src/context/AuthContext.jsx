import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  // After login, fetch the full profile to get avatarUrl
  const fetchAndStoreProfile = async (username, tkn) => {
    try {
      const { data } = await axios.get(`${apiBase}/api/users/${username}`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      setUser((prev) => {
        const updated = {
          username:    data.username ?? prev?.username,
          role:        prev?.role ?? 'USER',
          avatarUrl:   data.avatarUrl ?? null,
          displayName: data.displayName ?? data.username,
        };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    } catch {}
  };

  const login = (data) => {
    const base = { username: data.username, role: data.role, avatarUrl: null };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(base));
    setToken(data.token);
    setUser(base);
    fetchAndStoreProfile(data.username, data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // On app load, always refresh profile data so avatarUrl stays current
  useEffect(() => {
    if (token && user?.username) {
      fetchAndStoreProfile(user.username, token);
    }
  }, []); // eslint-disable-line

  return (
      <AuthContext.Provider value={{ token, user, login, logout, isAdmin: user?.role === 'ADMIN' }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}