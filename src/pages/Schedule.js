import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { userAPI, scheduleAPI } from '../services/api';

function Schedule() {
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [selectedUser, setSelectedUser] = useState('');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, schedRes] = await Promise.all([
        userAPI.getAll(),
        scheduleAPI.getAll()
      ]);

      setUsers(usersRes.data || []);
      setSchedules(schedRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createSchedule = async () => {
    if (!selectedUser || !date || !start || !end) {
      return alert('Fill all fields');
    }

    try {
      await scheduleAPI.create({
        user_id: selectedUser,
        date,
        start_time: `${date}T${start}`,
        end_time: `${date}T${end}`
      });

      setSelectedUser('');
      setDate('');
      setStart('');
      setEnd('');

      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to create schedule');
    }
  };

  const deleteSchedule = async (id) => {
    try {
      await scheduleAPI.delete(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div style={container}>

        {/* HEADER */}
        <div style={header}>
          <div>
            <h1 style={title}>Schedule Manager</h1>
            <p style={subtitle}>Plan and manage team shifts</p>
          </div>
        </div>

        {/* CREATE SHIFT */}
        <div style={card}>
          <h3 style={cardTitle}>Assign Shift</h3>

          <div style={formGrid}>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              style={input}
            >
              <option value="">Select Employee</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={input}
            />

            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              style={input}
            />

            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              style={input}
            />

            <button onClick={createSchedule} style={primaryBtn}>
              Create Shift
            </button>
          </div>
        </div>

        {/* SCHEDULE LIST */}
        <div style={{ marginTop: 30 }}>
          <h3 style={cardTitle}>Upcoming Shifts</h3>

          {schedules.length === 0 && (
            <p style={muted}>No schedules yet</p>
          )}

          <div style={grid}>
            {schedules.map(s => (
              <div key={s.id} style={shiftCard}>
                <div>
                  <strong>{s.name}</strong>
                  <p style={muted}>
                    {formatDate(s.date)}
                  </p>
                  <p style={time}>
                    {formatTime(s.start_time)} → {formatTime(s.end_time)}
                  </p>
                </div>

                <button
                  onClick={() => deleteSchedule(s.id)}
                  style={deleteBtn}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}

/* HELPERS */

function formatDate(d) {
  return new Date(d).toLocaleDateString();
}

function formatTime(t) {
  return new Date(t).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/* STYLES */

const container = {
  padding: 30,
  color: 'white'
};

const header = {
  marginBottom: 20
};

const title = { margin: 0 };
const subtitle = { color: '#6b7280', marginTop: 5 };

const card = {
  background: '#111827',
  padding: 20,
  borderRadius: 12,
  border: '1px solid #1f2937'
};

const cardTitle = {
  marginBottom: 15
};

const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 10
};

const input = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #1f2937',
  background: '#0b0f14',
  color: 'white'
};

const primaryBtn = {
  padding: 10,
  background: '#6366f1',
  border: 'none',
  borderRadius: 8,
  color: 'white',
  cursor: 'pointer'
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: 15
};

const shiftCard = {
  background: '#111827',
  padding: 15,
  borderRadius: 12,
  border: '1px solid #1f2937',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const deleteBtn = {
  background: '#ef4444',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 6,
  color: 'white',
  cursor: 'pointer'
};

const muted = {
  color: '#6b7280',
  fontSize: 14
};

const time = {
  fontSize: 14,
  marginTop: 5
};

export default Schedule;