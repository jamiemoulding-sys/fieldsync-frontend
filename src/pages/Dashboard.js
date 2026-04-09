import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};

  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [hours, setHours] = useState([]); // 🔥 NEW (trend data)

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 10000);
    return () => clearInterval(i);
  }, []);

  const load = async () => {
    try {
      const res = await api.get('/dashboard');

      const data = res?.data || {};

      const statsData = data?.stats || {};
      const activityData = data?.activity || [];
      const hoursData = data?.trends?.hours || [];

      setStats(statsData);
      setActivity(activityData);
      setHours(hoursData);

      // 🔔 notifications
      const notifs = [];

      if (statsData?.pendingHolidays > 0) {
        notifs.push(`${statsData.pendingHolidays} pending holiday requests`);
      }

      if (statsData?.activeShifts === 0) {
        notifs.push('No staff currently clocked in');
      }

      setNotifications(notifs);

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
          <Nav label="Holiday Requests" onClick={() => navigate('/holiday-requests')} />
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

        {/* TOP BAR */}
        <div style={topbar}>
          <div>
            <h1 style={title}>Dashboard</h1>
            <p style={subtitle}>Real-time company overview</p>
          </div>

          <div style={topRight}>
            <div style={bell}>
              🔔
              {notifications.length > 0 && (
                <span style={notifBadge}>{notifications.length}</span>
              )}
            </div>

            <div style={userBox}>{user?.name}</div>
          </div>
        </div>

        {/* KPI */}
        <div style={kpiGrid}>
          <KPI title="Users" value={stats?.users || 0} />
          <KPI title="Active Staff" value={stats?.activeShifts || 0} />
          <KPI title="Tasks" value={stats?.tasks || 0} />
          <KPI title="Completed" value={stats?.completedTasks || 0} />
        </div>

        {/* 🔥 HOURS TREND (NEW) */}
        <div style={card}>
          <h3 style={cardTitle}>Hours (Last 7 Days)</h3>

          {hours.length === 0 && (
            <p style={muted}>No data</p>
          )}

          {hours.map((h, i) => (
            <div key={i} style={activityRow}>
              <div>{new Date(h.date).toLocaleDateString()}</div>
              <div>{Number(h.hours).toFixed(1)} hrs</div>
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div style={contentGrid}>

          {/* ACTIVITY FEED */}
          <div style={card}>
            <h3 style={cardTitle}>Live Activity</h3>

            {activity.length === 0 && (
              <p style={muted}>No recent activity</p>
            )}

            {activity.map((a, i) => (
              <div key={i} style={activityRow}>
                <div>
                  <strong>{a.name || 'User'}</strong> {formatAction(a)}
                </div>
                <div style={time}>
                  {timeAgo(a.created_at)}
                </div>
              </div>
            ))}
          </div>

          {/* INSIGHTS */}
          <div style={card}>
            <h3 style={cardTitle}>Insights</h3>

            <p style={muted}>
              {stats?.pendingHolidays > 0
                ? `${stats.pendingHolidays} holidays need approval`
                : 'No pending approvals'}
            </p>

            <p style={muted}>
              {stats?.activeShifts > 0
                ? `${stats.activeShifts} staff currently working`
                : 'No active shifts'}
            </p>

            <p style={muted}>
              Late rate: {stats?.lateRate || 0}%
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

/* HELPERS */

const formatAction = (a) => {
  switch (a?.action) {
    case 'clock_in': return 'clocked in';
    case 'clock_out': return 'clocked out';
    case 'task_completed': return `completed ${a?.metadata?.task || 'a task'}`;
    case 'task_created': return `created ${a?.metadata?.title || 'a task'}`;
    default: return a?.action || 'did something';
  }
};

const timeAgo = (date) => {
  if (!date) return '';
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* COMPONENTS */

function Nav({ label, onClick, active, highlight }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...nav,
        background: active ? '#1f2937' : 'transparent',
        color: highlight ? '#10b981' : active ? 'white' : '#9ca3af'
      }}
    >
      {label}
    </button>
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
  width: 230,
  background: '#0f172a',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  borderRight: '1px solid #1f2937'
};

const brand = { marginBottom: 25 };

const nav = {
  width: '100%',
  padding: 10,
  borderRadius: 8,
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  marginBottom: 4
};

const logoutBtn = {
  marginTop: 10,
  padding: 10,
  width: '100%',
  background: '#111827',
  border: '1px solid #1f2937',
  borderRadius: 8,
  color: '#9ca3af'
};

const main = { flex: 1, padding: 30 };

const topbar = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 25
};

const topRight = {
  display: 'flex',
  alignItems: 'center',
  gap: 15
};

const bell = {
  position: 'relative',
  fontSize: 20,
  cursor: 'pointer'
};

const notifBadge = {
  position: 'absolute',
  top: -6,
  right: -10,
  background: '#ef4444',
  borderRadius: 20,
  fontSize: 10,
  padding: '2px 6px'
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

const kpi = {
  background: '#111827',
  padding: 20,
  borderRadius: 10,
  border: '1px solid #1f2937'
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
  marginBottom: 20
};

const cardTitle = { marginBottom: 15 };

const activityRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 10
};

const muted = { color: '#6b7280' };
const time = { color: '#6b7280', fontSize: 12 };

export default Dashboard;