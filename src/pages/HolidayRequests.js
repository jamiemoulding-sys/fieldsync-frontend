import React, { useEffect, useState } from 'react';
import { holidayAPI } from '../services/api';

function HolidayRequests() {
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState('table'); // table | calendar
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await holidayAPI.getAll();
      setRequests(res.data || []);
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

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <h1>Holiday Requests</h1>

        <div style={controls}>
          <button onClick={() => setView('table')} style={btn(view === 'table')}>Table</button>
          <button onClick={() => setView('calendar')} style={btn(view === 'calendar')}>Calendar</button>

          <select value={filter} onChange={e => setFilter(e.target.value)} style={select}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* TABLE VIEW */}
      {view === 'table' && (
        <div style={card}>
          <table style={table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{format(r.start_date)}</td>
                  <td>{format(r.end_date)}</td>
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
      )}

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div style={calendar}>
          {filtered.map(r => (
            <div key={r.id} style={calendarCard}>
              <strong>{r.name}</strong>
              <p>{format(r.start_date)} → {format(r.end_date)}</p>
              <span style={badge(r.status)}>{r.status}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

/* HELPERS */

const format = d => new Date(d).toLocaleDateString();

/* STYLES */

const container = { padding: 30, color: 'white', background: '#0b0f14', minHeight: '100vh' };

const header = { display: 'flex', justifyContent: 'space-between', marginBottom: 20 };

const controls = { display: 'flex', gap: 10 };

const btn = (active) => ({
  padding: '6px 12px',
  background: active ? '#1f2937' : '#111827',
  border: '1px solid #1f2937',
  color: 'white',
  borderRadius: 6,
  cursor: 'pointer'
});

const select = {
  background: '#111827',
  border: '1px solid #1f2937',
  color: 'white',
  borderRadius: 6,
  padding: 6
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

const calendar = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 15
};

const calendarCard = {
  background: '#111827',
  padding: 15,
  borderRadius: 10
};

export default HolidayRequests;