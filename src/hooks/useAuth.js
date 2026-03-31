import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // ✅ decode JWT payload (basic)
          const payload = JSON.parse(atob(token.split('.')[1]));

          setUser({
            id: payload.id,
            email: payload.email,
            role: payload.role || 'employee'
          });
        } catch (err) {
          console.error('Invalid token:', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    init();
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      // ✅ SAVE TOKEN (CRITICAL)
      localStorage.setItem('token', data.token);

      // ✅ SET USER FROM TOKEN
      const payload = JSON.parse(atob(data.token.split('.')[1]));

      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role || 'employee'
      });

      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout
  };
}