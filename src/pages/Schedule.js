// src/pages/Schedule.jsx
// FINAL FULL VERSION
// Added:
// ✅ add shift form
// ✅ upcoming only
// ✅ holidays shown
// ✅ names mapped
// ✅ delete shifts
// ✅ auto refresh
// ✅ click day panel
// ✅ month navigation

import { useEffect, useState } from "react";
import {
  userAPI,
  scheduleAPI,
  holidayAPI,
} from "../services/api";

import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  Plus,
  Plane,
  CalendarDays,
} from "lucide-react";

export default function Schedule() {
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] =
    useState([]);
  const [holidays, setHolidays] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedDay, setSelectedDay] =
    useState(null);

  const [form, setForm] = useState({
    user_id: "",
    date: "",
    start: "",
    end: "",
  });

  const today = new Date();

  const [month, setMonth] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )
  );

  useEffect(() => {
    load();

    const timer = setInterval(
      load,
      30000
    );

    return () =>
      clearInterval(timer);
  }, []);

  async function load() {
    try {
      setLoading(true);

      const [u, s, h] =
        await Promise.all([
          userAPI.getAll(),
          scheduleAPI.getAll(),
          holidayAPI.getAll(),
        ]);

      const safeUsers =
        Array.isArray(u) ? u : [];

      const safeSchedules =
        Array.isArray(s) ? s : [];

      const safeHoliday =
        Array.isArray(h) ? h : [];

      const todayStr =
        new Date()
          .toISOString()
          .split("T")[0];

      const mapped =
        safeSchedules
          .filter(
            (x) =>
              x.date >= todayStr
          )
          .map((row) => ({
            ...row,
            name:
              safeUsers.find(
                (u) =>
                  u.id ===
                  row.user_id
              )?.name ||
              "Unknown",
          }));

      const leaveMapped =
        safeHoliday.map(
          (row) => ({
            ...row,
            name:
              safeUsers.find(
                (u) =>
                  u.id ===
                  row.user_id
              )?.name ||
              "Unknown",
          })
        );

      setUsers(safeUsers);
      setSchedules(mapped);
      setHolidays(leaveMapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createShift() {
    if (
      !form.user_id ||
      !form.date ||
      !form.start ||
      !form.end
    ) {
      return alert(
        "Fill all fields"
      );
    }

    try {
      await scheduleAPI.create({
        user_id: form.user_id,
        date: form.date,
        start_time: `${form.date}T${form.start}:00`,
        end_time: `${form.date}T${form.end}:00`,
      });

      setForm({
        user_id: "",
        date: "",
        start: "",
        end: "",
      });

      load();
    } catch (err) {
      console.error(err);
      alert(
        "Failed to create shift"
      );
    }
  }

  async function removeShift(id) {
    if (
      !window.confirm(
        "Delete shift?"
      )
    )
      return;

    await scheduleAPI.delete(id);
    load();
  }

  function dateStr(day) {
    const y =
      day.getFullYear();

    const m = String(
      day.getMonth() + 1
    ).padStart(2, "0");

    const d = String(
      day.getDate()
    ).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  const monthEnd = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  );

  const days = [];

  for (
    let i = 1;
    i <= monthEnd.getDate();
    i++
  ) {
    days.push(
      new Date(
        month.getFullYear(),
        month.getMonth(),
        i
      )
    );
  }

  function shiftsForDay(day) {
    const ds = dateStr(day);

    return schedules.filter(
      (x) => x.date === ds
    );
  }

  function holidaysForDay(day) {
    const ds = dateStr(day);

    return holidays.filter(
      (x) =>
        x.status ===
          "approved" &&
        x.start_date <= ds &&
        x.end_date >= ds
    );
  }

  function nextMonth() {
    const d = new Date(month);
    d.setMonth(
      d.getMonth() + 1
    );
    setMonth(d);
    setSelectedDay(null);
  }

  function prevMonth() {
    const d = new Date(month);
    d.setMonth(
      d.getMonth() - 1
    );
    setMonth(d);
    setSelectedDay(null);
  }

  const selectedShifts =
    selectedDay
      ? shiftsForDay(
          selectedDay
        )
      : [];

  const selectedLeave =
    selectedDay
      ? holidaysForDay(
          selectedDay
        )
      : [];

  if (loading) {
    return (
      <div className="text-gray-400 flex items-center gap-2">
        <Loader2
          size={16}
          className="animate-spin"
        />
        Loading schedule...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Schedule
          </h1>

          <p className="text-sm text-gray-400">
            Manage rota
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-[#0f172a]"
          >
            <ChevronLeft
              size={18}
            />
          </button>

          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-[#0f172a]"
          >
            <ChevronRight
              size={18}
            />
          </button>
        </div>
      </div>

      {/* ADD SHIFT */}
      <div className="rounded-2xl border border-white/10 bg-[#020617] p-5 grid md:grid-cols-5 gap-3">
        <select
          value={form.user_id}
          onChange={(e) =>
            setForm({
              ...form,
              user_id:
                e.target.value,
            })
          }
          className="px-4 py-3 rounded-xl bg-[#0f172a]"
        >
          <option value="">
            Staff
          </option>

          {users.map((u) => (
            <option
              key={u.id}
              value={u.id}
            >
              {u.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({
              ...form,
              date:
                e.target.value,
            })
          }
          className="px-4 py-3 rounded-xl bg-[#0f172a]"
        />

        <input
          type="time"
          value={form.start}
          onChange={(e) =>
            setForm({
              ...form,
              start:
                e.target.value,
            })
          }
          className="px-4 py-3 rounded-xl bg-[#0f172a]"
        />

        <input
          type="time"
          value={form.end}
          onChange={(e) =>
            setForm({
              ...form,
              end:
                e.target.value,
            })
          }
          className="px-4 py-3 rounded-xl bg-[#0f172a]"
        />

        <button
          onClick={createShift}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* MONTH */}
      <div className="text-lg font-medium">
        {month.toLocaleString(
          "default",
          {
            month: "long",
          }
        )}{" "}
        {month.getFullYear()}
      </div>

      {/* CALENDAR */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const shifts =
            shiftsForDay(day);

          const leave =
            holidaysForDay(day);

          return (
            <button
              key={dateStr(day)}
              onClick={() =>
                setSelectedDay(
                  day
                )
              }
              className="rounded-xl border border-white/10 bg-[#020617] p-2 text-left min-h-[130px]"
            >
              <div className="text-xs text-gray-500 mb-2">
                {day.getDate()}
              </div>

              <div className="space-y-1 max-h-[90px] overflow-y-auto">
                {shifts.map(
                  (s) => (
                    <div
                      key={s.id}
                      className="text-xs px-2 py-1 rounded bg-indigo-500/20 text-indigo-300"
                    >
                      {s.name}
                    </div>
                  )
                )}

                {leave.map(
                  (h) => (
                    <div
                      key={
                        "h" +
                        h.id
                      }
                      className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300"
                    >
                      {h.name}
                    </div>
                  )
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* DAY VIEW */}
      {selectedDay && (
        <div className="rounded-2xl border border-white/10 bg-[#020617] p-6 space-y-5">
          <h2 className="font-semibold">
            {selectedDay.toLocaleDateString(
              "en-GB"
            )}
          </h2>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays
                size={16}
              />
              Working Staff
            </div>

            {selectedShifts.map(
              (s) => (
                <div
                  key={s.id}
                  className="rounded-xl bg-[#0f172a] p-3 flex justify-between items-center mb-2"
                >
                  <div>
                    <p>
                      {s.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      {s.start_time?.slice(
                        11,
                        16
                      )}{" "}
                      -
                      {" "}
                      {s.end_time?.slice(
                        11,
                        16
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      removeShift(
                        s.id
                      )
                    }
                    className="text-red-400"
                  >
                    <Trash2
                      size={
                        16
                      }
                    />
                  </button>
                </div>
              )
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Plane size={16} />
              On Holiday
            </div>

            {selectedLeave.map(
              (h) => (
                <div
                  key={h.id}
                  className="rounded-xl bg-green-500/10 text-green-300 p-3 mb-2"
                >
                  {h.name}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}