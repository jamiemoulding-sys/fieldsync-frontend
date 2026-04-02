import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

function Signup() {
  const { createCompany } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const companyName = location.state?.companyName || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // ✅ FIX (was missing)
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');

    // ✅ VALIDATION
    if (!email || !password || !confirmPassword) {
      return setError('All fields required');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    // 🚨 CREATE COMPANY (this also logs user in via token)
    const res = await createCompany(companyName);

    if (!res.success) {
      setError(res.error);
    } else {
      // ✅ IMPORTANT: go to dashboard AFTER token is set
      navigate('/dashboard');
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