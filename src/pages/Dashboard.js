import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ✅ MAKE SURE THIS MATCHES YOUR api.js EXPORTS
import {
  shiftAPI,
  analyticsAPI,
  userAPI,
  holidayAPI
} from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};

  const [activeShifts, setActiveShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [todayHours, setTodayHours] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [holidayCount, setHolidayCount] = useState(0);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    loadData();
    const i = setInterval(loadData, 15000);
    return () => clearInterval(i);
  }, []);

  const loadData = async () => {
    try {
      const [activeRes, analyticsRes, usersRes, holidayRes] =
        await Promise.all([
          shiftAPI.getAllActive(),
          analyticsAPI.getShifts(),
          userAPI.getAll(),
          holidayAPI.getAll()
        ]);

      // ✅ FIX: always use .data safely
      const active = activeRes?.data || [];
      const analytics = analyticsRes?.data || [];
      const usersData = usersRes?.data || [];
      const holidays = holidayRes?.data || [];

      setActiveShifts(active);
      setUsers(usersData);

      // ✅ SAFE HOLIDAY COUNT
      const pending = holidays.filter(h => h?.status === 'pending').length;
      setHolidayCount(pending);

      const weekly = analytics.reduce((s, d) => s + Number(d.hours || 0), 0);
      setWeeklyHours(weekly);

      const todayStr = new Date().toDateString();
      const today = analytics
        .filter(d => new Date(d.date).toDateString() === todayStr)
        .reduce((s, d) => s + Number(d.hours || 0), 0);

      setTodayHours(today);

      const a = [];
      if (active.length === 0) a.push('No staff clocked in');
      if (pending > 0) a.push(`${pending} holiday requests pending`);

      setAlerts(a);

    } catch (err) {
      console.error('DASHBOARD LOAD ERROR:', err);
    }
  };

  return (
    <div style={layout}>

      {/* SIDEBAR */}
      <div style={sidebar}>
        <div>
          <h2 style={brand}>FieldSync</h2>

          <Nav label="Dashboard" active />
          <Nav label="Profiles" onClick={() => navigate('/employees')} />
          <Nav label="Schedule" onClick={() => navigate('/schedule')} />

          {/* ✅ FIXED ROUTE + BADGE */}
          <Nav
            label="Holiday Requests"
            badge={holidayCount}
            onClick={() => navigate('/holiday-requests')}
          />

          <Nav label="Reports" onClick={() => navigate('/reports')} />
          <Nav label="Performance" onClick={() => navigate('/performance')} />
        </div>

        <div>
          <Nav label="Upgrade" highlight onClick={() => navigate('/billing')} />
          <button onClick={logout} style={logoutBtn}>Logout</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={main}>

        {/* HEADER */}
        <div style={topbar}>
          <div>
            <h1 style={title}>Dashboard</h1>
            <p style={subtitle}>Overview of your company</p>
          </div>

          <div style={userBox}>
            {user?.name}
          </div>
        </div>

        {/* KPI */}
        <div style={kpiGrid}>
          <KPI title="Active Staff" value={activeShifts.length} />
          <KPI title="Today Hours" value={todayHours} />
          <KPI title="Weekly Hours" value={weeklyHours} />
        </div>

        {/* ALERTS */}
        {alerts.length > 0 && (
          <div style={alertsBox}>
            {alerts.map((a, i) => (
              <div key={i}>⚠️ {a}</div>
            ))}
          </div>
        )}

        {/* CONTENT */}
        <div style={contentGrid}>

          {/* TEAM */}
          <div style={card}>
            <h3 style={cardTitle}>Team</h3>

            {users.map(u => {
              const active = activeShifts.find(s => s.user_id === u.id);

              return (
                <div key={u.id} style={row}>
                  <div>
                    <span style={dot(active)} />
                    {u.name}
                  </div>

                  <div style={muted}>
                    {active ? 'Working' : 'Offline'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTIVITY */}
          <div style={card}>
            <h3 style={cardTitle}>Activity</h3>
            <p style={muted}>Live system activity coming soon</p>
          </div>

        </div>

      </div>
    </div>
  );
}

/* COMPONENTS */

function Nav({ label, onClick, active, highlight, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...nav,
        background: active ? '#1f2937' : 'transparent',
        color: highlight ? '#10b981' : active ? 'white' : '#9ca3af'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <span>{label}</span>

        {badge > 0 && (
          <span style={badgeStyle}>
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}

function KPI({ title, value }) {
  return (
    <div style={kpi}>
      <p style={muted}>{title}</p>
      <h2 style={{ marginTop: 6 }}>{value}</h2>
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
  width: 230,
  background: '#0f172a',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  borderRight: '1px solid #1f2937'
};

const brand = {
  marginBottom: 25,
  fontWeight: 600
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

const badgeStyle = {
  background: '#ef4444',
  borderRadius: 20,
  padding: '2px 8px',
  fontSize: 12,
  color: 'white'
};

const logoutBtn = {
  marginTop: 10,
  padding: 10,
  width: '100%',
  background: '#111827',
  border: '1px solid #1f2937',
  borderRadius: 8,
  color: '#9ca3af',
  cursor: 'pointer'
};

const main = {
  flex: 1,
  padding: 30,
  overflowY: 'auto'
};

const topbar = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 25
};

const title = { margin: 0 };
const subtitle = { color: '#6b7280', marginTop: 4 };

const userBox = {
  background: '#111827',
  padding: '8px 12px',
  borderRadius: 8,
  fontSize: 14
};

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 20,
  marginBottom: 20
};

const kpi = {
  background: '#111827',
  padding: 20,
  borderRadius: 10,
  border: '1px solid #1f2937'
};

const alertsBox = {
  background: '#1f2937',
  padding: 12,
  borderRadius: 8,
  marginBottom: 20,
  fontSize: 14
};

const contentGrid = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: 20
};

const card = {
  background: '#111827',
  padding: 20,
  borderRadius: 10,
  border: '1px solid #1f2937'
};

const cardTitle = {
  marginBottom: 15
};

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 10
};

const muted = {
  color: '#6b7280'
};

const dot = (active) => ({
  display: 'inline-block',
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: active ? '#10b981' : '#374151',
  marginRight: 8
});

export default Dashboard;