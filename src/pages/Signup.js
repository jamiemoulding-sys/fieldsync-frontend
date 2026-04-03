import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

function Signup() {
  const { login, createCompany } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const companyName = location.state?.companyName || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!email || !password) {
      return setError('Email and password required');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      // ✅ STEP 1: REGISTER USER
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.error);
      }

      // ✅ SAVE TOKEN
      localStorage.setItem('token', data.token);

      // ✅ STEP 2: CREATE COMPANY (NOW TOKEN EXISTS)
      const companyRes = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/create-company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}` // ✅ THIS IS THE KEY
        },
        body: JSON.stringify({ name: companyName })
      });

      const companyData = await companyRes.json();

      if (!companyRes.ok) {
        return setError(companyData.error);
      }

      // ✅ SAVE NEW TOKEN (WITH companyId)
      localStorage.setItem('token', companyData.token);

      // ✅ GO TO DASHBOARD
      navigate('/dashboard');

    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-900 p-8 rounded w-96 border border-white/10 space-y-4">

        <h2 className="text-2xl font-bold text-center">
          Create account for {companyName}
        </h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded"
        />

        <input
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-indigo-600 p-2 rounded hover:bg-indigo-700"
        >
          Create Account
        </button>

        {error && (
          <div className="text-red-400 text-sm text-center">{error}</div>
        )}

      </div>
    </div>
  );
}

export default Signup;