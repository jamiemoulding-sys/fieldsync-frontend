import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    const res = await login(form);

    if (!res.success) {
      setError(res.error || 'Login failed');
      setLoading(false);
      return;
    }

    // ✅ HARD FIX: force redirect AFTER token saved
    setTimeout(() => {
      navigate('/dashboard');
      window.location.reload(); // ensures auth state refresh
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded w-96"
      >
        <h2 className="text-2xl mb-6">Login</h2>

        {error && (
          <div className="text-red-400 mb-4">{error}</div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 p-2 bg-gray-800 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-4 p-2 bg-gray-800 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 p-2 rounded"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;