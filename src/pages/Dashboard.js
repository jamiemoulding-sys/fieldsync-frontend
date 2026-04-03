import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';

function Dashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goTo = (path) => navigate(path);

  // ⏳ loading state
  if (loading) {
    return <div className="center-screen text-white">Loading...</div>;
  }

  // 🚨 FORCE ONBOARDING IF NO COMPANY
  if (!user?.companyId) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <Layout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-1">Dashboard</h1>
            <p className="subtle-text mt-1">
              Welcome back, {user?.email || 'User'}
            </p>
          </div>

          <button onClick={handleLogout} className="btn-danger">
            Logout
          </button>
        </div>

        {/* COMPANY */}
        <div className="card flex justify-between items-center">
          <div>
            <p className="subtle-text text-xs">Company</p>
            <p className="text-xl font-semibold text-white">
              {user?.companyId || 'None'}
            </p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="card">
          <h2 className="heading-2 mb-4">Quick Actions</h2>

          <div className="grid md:grid-cols-3 gap-4">

            <button onClick={() => goTo('/work-session')} className="btn-primary">
              ⏰ Start Work Session
            </button>

            <button onClick={() => goTo('/Tasks')} className="btn-primary">
              📝 View Tasks
            </button>

            <button onClick={() => goTo('/profile')} className="btn-primary">
              👤 My Profile
            </button>

            {(user?.role === 'manager' || user?.role === 'owner') && (
              <>
                <button onClick={() => goTo('/admin')} className="btn-secondary">
                  ⚙️ Admin Settings
                </button>

                <button onClick={() => goTo('/employees')} className="btn-secondary">
                  👥 Manage Employees
                </button>

                <button onClick={() => goTo('/locations')} className="btn-secondary">
                  📍 Locations
                </button>

                <button onClick={() => goTo('/reports')} className="btn-secondary">
                  📊 Reports
                </button>

                <button onClick={() => navigate('/manager-map')} className="btn-secondary">
                  🗺️ Live Map
                </button>

                <button
                  onClick={() => navigate('/manager')}
                  className="group relative overflow-hidden bg-blue-600 px-6 py-3 rounded-xl font-semibold
                             transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                >
                  <span className="relative z-10">Manager Dashboard</span>
                </button>

                <button onClick={() => goTo('/billing')} className="btn-secondary">
                  💰 Billing
                </button>
              </>
            )}

          </div>
        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;