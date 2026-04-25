// src/pages/Schedule.jsx
import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import {
  scheduleAPI,
  holidayAPI,
  userAPI,
  locationAPI,
} from "../services/api";

import {
  CalendarDays,
  Users,
  Clock3,
  PoundSterling,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
} from "lucide-react";

const inputStyle =
  "w-full px-4 py-3 rounded-xl bg-[#111827] text-white border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none";

export default function Schedule() {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    from: "",
    to: "",
    start: "09:00",
    end: "17:00",
    location_id: "",
    allow_overtime: false,
    days: [1, 2, 3, 4, 5],
    user_ids: [],
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [u, l, s, h] = await Promise.all([
        userAPI.getAll(),
        locationAPI.getAll(),
        scheduleAPI.getAll(),
        holidayAPI.getAll(),
      ]);

      setUsers(Array.isArray(u) ? u : []);
      setLocations(Array.isArray(l) ? l : []);
      setShifts(Array.isArray(s) ? s : []);
      setHolidays(Array.isArray(h) ? h : []);
    } catch (err) {
      console.error(err);
    }
  }

  function getUser(id) {
    return users.find((x) => x.id === id) || {};
  }

  function getLocation(id) {
    return locations.find((x) => x.id === id) || {};
  }

  function prev() {
    setDate(
      moment(date)
        .subtract(view === "month" ? 1 : 7, view === "month" ? "month" : "days")
        .toDate()
    );
  }

  function next() {
    setDate(
      moment(date)
        .add(view === "month" ? 1 : 7, view === "month" ? "month" : "days")
        .toDate()
    );
  }

  function isHoliday(userId, ds) {
    return holidays.some(
      (h) =>
        h.user_id === userId &&
        h.status === "approved" &&
        ds >= h.start_date &&
        ds <= h.end_date
    );
  }

  async function deleteShift(id) {
  await scheduleAPI.delete(id);
  load();
}

  async function createBulk() {
    if (
      !form.from ||
      !form.to ||
      !form.start ||
      !form.end ||
      !form.user_ids.length
    ) {
      return alert("Fill all fields");
    }

    let d = moment(form.from);
    const end = moment(form.to);

    while (d.isSameOrBefore(end, "day")) {
      const weekday = d.day();

      if (form.days.includes(weekday)) {
        const ds = d.format("YYYY-MM-DD");

        for (const uid of form.user_ids) {
          if (isHoliday(uid, ds)) continue;

          await scheduleAPI.create({
            user_id: uid,
            date: ds,
            location_id: form.location_id || null,
            start_time: `${ds}T${form.start}:00`,
            end_time: `${ds}T${form.end}:00`,
            allow_overtime: form.allow_overtime,
          });
        }
      }

      d.add(1, "day");
    }

    setShowAdd(false);
    load();
  }

  const monthStart = moment(date).startOf("month");
  const monthEnd = moment(date).endOf("month");

  const monthShifts = useMemo(() => {
    return shifts.filter((s) =>
      moment(s.date).isBetween(monthStart, monthEnd, null, "[]")
    );
  }, [shifts, date]);

  const monthHours = monthShifts.reduce((sum, s) => {
    return (
      sum +
      (new Date(s.end_time) - new Date(s.start_time)) / 3600000
    );
  }, 0);

  const monthWages = monthShifts.reduce((sum, s) => {
    const hrs =
      (new Date(s.end_time) - new Date(s.start_time)) / 3600000;

    const rate = Number(getUser(s.user_id).hourly_rate || 0);

    return sum + hrs * rate;
  }, 0);

  return (
    <div className="space-y-6">

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">
        <Stat title="Month Shifts" value={monthShifts.length} icon={<CalendarDays size={16} />} />
        <Stat title="Month Hours" value={monthHours.toFixed(1)} icon={<Clock3 size={16} />} />
        <Stat title="Month Wages" value={`£${monthWages.toFixed(2)}`} icon={<PoundSterling size={16} />} />
        <Stat title="Staff" value={users.length} icon={<Users size={16} />} />
      </div>

      {/* TOP BAR */}
      <div className="rounded-2xl border border-white/10 bg-[#020617] p-5 flex flex-wrap items-center justify-between gap-4">

        <div className="flex gap-2">
          <button
            onClick={() => setDate(new Date())}
            className="px-4 py-2 rounded-xl bg-[#111827] border border-white/10"
          >
            Today
          </button>

          <button
            onClick={prev}
            className="px-4 py-2 rounded-xl bg-[#111827] border border-white/10"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={next}
            className="px-4 py-2 rounded-xl bg-[#111827] border border-white/10"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="text-lg font-semibold">
          {view === "month"
            ? moment(date).format("MMMM YYYY")
            : `${moment(date).startOf("week").format("DD MMM")} - ${moment(date)
                .endOf("week")
                .format("DD MMM")}`}
        </div>

        <div className="flex gap-2">

          <button
            onClick={() => setView("month")}
            className={`px-4 py-2 rounded-xl ${
              view === "month" ? "bg-indigo-600" : "bg-[#111827]"
            }`}
          >
            Month
          </button>

          <button
            onClick={() => setView("week")}
            className={`px-4 py-2 rounded-xl ${
              view === "week" ? "bg-indigo-600" : "bg-[#111827]"
            }`}
          >
            Week
          </button>

          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-xl ${
              editMode ? "bg-red-600" : "bg-[#111827]"
            }`}
          >
            {editMode ? "Done" : "Edit"}
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-2 rounded-xl bg-emerald-600"
          >
            <Plus size={16} className="inline mr-2" />
            Add
          </button>

        </div>
      </div>

      {/* MONTH */}
      {view === "month" && (
        <MonthView
          date={date}
          shifts={shifts}
          holidays={holidays}
          getUser={getUser}
          getLocation={getLocation}
          deleteShift={deleteShift}
          editMode={editMode}
        />
      )}

      {/* WEEK */}
      {view === "week" && (
        <WeekView
          date={date}
          shifts={shifts}
          holidays={holidays}
          getUser={getUser}
          getLocation={getLocation}
          deleteShift={deleteShift}
          editMode={editMode}
        />
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl rounded-3xl bg-[#020617] border border-white/10 p-8 space-y-6 max-h-[95vh] overflow-auto">

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                Bulk Add Shifts
              </h2>

              <button
                onClick={() => setShowAdd(false)}
                className="p-2 rounded-xl bg-[#111827]"
              >
                <X size={18} />
              </button>
            </div>

            {/* FULL FORM KEPT */}
            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <p className="text-sm text-gray-400 mb-2">From</p>
                <input
                  type="date"
                  className={inputStyle}
                  value={form.from}
                  onChange={(e) =>
                    setForm({ ...form, from: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">To</p>
                <input
                  type="date"
                  className={inputStyle}
                  value={form.to}
                  onChange={(e) =>
                    setForm({ ...form, to: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Start Time</p>
                <input
                  type="time"
                  className={inputStyle}
                  value={form.start}
                  onChange={(e) =>
                    setForm({ ...form, start: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">End Time</p>
                <input
                  type="time"
                  className={inputStyle}
                  value={form.end}
                  onChange={(e) =>
                    setForm({ ...form, end: e.target.value })
                  }
                />
              </div>

            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={createBulk}
                className="py-3 rounded-xl bg-emerald-600 font-medium"
              >
                Save Shifts
              </button>

              <button
                onClick={() => setShowAdd(false)}
                className="py-3 rounded-xl bg-[#111827]"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function MonthView({
  date,
  shifts,
  holidays,
  getUser,
  getLocation,
  deleteShift,
  editMode,
}) {
  const start = moment(date).startOf("month").startOf("week");
  const end = moment(date).endOf("month").endOf("week");

  const days = [];
  let d = start.clone();

  while (d.isSameOrBefore(end, "day")) {
    days.push(d.clone());
    d.add(1, "day");
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] overflow-hidden">

      <div className="grid grid-cols-7 bg-white/5">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((x) => (
          <div key={x} className="p-3 text-center font-semibold">
            {x}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const ds = day.format("YYYY-MM-DD");

          const dayShifts = shifts.filter((x) => x.date === ds);

          const dayHol = holidays.filter(
            (h) =>
              h.status === "approved" &&
              ds >= h.start_date &&
              ds <= h.end_date
          );

          return (
            <div
              key={ds}
              className="min-h-[160px] border border-white/5 p-2 space-y-1"
            >
              <div className="text-sm text-gray-400">
                {day.format("DD")}
              </div>

              {dayHol.map((h) => (
                <div
                  key={h.id}
                  className="rounded-lg bg-green-600 px-2 py-1 text-xs"
                >
                  {h.name || getUser(h.user_id).name} HOLIDAY
                </div>
              ))}

              {dayShifts.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="relative rounded-lg bg-indigo-600 px-2 py-1 text-xs"
                >
                  {editMode && (
                    <button
                      onClick={() => deleteShift(s.id)}
                      className="absolute top-1 right-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}

                  {getUser(s.user_id).name} •{" "}
                  {getLocation(s.location_id).name ||
                    "No Location"}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  date,
  shifts,
  holidays,
  getUser,
  getLocation,
  deleteShift,
  editMode,
}) {
  const start = moment(date).startOf("week");

  const days = Array.from({ length: 7 }).map((_, i) =>
    start.clone().add(i, "days")
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] overflow-hidden">

      <div className="grid grid-cols-7 bg-white/5">
        {days.map((d) => (
          <div
            key={d.format()}
            className="p-3 text-center font-semibold"
          >
            {d.format("ddd DD")}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const ds = day.format("YYYY-MM-DD");

          const dayShifts = shifts.filter((x) => x.date === ds);

          const dayHol = holidays.filter(
            (h) =>
              h.status === "approved" &&
              ds >= h.start_date &&
              ds <= h.end_date
          );

          return (
            <div
              key={ds}
              className="min-h-[500px] border-r border-white/10 p-3 space-y-2"
            >
              {dayHol.map((h) => (
                <div
                  key={h.id}
                  className="rounded-xl bg-green-600 px-3 py-2 text-sm"
                >
                  Holiday - {h.name || getUser(h.user_id).name}
                </div>
              ))}

              {dayShifts.map((s) => (
                <div
                  key={s.id}
                  className="relative rounded-xl bg-indigo-600 px-3 py-2 text-sm"
                >
                  {editMode && (
                    <button
                      onClick={() => deleteShift(s.id)}
                      className="absolute top-2 right-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  {getUser(s.user_id).name}
                  <br />
                  {moment(s.start_time).format("HH:mm")} -{" "}
                  {moment(s.end_time).format("HH:mm")}
                  <br />
                  {getLocation(s.location_id).name ||
                    "No Location"}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] p-5">
      <div className="flex justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <div className="text-indigo-400">{icon}</div>
      </div>

      <h2 className="text-3xl font-semibold mt-3">
        {value}
      </h2>
    </div>
  );
}