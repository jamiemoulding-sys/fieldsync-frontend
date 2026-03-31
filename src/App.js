import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { useAuth } from './hooks/useAuth';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import WorkSession from './pages/WorkSession';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Locations from './pages/Locations';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Billing from './pages/Billing';
import TimeSheet from './pages/TimeSheet';
import HolidayRequests from './pages/HolidayRequests';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerMap from './pages/ManagerMap';
import AddLocation from './pages/AddLocation';
import Admin from './pages/Admin';

//
// 🔐 SIMPLE + SAFE ROUTE GUARD
//
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // wait for auth to finish
  if (loading) return <div />;

  // not logged in → go login
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

//
// 🔥 ROUTES
//
function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />

      {/* PRIVATE */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
      <Route path="/work-session" element={<PrivateRoute><WorkSession /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
      <Route path="/locations" element={<PrivateRoute><Locations /></PrivateRoute>} />
      <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
      <Route path="/timesheet" element={<PrivateRoute><TimeSheet /></PrivateRoute>} />
      <Route path="/holiday-requests" element={<PrivateRoute><HolidayRequests /></PrivateRoute>} />
      <Route path="/manager" element={<ManagerDashboard />} />
      {/* 🚨 IMPORTANT: REMOVE DASHBOARD REDIRECT LOOP */}
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/manager-map" element={<ManagerMap />} />
      <Route path="/add-location" element={<AddLocation />} />    
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

//
// 🚀 ROOT
//
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;