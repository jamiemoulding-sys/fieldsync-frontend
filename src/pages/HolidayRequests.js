import React, { useEffect, useState } from 'react';
import { holidayAPI } from '../services/api';

function HolidayRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await holidayAPI.getAll();
      setRequests(res || []); // ✅ FIXED
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    await holidayAPI.update(id, { status });
    load();
  };

  const filtered = requests.filter(r =>
    filter === 'all' ? true : r.status === filter
  );

  // 📅 CALENDAR
  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  const days = [];
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const getRequestsForDay = (day) => {
    return filtered.filter(r => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      return day >= start && day <= end;
    });
  };

  const changeMonth = (dir) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + dir);
    setCurrentMonth(newDate);
  };

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <div>
          <h1 style={title}>Holiday Management</h1>
          <p style={sub}>Company-wide time off overview</p>
        </div>

        <select value={filter} onChange={e => setFilter(e.target.value)} style={select}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* KPI */}
      <div style={kpiRow}>
        <KPI label="Total" value={requests.length} />
        <KPI label="Pending" value={requests.filter(r => r.status === 'pending').length} />
        <KPI label="Approved" value={requests.filter(r => r.status === 'approved').length} />
      </div>

      {/* CALENDAR NAV */}
      <div style={calendarNav}>
        <button onClick={() => changeMonth(-1)} style={navBtn}>←</button>

        <h3>
          {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
        </h3>

        <button onClick={() => changeMonth(1)} style={navBtn}>→</button>
      </div>

      {/* CALENDAR */}
      <div style={calendarGrid}>
        {days.map((day, i) => {
          const dayRequests = getRequestsForDay(day);

          return (
            <div key={i} style={dayCell}>
              <div style={dayHeader}>{day.getDate()}</div>

              {dayRequests.map(r => (
                <div key={r.id} style={event(r.status)}>
                  <div style={{ fontSize: 12 }}>{r.name}</div>

                  {r.status === 'pending' && (
                    <div style={{ marginTop: 4 }}>
                      <button onClick={() => updateStatus(r.id, 'approved')} style={miniApprove}>✓</button>
                      <button onClick={() => updateStatus(r.id, 'rejected')} style={miniReject}>✕</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* TABLE */}
      <div style={card}>
        <h3 style={{ marginBottom: 10 }}>All Requests</h3>

        <table style={table}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Dates</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{format(r.start_date)} → {format(r.end_date)}</td>
                <td><span style={badge(r.status)}>{r.status}</span></td>
                <td>
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(r.id, 'approved')} style={approve}>Approve</button>
                      <button onClick={() => updateStatus(r.id, 'rejected')} style={reject}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

/* COMPONENTS */

function KPI({ label, value }) {
  return (
    <div style={kpi}>
      <p style={{ color: '#6b7280' }}>{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

/* HELPERS */

const format = d => new Date(d).toLocaleDateString();

/* STYLES */

const container = {
  padding: 30,
  background: '#0b0f14',
  minHeight: '100vh',
  color: 'white'
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 20
};

const title = { margin: 0 };
const sub = { color: '#6b7280' };

const select = {
  background: '#111827',
  border: '1px solid #1f2937',
  color: 'white',
  borderRadius: 6,
  padding: 6
};

const kpiRow = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 15,
  marginBottom: 20
};

const kpi = {
  background: '#111827',
  padding: 15,
  borderRadius: 10,
  border: '1px solid #1f2937'
};

const calendarNav = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 15
};

const navBtn = {
  background: '#111827',
  border: '1px solid #1f2937',
  color: 'white',
  borderRadius: 6,
  padding: '4px 10px',
  cursor: 'pointer'
};

const calendarGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 10,
  marginBottom: 30
};

const dayCell = {
  background: '#111827',
  padding: 10,
  borderRadius: 10,
  minHeight: 100,
  border: '1px solid #1f2937'
};

const dayHeader = {
  fontSize: 12,
  color: '#6b7280',
  marginBottom: 5
};

const event = (status) => ({
  background:
    status === 'approved' ? '#065f46' :
    status === 'rejected' ? '#7f1d1d' :
    '#1f2937',
  padding: 6,
  borderRadius: 6,
  marginBottom: 5
});

const miniApprove = {
  background: '#10b981',
  border: 'none',
  padding: '2px 6px',
  marginRight: 4,
  borderRadius: 4,
  color: 'white',
  fontSize: 10
};

const miniReject = {
  background: '#ef4444',
  border: 'none',
  padding: '2px 6px',
  borderRadius: 4,
  color: 'white',
  fontSize: 10
};

const card = {
  background: '#111827',
  padding: 20,
  borderRadius: 10
};

const table = {
  width: '100%',
  borderCollapse: 'collapse'
};

const approve = {
  background: '#10b981',
  border: 'none',
  padding: 6,
  marginRight: 5,
  borderRadius: 6,
  color: 'white'
};

const reject = {
  background: '#ef4444',
  border: 'none',
  padding: 6,
  borderRadius: 6,
  color: 'white'
};

const badge = (status) => ({
  padding: '4px 10px',
  borderRadius: 20,
  background:
    status === 'approved' ? '#065f46' :
    status === 'rejected' ? '#7f1d1d' :
    '#1f2937'
});

export default HolidayRequests;