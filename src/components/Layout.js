

 import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path) => navigate(path);
  const isActive = (path) => location.pathname === path;

  const navItem = (path, label, icon) => (
    <button
      onClick={() => goTo(path)}
      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${
          isActive(path)
            ? 'bg-white/10 text-white'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">

      {/* SIDEBAR */}
      <div className="w-72 bg-black/40 backdrop-blur border-r border-white/10 flex flex-col">

        {/* TOP / BRAND */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-lg font-semibold tracking-tight">
            ⚡ FieldSync
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Workforce Management
          </p>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {user?.company?.name || 'No Company'}
          </p>
        </div>

        {/* NAV */}
        <div className="flex-1 p-4 space-y-1">

          {navItem('/dashboard', 'Dashboard', '🏠')}
          {navItem('/work-session', 'Work Session', '⏰')}
          {navItem('/tasks', 'Tasks', '📝')}
          {navItem('/profile', 'Profile', '👤')}

          {(user?.role === 'manager' || user?.role === 'owner') && (
            <>
              <div className="pt-4 pb-2 text-xs text-gray-500 uppercase tracking-wide">
                Management
              </div>

              {navItem('/employees', 'Employees', '👥')}
              {navItem('/locations', 'Locations', '📍')}
              {navItem('/reports', 'Reports', '📊')}
              {navItem('/billing', 'Billing', '💰')}
            </>
          )}
        </div>

        {/* USER / LOGOUT */}
        <div className="p-4 border-t border-white/10">
          <div className="mb-3">
            <p className="text-sm font-medium text-white">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role}
            </p>
          </div>

          <button onClick={logout} className="btn-danger w-full">
            Logout
          </button>
        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>

    </div>
  );
}

export default Layout;