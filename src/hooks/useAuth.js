import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // INIT USER
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        setUser({
          id: payload.id,
          email: payload.email,
          role: payload.role || 'employee'
        });
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  // LOGIN
  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error };
      }

      localStorage.setItem('token', data.token);

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      setUser(payload);

      return { success: true };

    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  // ✅ CREATE COMPANY (FIXED)
  const createCompany = async (companyName) => {
    try {
      const res = await fetch(`${API_URL}/api/companies/create-company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error };
      }

      return { success: true, token: data.token };

    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  // ✅ JOIN COMPANY (FIXED)
  const joinCompany = async (code) => {
    try {
      const res = await fetch(`${API_URL}/api/companies/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error };
      }

      return { success: true, token: data.token };

    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    createCompany,
    joinCompany
  };
}