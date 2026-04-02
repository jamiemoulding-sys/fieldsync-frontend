import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 INIT USER FROM TOKEN
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

  // 🔐 LOGIN
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

      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role || 'employee'
      });

      return { success: true };

    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  // 🏢 CREATE COMPANY (USED IN SIGNUP PAGE)
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

      // ✅ SAVE TOKEN
      localStorage.setItem('token', data.token);

      // ✅ SET USER IMMEDIATELY
      const payload = JSON.parse(atob(data.token.split('.')[1]));

      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role || 'employee'
      });

      return { success: true };

    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  // 🔗 JOIN COMPANY
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

      // ✅ SAVE TOKEN HERE TOO
      localStorage.setItem('token', data.token);

      const payload = JSON.parse(atob(data.token.split('.')[1]));

      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role || 'employee'
      });

      return { success: true };

    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  // 🚪 LOGOUT
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