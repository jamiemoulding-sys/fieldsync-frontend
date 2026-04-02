import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { useAuth } from './hooks/useAuth';
import Signup from './pages/Signup';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import WorkSession from './pages/WorkSession';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks.js';
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

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div />;

  // ❌ not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 🚨 logged in BUT no company → go onboarding
  if (!user.companyId) {
    return <Navigate to="/onboarding" />;
  }

  // ✅ logged in + has company
  return children;
}

function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/signup" element={<Signup />} />

      {/* PRIVATE */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/work-session" element={<PrivateRoute><WorkSession /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/Tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
      <Route path="/locations" element={<PrivateRoute><Locations /></PrivateRoute>} />
      <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
      <Route path="/timesheet" element={<PrivateRoute><TimeSheet /></PrivateRoute>} />
      <Route path="/holiday-requests" element={<PrivateRoute><HolidayRequests /></PrivateRoute>} />

      {/* OPTIONAL */}
      <Route path="/manager" element={<ManagerDashboard />} />
      <Route path="/manager-map" element={<ManagerMap />} />
      <Route path="/add-location" element={<AddLocation />} />
      <Route path="/admin" element={<Admin />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

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
