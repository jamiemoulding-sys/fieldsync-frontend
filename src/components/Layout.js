import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { section: 'Core', items: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Schedule', path: '/schedule' },
      { name: 'Holiday Requests', path: '/holiday-requests' },
      { name: 'Tasks', path: '/tasks' },
    ]},
    { section: 'Management', items: [
      { name: 'Employees', path: '/employees' },
      { name: 'Locations', path: '/locations' },
    ]},
    { section: 'Business', items: [
      { name: 'Reports', path: '/reports' },
      { name: 'Performance', path: '/performance' },
      { name: 'Billing', path: '/billing' },
    ]},
    { section: 'Account', items: [
      { name: 'Profile', path: '/profile' },
    ]}
  ];

  return (
    <div style={layout}>

      {/* SIDEBAR */}
      <div style={sidebar}>
        <div>

          <h2 style={brand}>FieldSync</h2>

          {menu.map((group, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              
              <p style={sectionTitle}>{group.section}</p>

              {group.items.map(item => {
                const active = location.pathname === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                      ...nav,
                      background: active ? '#1f2937' : 'transparent',
                      color: active ? 'white' : '#9ca3af'
                    }}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          ))}

        </div>

        {/* BOTTOM */}
        <div>
          <button
            onClick={() => navigate('/billing')}
            style={upgradeBtn}
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={main}>

        {/* TOP BAR */}
        <div style={topbar}>
          <div>
            <p style={welcome}>Welcome back</p>
          </div>

          <div style={topRight}>
            <div style={badge}>PRO</div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={content}>
          {children}
        </div>

      </div>
    </div>
  );
}

/* STYLES */

const layout = {
  display: 'flex',
  minHeight: '100vh',
  background: '#0b0f14',
  color: 'white',
  fontFamily: 'system-ui'
};

const sidebar = {
  width: 250,
  background: '#0f172a',
  borderRight: '1px solid #1f2937',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const brand = {
  marginBottom: 30,
  fontSize: 18,
  fontWeight: 600
};

const sectionTitle = {
  fontSize: 11,
  color: '#6b7280',
  marginBottom: 6,
  textTransform: 'uppercase'
};

const nav = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  marginBottom: 4,
  fontSize: 14
};

const upgradeBtn = {
  width: '100%',
  padding: 10,
  borderRadius: 8,
  background: '#6366f1',
  border: 'none',
  color: 'white',
  cursor: 'pointer'
};

const main = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column'
};

const topbar = {
  height: 60,
  borderBottom: '1px solid #1f2937',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 30px'
};

const welcome = {
  color: '#9ca3af',
  fontSize: 14
};

const topRight = {
  display: 'flex',
  alignItems: 'center',
  gap: 10
};

const badge = {
  background: '#111827',
  padding: '6px 12px',
  borderRadius: 6,
  fontSize: 12
};

const content = {
  padding: 30,
  flex: 1
};

export default Layout;