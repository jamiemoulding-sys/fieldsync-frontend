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

    // ✅ CLEAN redirect (no reload needed)
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">

      <div className="bg-gray-900 p-8 rounded w-96 border border-white/10">

        <h2 className="text-2xl mb-6 text-center">Welcome back</h2>

        {error && (
          <div className="text-red-400 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleLogin}>

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
            className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        {/* ✅ SIGN UP ENTRY */}
        <div className="text-center mt-6 text-sm text-gray-400">
          Don’t have an account?
          <button
            onClick={() => navigate('/onboarding')}
            className="ml-2 text-indigo-400 hover:text-indigo-300"
          >
            Get started
          </button>
        </div>

      </div>

    </div>
  );
}

export default Login;