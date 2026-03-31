import React from 'react';
import { useNavigate } from 'react-router-dom';
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

  // ✅ prevent crash while auth loading
  if (loading) {
    return <div className="center-screen text-white">Loading...</div>;
  }

  return (
    <Layout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-1">
              Dashboard
            </h1>
            <p className="subtle-text mt-1">
              Welcome back, {user?.name || 'User'}
            </p>
          </div>

          <button onClick={handleLogout} className="btn-danger">
            Logout
          </button>
        </div>

        {/* COMPANY */}
        {user?.company && (
          <div className="card flex justify-between items-center">
            <div>
              <p className="subtle-text text-xs">Company</p>
              <p className="text-xl font-semibold text-white">
                {user?.company?.name}
              </p>
            </div>

            {user?.role === 'owner' && (
              <div className="text-right">
                <p className="subtle-text text-xs">Join Code</p>
                <p className="font-semibold text-indigo-400">
                  {user?.company?.join_code}
                </p>
              </div>
            )}
          </div>
        )}

        {/* KPI CARDS */}
        <div className="grid md:grid-cols-4 gap-6">

          <div className="card">
            <p className="subtle-text">Status</p>
            <p className="text-lg font-semibold text-green-400 mt-2">
              Active
            </p>
          </div>

          <div className="card">
            <p className="subtle-text">Role</p>
            <p className="text-lg font-semibold capitalize mt-2 text-white">
              {user?.role || 'N/A'}
            </p>
          </div>

          <div className="card">
            <p className="subtle-text">Company</p>
            <p className="text-lg font-semibold mt-2 text-white">
              {user?.company?.name || 'None'}
            </p>
          </div>

          <div className="card">
            <p className="subtle-text">System</p>
            <p className="text-lg font-semibold text-green-400 mt-2">
              Operational
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

            <button onClick={() => goTo('/tasks')} className="btn-primary">
              📝 View Tasks
            </button>

            <button onClick={() => goTo('/profile')} className="btn-primary">
              👤 My Profile
            </button>

            {(user?.role === 'manager' || user?.role === 'owner') && (
              <>
               
               
                <button
                       onClick={() => goTo('/admin')}
                       className="btn-secondary"
>
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

                {/* 🔥 ANIMATED MANAGER BUTTON */}
                <button
                  onClick={() => navigate('/manager')}
                  className="group relative overflow-hidden bg-blue-600 px-6 py-3 rounded-xl font-semibold
                             transition-all duration-300
                             hover:scale-105 active:scale-95
                             shadow-lg"
                >
                  <span className="relative z-10">Manager Dashboard</span>

                  <span className="absolute inset-0 rounded-xl bg-blue-400 opacity-0 group-hover:opacity-30 blur-md transition-all duration-300"></span>

                  <span className="absolute inset-0 rounded-xl border border-blue-300 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                </button>

                <button onClick={() => goTo('/billing')} className="btn-secondary">
                  💰 Billing
                </button>
              </>
            )}

          </div>
        </div>

        {/* OVERVIEW */}
        <div className="card">
          <h2 className="heading-2 mb-2">Overview</h2>
          <p className="subtle-text">
            Everything is running smoothly. Your team is active and your system is operational.
          </p>
        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;