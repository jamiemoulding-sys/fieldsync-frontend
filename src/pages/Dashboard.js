import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};

  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [hours, setHours] = useState([]);
  const [showBilling, setShowBilling] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.get('/dashboard');
      const data = res?.data || {};

      setStats(data.stats || {});
      setActivity(data.activity || []);
      setHours(data.trends?.hours || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={layout}>

      {/* SIDEBAR */}
      <div style={sidebar}>
        <div>

          <h2 style={brand}>FieldSync</h2>

          {/* CORE */}
          <Section title="Core">
            <Nav label="Dashboard" active />
            <Nav label="Work Session" onClick={() => navigate('/work-session')} />
            <Nav label="Tasks" onClick={() => navigate('/tasks')} />
          </Section>

          {/* MANAGEMENT */}
          <Section title="Management">
            <Nav label="Employees" onClick={() => navigate('/employees')} />
            <Nav label="Schedule" onClick={() => navigate('/schedule')} />
            <Nav label="Locations" onClick={() => navigate('/locations')} />
            <Nav label="Holiday Requests" onClick={() => navigate('/holiday-requests')} />
            <Nav label="Timesheets" onClick={() => navigate('/timesheets')} />
          </Section>

          {/* BUSINESS */}
          <Section title="Business">
            <Nav label="Reports" onClick={() => navigate('/reports')} />
            <Nav label="Performance" onClick={() => navigate('/performance')} />
          </Section>

          {/* ACCOUNT */}
          <Section title="Account">
            <Nav label="Profile" onClick={() => navigate('/profile')} />

            <Nav
              label="Billing ▾"
              onClick={() => setShowBilling(!showBilling)}
            />

            {showBilling && (
              <div style={subMenu}>
                <Nav label="Plans" onClick={() => navigate('/billing')} />
                <Nav label="Invoices" onClick={() => navigate('/billing')} />
              </div>
            )}
          </Section>

        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          style={logoutBtn}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={main}>

        {/* TOP BAR */}
        <div style={topbar}>
          <div>
            <h1 style={title}>Dashboard</h1>
            <p style={subtitle}>Real-time overview</p>
          </div>

          <div style={userBox}>
            {user?.name || user?.email}
          </div>
        </div>

        {/* KPIs */}
        <div style={kpiGrid}>
          <KPI title="Users" value={stats.users || 0} />
          <KPI title="Active Staff" value={stats.activeShifts || 0} />
          <KPI title="Tasks" value={stats.tasks || 0} />
          <KPI title="Completed" value={stats.completedTasks || 0} />
        </div>

        {/* CHARTS */}
        <div style={chartGrid}>

          <div style={card}>
            <h3 style={cardTitle}>Weekly Hours</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hours}>
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#6366f1" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={card}>
            <h3 style={cardTitle}>Top Performers</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activity}>
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="action" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* ACTIVITY */}
        <div style={card}>
          <h3 style={cardTitle}>Live Activity</h3>

          {activity.length === 0 && (
            <p style={muted}>No recent activity</p>
          )}

          {activity.map((a, i) => (
            <div key={i} style={activityRow}>
              <strong>{a.name}</strong> — {a.action}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* COMPONENTS */

function Nav({ label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...nav,
        background: active ? '#1f2937' : 'transparent',
        color: active ? 'white' : '#9ca3af'
      }}
    >
      {label}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={sectionTitle}>{title}</p>
      {children}
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div style={kpi}>
      <p style={muted}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

/* STYLES */

const layout = {
  display: 'flex',
  height: '100vh',
  background: '#0b0f14',
  color: 'white'
};

const sidebar = {
  width: 240,
  background: '#0f172a',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  borderRight: '1px solid #1f2937'
};

const brand = { marginBottom: 20 };

const sectionTitle = {
  fontSize: 12,
  color: '#6b7280',
  marginBottom: 6,
  textTransform: 'uppercase'
};

const nav = {
  width: '100%',
  padding: 10,
  borderRadius: 8,
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  marginBottom: 4
};

const subMenu = {
  paddingLeft: 10
};

const main = {
  flex: 1,
  padding: 30
};

const topbar = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 25
};

const userBox = {
  background: '#111827',
  padding: '6px 10px',
  borderRadius: 8
};

const title = { margin: 0 };
const subtitle = { color: '#6b7280' };

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 20,
  marginBottom: 20
};

const chartGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 20,
  marginBottom: 20
};

const kpi = {
  background: '#111827',
  padding: 20,
  borderRadius: 10
};

const card = {
  background: '#111827',
  padding: 20,
  borderRadius: 10,
  marginBottom: 20
};

const cardTitle = { marginBottom: 15 };

const activityRow = {
  marginBottom: 8
};

const muted = { color: '#6b7280' };

const logoutBtn = {
  padding: 10,
  width: '100%',
  background: '#111827',
  border: '1px solid #1f2937',
  borderRadius: 8,
  color: '#9ca3af'
};

export default Dashboard;