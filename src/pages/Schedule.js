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
} from "lucide-react";

export default function Schedule() {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    user_ids: [],
    location_id: "",
    from: "",
    to: "",
    start: "09:00",
    end: "17:00",
    allow_overtime: false,
    days: [1, 2, 3, 4, 5],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
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

  function back() {
    if (view === "month") {
      setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
    } else {
      setCurrentDate(moment(currentDate).subtract(7, "days").toDate());
    }
  }

  function next() {
    if (view === "month") {
      setCurrentDate(moment(currentDate).add(1, "month").toDate());
    } else {
      setCurrentDate(moment(currentDate).add(7, "days").toDate());
    }
  }

  function getUser(id) {
    return users.find((x) => x.id === id) || {};
  }

  function getLocation(id) {
    return locations.find((x) => x.id === id) || {};
  }

  function isHoliday(userId, date) {
    return holidays.some(
      (h) =>
        h.user_id === userId &&
        h.status === "approved" &&
        date >= h.start_date &&
        date <= h.end_date
    );
  }

  async function createBulkShifts() {
    if (
      !form.user_ids.length ||
      !form.from ||
      !form.to ||
      !form.start ||
      !form.end
    ) {
      return alert("Fill all fields");
    }

    let day = moment(form.from);
    const end = moment(form.to);

    while (day.isSameOrBefore(end, "day")) {
      const weekday = day.day();

      if (form.days.includes(weekday)) {
        for (const uid of form.user_ids) {
          const date = day.format("YYYY-MM-DD");

          if (isHoliday(uid, date)) continue;

          await scheduleAPI.create({
            user_id: uid,
            date,
            location_id: form.location_id || null,
            start_time: `${date}T${form.start}:00`,
            end_time: `${date}T${form.end}:00`,
            allow_overtime: form.allow_overtime,
          });
        }
      }

      day.add(1, "day");
    }

    setShowAdd(false);
    loadData();
  }

  async function deleteShift(id) {
    if (!window.confirm("Delete shift?")) return;
    await scheduleAPI.delete(id);
    loadData();
  }

  const monthStart = moment(currentDate).startOf("month");
  const monthEnd = moment(currentDate).endOf("month");

  const monthShifts = useMemo(() => {
    return shifts.filter((s) =>
      moment(s.date).isBetween(monthStart, monthEnd, null, "[]")
    );
  }, [shifts, currentDate]);

  const monthHours = monthShifts.reduce((sum, s) => {
    const hrs =
      (new Date(s.end_time) - new Date(s.start_time)) / 3600000;
    return sum + hrs;
  }, 0);

  const monthWages = monthShifts.reduce((sum, s) => {
    const hrs =
      (new Date(s.end_time) - new Date(s.start_time)) / 3600000;

    const user = getUser(s.user_id);
    const rate = Number(user.hourly_rate || 0);

    return sum + hrs * rate;
  }, 0);

  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    moment(currentDate).startOf("week").add(i, "days")
  );

  return (
    <div className="space-y-6">

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card
          title="Month Shifts"
          value={monthShifts.length}
          icon={<CalendarDays size={16} />}
        />

        <Card
          title="Month Hours"
          value={monthHours.toFixed(1)}
          icon={<Clock3 size={16} />}
        />

        <Card
          title="Month Wages"
          value={`£${monthWages.toFixed(2)}`}
          icon={<PoundSterling size={16} />}
        />

        <Card
          title="Staff"
          value={users.length}
          icon={<Users size={16} />}
        />
      </div>

      {/* TOP BAR */}
      <div className="rounded-2xl border border-white/10 bg-[#020617] px-5 py-4 flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-xl bg-[#0f172a] border border-white/10"
          >
            Today
          </button>

          <button
            onClick={back}
            className="px-4 py-2 rounded-xl bg-[#0f172a] border border-white/10"
          >
            Back
          </button>

          <button
            onClick={next}
            className="px-4 py-2 rounded-xl bg-[#0f172a] border border-white/10"
          >
            Next
          </button>
        </div>

        <div className="text-lg font-semibold">
          {view === "month"
            ? moment(currentDate).format("MMMM YYYY")
            : `${weekDays[0].format("DD MMM")} - ${weekDays[6].format("DD MMM")}`}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("month")}
            className={`px-4 py-2 rounded-xl ${
              view === "month"
                ? "bg-indigo-600"
                : "bg-[#0f172a]"
            }`}
          >
            Month
          </button>

          <button
            onClick={() => setView("week")}
            className={`px-4 py-2 rounded-xl ${
              view === "week"
                ? "bg-indigo-600"
                : "bg-[#0f172a]"
            }`}
          >
            Week
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
          currentDate={currentDate}
          shifts={shifts}
          holidays={holidays}
          users={users}
          locations={locations}
          onDelete={deleteShift}
        />
      )}

      {/* WEEK */}
      {view === "week" && (
        <div className="rounded-2xl border border-white/10 bg-[#020617] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-white/10">
            {weekDays.map((d) => (
              <div
                key={d.format()}
                className="p-4 font-semibold text-center border-r border-white/10"
              >
                {d.format("ddd DD")}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {weekDays.map((d) => {
              const ds = d.format("YYYY-MM-DD");

              const dayShifts = shifts.filter(
                (x) => x.date === ds
              );

              const dayHoliday = holidays.filter(
                (x) =>
                  x.status === "approved" &&
                  ds >= x.start_date &&
                  ds <= x.end_date
              );

              return (
                <div
                  key={ds}
                  className="min-h-[500px] p-3 border-r border-white/10 space-y-2"
                >
                  {dayHoliday.map((h) => (
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
                      className="rounded-xl bg-indigo-600 px-3 py-2 text-sm"
                    >
                      {getUser(s.user_id).name} <br />
                      {moment(s.start_time).format("HH:mm")} -{" "}
                      {moment(s.end_time).format("HH:mm")} <br />
                      {getLocation(s.location_id).name ||
                        "No Location"}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#020617] border border-white/10 p-6 space-y-4">

            <h2 className="text-xl font-semibold">
              Bulk Add Shifts
            </h2>

            <div className="grid md:grid-cols-2 gap-3">

              <input
                type="date"
                value={form.from}
                onChange={(e) =>
                  setForm({
                    ...form,
                    from: e.target.value,
                  })
                }
                className="inputStyle"
              />

              <input
                type="date"
                value={form.to}
                onChange={(e) =>
                  setForm({
                    ...form,
                    to: e.target.value,
                  })
                }
                className="inputStyle"
              />

              <input
                type="time"
                value={form.start}
                onChange={(e) =>
                  setForm({
                    ...form,
                    start: e.target.value,
                  })
                }
                className="inputStyle"
              />

              <input
                type="time"
                value={form.end}
                onChange={(e) =>
                  setForm({
                    ...form,
                    end: e.target.value,
                  })
                }
                className="inputStyle"
              />

              <select
                value={form.location_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location_id: e.target.value,
                  })
                }
                className="inputStyle"
              >
                <option value="">
                  Select Location
                </option>

                {locations.map((l) => (
                  <option
                    key={l.id}
                    value={l.id}
                  >
                    {l.name}
                  </option>
                ))}
              </select>

              <label className="rounded-xl bg-[#0f172a] px-4 py-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.allow_overtime}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      allow_overtime:
                        e.target.checked,
                    })
                  }
                />
                Allow Overtime
              </label>
            </div>

            {/* WEEKDAY TICKS */}
            <div className="grid grid-cols-7 gap-2">
              {[
                ["Sun", 0],
                ["Mon", 1],
                ["Tue", 2],
                ["Wed", 3],
                ["Thu", 4],
                ["Fri", 5],
                ["Sat", 6],
              ].map(([label, val]) => (
                <label
                  key={val}
                  className="rounded-xl bg-[#0f172a] px-3 py-2 text-center"
                >
                  <input
                    type="checkbox"
                    checked={form.days.includes(val)}
                    onChange={() => {
                      if (
                        form.days.includes(val)
                      ) {
                        setForm({
                          ...form,
                          days: form.days.filter(
                            (x) => x !== val
                          ),
                        });
                      } else {
                        setForm({
                          ...form,
                          days: [
                            ...form.days,
                            val,
                          ],
                        });
                      }
                    }}
                  />
                  <div>{label}</div>
                </label>
              ))}
            </div>

            {/* STAFF */}
            <div className="grid md:grid-cols-3 gap-2 max-h-60 overflow-auto">
              {users.map((u) => (
                <label
                  key={u.id}
                  className="rounded-xl bg-[#0f172a] px-3 py-2 flex gap-2"
                >
                  <input
                    type="checkbox"
                    checked={form.user_ids.includes(
                      u.id
                    )}
                    onChange={() => {
                      if (
                        form.user_ids.includes(
                          u.id
                        )
                      ) {
                        setForm({
                          ...form,
                          user_ids:
                            form.user_ids.filter(
                              (x) =>
                                x !== u.id
                            ),
                        });
                      } else {
                        setForm({
                          ...form,
                          user_ids: [
                            ...form.user_ids,
                            u.id,
                          ],
                        });
                      }
                    }}
                  />
                  {u.name}
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={createBulkShifts}
                className="py-3 rounded-xl bg-emerald-600"
              >
                Save
              </button>

              <button
                onClick={() =>
                  setShowAdd(false)
                }
                className="py-3 rounded-xl bg-[#0f172a]"
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
  currentDate,
  shifts,
  holidays,
  users,
  locations,
  onDelete,
}) {
  const start = moment(currentDate).startOf("month").startOf("week");
  const end = moment(currentDate).endOf("month").endOf("week");

  const days = [];
  let day = start.clone();

  while (day.isSameOrBefore(end, "day")) {
    days.push(day.clone());
    day.add(1, "day");
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] overflow-hidden">
      <div className="grid grid-cols-7 bg-white/5">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="p-3 text-center font-semibold">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((d) => {
          const ds = d.format("YYYY-MM-DD");

          const dayShifts = shifts.filter(
            (x) => x.date === ds
          );

          const dayHoliday = holidays.filter(
            (x) =>
              x.status === "approved" &&
              ds >= x.start_date &&
              ds <= x.end_date
          );

          return (
            <div
              key={ds}
              className="min-h-[160px] p-2 border border-white/5 space-y-1"
            >
              <div className="text-sm text-gray-400">
                {d.format("DD")}
              </div>

              {dayHoliday.map((h) => (
                <div
                  key={h.id}
                  className="rounded-lg bg-green-600 px-2 py-1 text-xs"
                >
                  {h.name || users.find((u) => u.id === h.user_id)?.name} HOLIDAY
                </div>
              ))}

              {dayShifts.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  onDoubleClick={() =>
                    onDelete(s.id)
                  }
                  className="w-full text-left rounded-lg bg-indigo-600 px-2 py-1 text-xs"
                >
                  {
                    users.find(
                      (u) =>
                        u.id === s.user_id
                    )?.name
                  }{" "}
                  •{" "}
                  {
                    locations.find(
                      (l) =>
                        l.id ===
                        s.location_id
                    )?.name ||
                    "No Location"
                  }
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] p-5">
      <div className="flex justify-between">
        <p className="text-sm text-gray-400">
          {title}
        </p>
        <div className="text-indigo-400">
          {icon}
        </div>
      </div>

      <h2 className="text-3xl font-semibold mt-3">
        {value}
      </h2>
    </div>
  );
}