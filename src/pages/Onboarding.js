import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Onboarding() {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');

  // 🔗 JOIN (leave as-is for now)
  const handleJoin = () => {
    if (!code.trim()) {
      return setError('Enter a join code');
    }

    navigate('/login'); // keep simple for now
  };

  // 🏢 CREATE → GO TO SIGNUP (THIS IS THE KEY FIX)
  const handleCreate = () => {
    if (!companyName.trim()) {
      return setError('Company name required');
    }

    // 🚨 DO NOT CALL BACKEND HERE
    // 👉 Just go to signup page and pass company name

    navigate('/signup', {
      state: { companyName }
    });
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