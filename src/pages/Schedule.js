// src/pages/Schedule.jsx
// MASTER FINAL VERSION
// FULL FILE - COPY / PASTE READY

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
  PoundSterling,
  Clock3,
  Plus,
  Trash2,
  RefreshCw,
  MapPin,
} from "lucide-react";

export default function Schedule() {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [loading, setLoading] = useState(true);

  const [view, setView] = useState("month"); // month / week / agenda

  const [currentDate, setCurrentDate] = useState(new Date());

  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    user_ids: [],
    location_id: "",
    start: "08:00",
    end: "16:00",
    from: moment().format("YYYY-MM-DD"),
    to: moment().format("YYYY-MM-DD"),
    open_shift: false,
    overtime: false,
    days: [1, 2, 3, 4, 5],
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const [u, s, h, l] = await Promise.all([
        userAPI.getAll(),
        scheduleAPI.getAll(),
        holidayAPI.getAll(),
        locationAPI?.getAll?.() || [],
      ]);

      setUsers(Array.isArray(u) ? u : []);
      setSchedules(Array.isArray(s) ? s : []);
      setHolidays(Array.isArray(h) ? h : []);
      setLocations(Array.isArray(l) ? l : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const monthStart = moment(currentDate).startOf("month");
  const monthEnd = moment(currentDate).endOf("month");

  const monthSchedules = schedules.filter((x) =>
    moment(x.date).isBetween(monthStart, monthEnd, "day", "[]")
  );

  const monthHours = monthSchedules.reduce((sum, row) => {
    const start = moment(row.start_time);
    const end = moment(row.end_time);
    return sum + moment.duration(end.diff(start)).asHours();
  }, 0);

  const monthWages = monthSchedules.reduce((sum, row) => {
    const user = users.find((u) => u.id === row.user_id);
    if (!user) return sum;

    const hrs = moment
      .duration(
        moment(row.end_time).diff(moment(row.start_time))
      )
      .asHours();

    if (!row.user_id) return sum;

    return sum + hrs * Number(user.hourly_rate || 0);
  }, 0);

  function getUserName(id) {
    return users.find((u) => u.id === id)?.name || "Unassigned";
  }

  function getLocationName(id) {
    return (
      locations.find((x) => x.id === id)?.name ||
      "No Location"
    );
  }

  function isHoliday(userId, date) {
    return holidays.some(
      (h) =>
        h.status === "approved" &&
        h.user_id === userId &&
        moment(date).isBetween(
          h.start_date,
          h.end_date,
          "day",
          "[]"
        )
    );
  }

  async function createBulkShifts() {
    const start = moment(form.from);
    const end = moment(form.to);

    if (!form.location_id) {
      alert("Select location");
      return;
    }

    while (start <= end) {
      const weekday = start.day();

      if (form.days.includes(weekday)) {
        for (const uid of form.user_ids) {
          if (isHoliday(uid, start)) continue;

          await scheduleAPI.create({
            user_id: uid,
            location_id: form.location_id,
            date: start.format("YYYY-MM-DD"),
            start_time: `${start.format(
              "YYYY-MM-DD"
            )}T${form.start}`,
            end_time: `${start.format(
              "YYYY-MM-DD"
            )}T${form.end}`,
            open_shift: false,
            overtime: form.overtime,
          });
        }

        if (form.open_shift) {
          await scheduleAPI.create({
            user_id: null,
            location_id: form.location_id,
            date: start.format("YYYY-MM-DD"),
            start_time: `${start.format(
              "YYYY-MM-DD"
            )}T${form.start}`,
            end_time: `${start.format(
              "YYYY-MM-DD"
            )}T${form.end}`,
            open_shift: true,
            overtime: false,
          });
        }
      }

      start.add(1, "day");
    }

    setShowAdd(false);
    load();
  }

  async function deleteShift(id) {
    if (!window.confirm("Delete shift?")) return;
    await scheduleAPI.delete(id);
    load();
  }

  function next() {
    const d = new Date(currentDate);

    if (view === "month") d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);

    setCurrentDate(d);
  }

  function back() {
    const d = new Date(currentDate);

    if (view === "month") d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);

    setCurrentDate(d);
  }

  const weekDays = [...Array(7)].map((_, i) =>
    moment(currentDate).startOf("week").add(i, "day")
  );

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading schedule...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* KPI */}
      <div className="grid md:grid-cols-3 gap-4">

        <Stat
          title="Month Shifts"
          value={monthSchedules.length}
          icon={<CalendarDays size={16} />}
        />

        <Stat
          title="Month Hours"
          value={monthHours.toFixed(1)}
          icon={<Clock3 size={16} />}
        />

        <Stat
          title="Month Wages"
          value={`£${monthWages.toFixed(2)}`}
          icon={<PoundSterling size={16} />}
        />

      </div>

      {/* TOP BAR */}
      <div className="rounded-2xl border border-white/10 bg-[#020617] p-4 flex flex-wrap justify-between gap-3">

        <div className="flex gap-2">
          <button
            onClick={() =>
              setCurrentDate(new Date())
            }
            className="btn"
          >
            Today
          </button>

          <button
            onClick={back}
            className="btn"
          >
            Back
          </button>

          <button
            onClick={next}
            className="btn"
          >
            Next
          </button>
        </div>

        <div className="font-semibold text-lg">
          {view === "month"
            ? moment(currentDate).format(
                "MMMM YYYY"
              )
            : `${weekDays[0].format(
                "MMM D"
              )} - ${weekDays[6].format(
                "MMM D"
              )}`}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView("month")}
            className={
              view === "month"
                ? "btnActive"
                : "btn"
            }
          >
            Month
          </button>

          <button
            onClick={() => setView("week")}
            className={
              view === "week"
                ? "btnActive"
                : "btn"
            }
          >
            Week
          </button>

          <button
            onClick={() => setView("agenda")}
            className={
              view === "agenda"
                ? "btnActive"
                : "btn"
            }
          >
            Agenda
          </button>

          <button
            onClick={() =>
              setShowAdd(true)
            }
            className="btnGreen"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* MONTH */}
      {view === "month" && (
        <MonthView
          currentDate={currentDate}
          schedules={schedules}
          holidays={holidays}
          users={users}
          locations={locations}
          deleteShift={deleteShift}
        />
      )}

      {/* WEEK LIST VIEW */}
      {view === "week" && (
        <div className="grid md:grid-cols-7 gap-3">

          {weekDays.map((day) => {
            const date = day.format(
              "YYYY-MM-DD"
            );

            const dayShifts =
              schedules.filter(
                (x) => x.date === date
              );

            const dayHoliday =
              holidays.filter(
                (x) =>
                  x.status ===
                    "approved" &&
                  moment(date).isBetween(
                    x.start_date,
                    x.end_date,
                    "day",
                    "[]"
                  )
              );

            return (
              <div
                key={date}
                className="rounded-2xl border border-white/10 bg-[#020617] p-3"
              >
                <div className="font-semibold mb-3">
                  {day.format(
                    "ddd DD"
                  )}
                </div>

                <div className="space-y-2">

                  {dayShifts.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl bg-indigo-600/20 p-2 text-xs"
                    >
                      {s.open_shift
                        ? "OPEN SHIFT"
                        : getUserName(
                            s.user_id
                          )}{" "}
                      <br />
                      {moment(
                        s.start_time
                      ).format(
                        "HH:mm"
                      )}{" "}
                      -{" "}
                      {moment(
                        s.end_time
                      ).format(
                        "HH:mm"
                      )}
                    </div>
                  ))}

                  {dayHoliday.map(
                    (h) => (
                      <div
                        key={
                          h.id
                        }
                        className="rounded-xl bg-green-600/20 p-2 text-xs"
                      >
                        Holiday
                        <br />
                        {h.name ||
                          getUserName(
                            h.user_id
                          )}
                      </div>
                    )
                  )}

                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* AGENDA */}
      {view === "agenda" && (
        <div className="space-y-2">
          {monthSchedules.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-white/10 bg-[#020617] p-4 flex justify-between"
            >
              <div>
                <div className="font-medium">
                  {s.open_shift
                    ? "OPEN SHIFT"
                    : getUserName(
                        s.user_id
                      )}
                </div>

                <div className="text-sm text-gray-400">
                  {moment(
                    s.date
                  ).format(
                    "ddd DD MMM"
                  )}{" "}
                  •{" "}
                  {moment(
                    s.start_time
                  ).format(
                    "HH:mm"
                  )}{" "}
                  -{" "}
                  {moment(
                    s.end_time
                  ).format(
                    "HH:mm"
                  )}
                </div>

                <div className="text-xs text-indigo-300 mt-1">
                  <MapPin
                    size={12}
                    className="inline mr-1"
                  />
                  {getLocationName(
                    s.location_id
                  )}
                </div>
              </div>

              <button
                onClick={() =>
                  deleteShift(s.id)
                }
                className="text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-[#020617] border border-white/10 p-6 space-y-4">

            <h2 className="text-xl font-semibold">
              Bulk Schedule Builder
            </h2>

            <div className="grid md:grid-cols-2 gap-3">

              <input
                type="date"
                value={form.from}
                onChange={(e) =>
                  setForm({
                    ...form,
                    from:
                      e.target.value,
                  })
                }
                className="input"
              />

              <input
                type="date"
                value={form.to}
                onChange={(e) =>
                  setForm({
                    ...form,
                    to:
                      e.target.value,
                  })
                }
                className="input"
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
                className="input"
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
                className="input"
              />

              <select
                value={
                  form.location_id
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    location_id:
                      e.target.value,
                  })
                }
                className="input"
              >
                <option value="">
                  Select Location
                </option>

                {locations.map(
                  (l) => (
                    <option
                      key={
                        l.id
                      }
                      value={
                        l.id
                      }
                    >
                      {l.name}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* DAYS */}
            <div className="flex flex-wrap gap-2">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((d, i) => (
                <label
                  key={d}
                  className="text-sm rounded-xl bg-[#0f172a] px-3 py-2 flex gap-2"
                >
                  <input
                    type="checkbox"
                    checked={form.days.includes(
                      i
                    )}
                    onChange={() => {
                      if (
                        form.days.includes(
                          i
                        )
                      ) {
                        setForm({
                          ...form,
                          days:
                            form.days.filter(
                              (
                                x
                              ) =>
                                x !==
                                i
                            ),
                        });
                      } else {
                        setForm({
                          ...form,
                          days: [
                            ...form.days,
                            i,
                          ],
                        });
                      }
                    }}
                  />
                  {d}
                </label>
              ))}
            </div>

            {/* USERS */}
            <div className="grid md:grid-cols-3 gap-2 max-h-48 overflow-auto">

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
                              (
                                x
                              ) =>
                                x !==
                                u.id
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

            <div className="flex gap-4">

              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={
                    form.open_shift
                  }
                  onChange={() =>
                    setForm({
                      ...form,
                      open_shift:
                        !form.open_shift,
                    })
                  }
                />
                Add Open Shift
              </label>

              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={
                    form.overtime
                  }
                  onChange={() =>
                    setForm({
                      ...form,
                      overtime:
                        !form.overtime,
                    })
                  }
                />
                Overtime
              </label>

            </div>

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={
                  createBulkShifts
                }
                className="btnGreen"
              >
                Save Shifts
              </button>

              <button
                onClick={() =>
                  setShowAdd(
                    false
                  )
                }
                className="btn"
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

/* MONTH VIEW */
function MonthView({
  currentDate,
  schedules,
  holidays,
  users,
  locations,
  deleteShift,
}) {
  const start = moment(currentDate).startOf(
    "month"
  );
  const end = moment(currentDate).endOf(
    "month"
  );

  const first =
    start.clone().startOf("week");

  const last =
    end.clone().endOf("week");

  const days = [];
  const day = first.clone();

  while (
    day <= last
  ) {
    days.push(day.clone());
    day.add(1, "day");
  }

  function getName(id) {
    return (
      users.find(
        (u) => u.id === id
      )?.name ||
      "Open"
    );
  }

  return (
    <div className="grid md:grid-cols-7 gap-3">

      {days.map((d) => {
        const ds =
          d.format(
            "YYYY-MM-DD"
          );

        const rows =
          schedules.filter(
            (x) =>
              x.date === ds
          );

        const leave =
          holidays.filter(
            (h) =>
              h.status ===
                "approved" &&
              moment(
                ds
              ).isBetween(
                h.start_date,
                h.end_date,
                "day",
                "[]"
              )
          );

        return (
          <div
            key={ds}
            className="rounded-2xl border border-white/10 bg-[#020617] p-3 min-h-[180px]"
          >
            <div className="font-semibold mb-2">
              {d.format(
                "DD ddd"
              )}
            </div>

            <div className="space-y-1">

              {rows.map(
                (s) => (
                  <div
                    key={
                      s.id
                    }
                    className="rounded-lg bg-indigo-600/20 p-2 text-xs flex justify-between"
                  >
                    <div>
                      {s.open_shift
                        ? "OPEN"
                        : getName(
                            s.user_id
                          )}
                    </div>

                    <button
                      onClick={() =>
                        deleteShift(
                          s.id
                        )
                      }
                    >
                      <Trash2
                        size={
                          12
                        }
                      />
                    </button>
                  </div>
                )
              )}

              {leave.map(
                (h) => (
                  <div
                    key={
                      h.id
                    }
                    className="rounded-lg bg-green-600/20 p-2 text-xs"
                  >
                    HOLIDAY •{" "}
                    {h.name ||
                      getName(
                        h.user_id
                      )}
                  </div>
                )
              )}

            </div>
          </div>
        );
      })}

    </div>
  );
}

/* CARD */
function Stat({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] p-5">
      <div className="flex justify-between">
        <div className="text-sm text-gray-400">
          {title}
        </div>

        <div className="text-indigo-400">
          {icon}
        </div>
      </div>

      <div className="text-4xl font-semibold mt-4">
        {value}
      </div>
    </div>
  );
}