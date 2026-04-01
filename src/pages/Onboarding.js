import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Onboarding() {
  const { joinCompany, createCompany } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔗 JOIN (still requires backend token logic later)
  const handleJoin = async () => {
    setLoading(true);
    setError('');

    const res = await joinCompany(code);

    if (!res.success) {
      setError(res.error);
    } else {
      // ⚠️ backend not returning token yet
      navigate('/login');
    }

    setLoading(false);
  };

  // 🏢 CREATE COMPANY (FIXED FOR YOUR BACKEND)
  const handleCreate = async () => {
    if (!companyName.trim()) {
      return setError('Company name required');
    }

    setLoading(true);
    setError('');

    const res = await createCompany(companyName);

    if (!res.success) {
      setError(res.error);
    } else {
      // ✅ backend does NOT log user in → send to login
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">

      <div className="bg-gray-900 p-8 rounded w-96 border border-white/10 space-y-6">

        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome 👋</h1>
          <p className="text-gray-400 text-sm">
            Join a company or create your own
          </p>
        </div>

        {/* JOIN */}
        <div className="space-y-2">
          <input
            placeholder="Enter join code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded"
          />

          <button
            onClick={handleJoin}
            className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            Join Company
          </button>
        </div>

        {/* DIVIDER */}
        <div className="text-center text-gray-500 text-sm">
          OR
        </div>

        {/* CREATE */}
        <div className="space-y-2">
          <input
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded"
          />

          <button
            onClick={handleCreate}
            className="w-full bg-indigo-600 p-2 rounded hover:bg-indigo-700"
            disabled={loading}
          >
            Create Company
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center">{error}</div>
        )}

      </div>
    </div>
  );
}

export default Onboarding;