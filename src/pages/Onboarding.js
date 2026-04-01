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

  const handleJoin = async () => {
    setLoading(true);
    setError('');

    const res = await joinCompany(code);

    if (!res.success) {
      setError(res.error);
    } else {
      navigate('/dashboard'); // ✅ FIXED
    }

    setLoading(false);
  };

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
      navigate('/dashboard'); // ✅ FIXED
    }

    setLoading(false);
  };

  return (
    <div className="center-screen">
      <div className="card max-w-md w-full space-y-6">

        <div className="text-center">
          <h1 className="heading-2">Welcome 👋</h1>
          <p className="subtle-text">
            Join a company or create your own
          </p>
        </div>

        {/* JOIN */}
        <div className="space-y-2">
          <input
            placeholder="Enter join code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-field"
          />

          <button
            onClick={handleJoin}
            className="btn-primary w-full"
            disabled={loading}
          >
            Join Company
          </button>
        </div>

        {/* DIVIDER */}
        <div className="text-center subtle-text">
          OR
        </div>

        {/* CREATE */}
        <div className="space-y-2">
          <input
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="input-field"
          />

          <button
            onClick={handleCreate}
            className="btn-primary w-full"
            disabled={loading}
          >
            Create Company
          </button>
        </div>

        {error && <div className="badge-error">{error}</div>}

      </div>
    </div>
  );
}


export default Onboarding;