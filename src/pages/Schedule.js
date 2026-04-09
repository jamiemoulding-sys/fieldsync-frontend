import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { userAPI, scheduleAPI } from '../services/api';

function Schedule() {
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [view, setView] = useState('grid'); // grid | calendar

  const [selectedUser, setSelectedUser] = useState('');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, schedRes] = await Promise.all([
        userAPI.getAll(),
        scheduleAPI.getAll()
      ]);

      setUsers(usersRes || []);       // ✅ FIXED
      setSchedules(schedRes || []);   // ✅ FIXED

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
    await scheduleAPI.delete(id);
    loadData();
  };

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

  const getShiftsForDay = (day) => {
    return schedules.filter(s =>
      new Date(s.date).toDateString() === day.toDateString()
    );
  };

  const changeMonth = (dir) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + dir);
    setCurrentMonth(newDate);
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

          <div style={controls}>
            <button onClick={() => setView('grid')} style={viewBtn(view === 'grid')}>Grid</button>
            <button onClick={() => setView('calendar')} style={viewBtn(view === 'calendar')}>Calendar</button>
          </div>
        </div>

        {/* CREATE */}
        <div style={card}>
          <h3 style={cardTitle}>Assign Shift</h3>

          <div style={formGrid}>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} style={input}>
              <option value="">Select Employee</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={input} />
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} style={input} />
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} style={input} />

            <button onClick={createSchedule} style={primaryBtn}>
              Create Shift
            </button>
          </div>
        </div>

        {/* GRID VIEW */}
        {view === 'grid' && (
          <div style={{ marginTop: 30 }}>
            <h3 style={cardTitle}>Upcoming Shifts</h3>

            <div style={grid}>
              {schedules.map(s => (
                <div key={s.id} style={shiftCard}>
                  <div>
                    <strong>{s.name}</strong>
                    <p style={muted}>{formatDate(s.date)}</p>
                    <p style={time}>
                      {formatTime(s.start_time)} → {formatTime(s.end_time)}
                    </p>
                  </div>

                  <button onClick={() => deleteSchedule(s.id)} style={deleteBtn}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CALENDAR VIEW */}
        {view === 'calendar' && (
          <>
            <div style={calendarNav}>
              <button onClick={() => changeMonth(-1)} style={navBtn}>←</button>
              <h3>
                {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
              </h3>
              <button onClick={() => changeMonth(1)} style={navBtn}>→</button>
            </div>

            <div style={calendarGrid}>
              {days.map((day, i) => (
                <div key={i} style={dayCell}>
                  <div style={dayHeader}>{day.getDate()}</div>

                  {getShiftsForDay(day).map(s => (
                    <div key={s.id} style={shiftEvent}>
                      {s.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </Layout>
  );
}

/* HELPERS */

const formatDate = d => new Date(d).toLocaleDateString();
const formatTime = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* STYLES */

const container = { padding: 30, color: 'white' };

const header = { display: 'flex', justifyContent: 'space-between', marginBottom: 20 };

const controls = { display: 'flex', gap: 10 };

const viewBtn = (active) => ({
  background: active ? '#1f2937' : '#111827',
  border: '1px solid #1f2937',
  color: 'white',
  padding: '6px 12px',
  borderRadius: 6
});

const card = {
  background: '#111827',
  padding: 20,
  borderRadius: 12,
  border: '1px solid #1f2937'
};

const cardTitle = { marginBottom: 15 };

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
  color: 'white'
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
  justifyContent: 'space-between'
};

const deleteBtn = {
  background: '#ef4444',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 6,
  color: 'white'
};

const calendarNav = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 20,
  marginBottom: 10
};

const navBtn = {
  background: '#111827',
  border: '1px solid #1f2937',
  padding: '4px 10px',
  color: 'white',
  borderRadius: 6
};

const calendarGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 10
};

const dayCell = {
  background: '#111827',
  padding: 10,
  borderRadius: 10,
  minHeight: 80
};

const dayHeader = { fontSize: 12, color: '#6b7280' };

const shiftEvent = {
  background: '#1f2937',
  padding: 4,
  borderRadius: 4,
  marginTop: 4,
  fontSize: 12
};

const muted = { color: '#6b7280' };
const time = { fontSize: 14 };

const title = { margin: 0 };
const subtitle = { color: '#6b7280' };

export default Schedule;