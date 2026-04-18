// src/pages/ScheduleCalendar.jsx
// COMPLETE FINAL UPGRADE
// COPY / PASTE READY
// ✅ Month + Week + Day + Agenda views
// ✅ Holidays + Shifts shown together
// ✅ Different colours
// ✅ Names on every item
// ✅ Monthly wages auto changes by selected month
// ✅ Monthly holiday totals auto changes by selected month
// ✅ Weekly clearer company rota
// ✅ Drag / Resize shifts
// ✅ Prevent scheduling staff on holiday
// ✅ Double click delete shift
// ✅ Create shift modal

import React, { useEffect, useState } from "react";
import {
  Calendar,
  momentLocalizer,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import moment from "moment";

import {
  scheduleAPI,
  holidayAPI,
  userAPI,
} from "../services/api";

import {
  CalendarDays,
  Users,
  Plus,
  Trash2,
  RefreshCw,
  PoundSterling,
  Plane,
} from "lucide-react";

const localizer =
  momentLocalizer(moment);

const DnDCalendar =
  withDragAndDrop(Calendar);

function ScheduleCalendar() {
  const [events, setEvents] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showCreate, setShowCreate] =
    useState(false);

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [form, setForm] = useState({
    user_id: "",
    start: "",
    end: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        schedRes,
        holidayRes,
        usersRes,
      ] = await Promise.all([
        scheduleAPI.getAll(),
        holidayAPI.getAll(),
        userAPI.getAll(),
      ]);

      const safeUsers =
        usersRes || [];

      const userMap = {};

      safeUsers.forEach((u) => {
        userMap[u.id] =
          u.name || u.email;
      });

      const shiftEvents =
        (schedRes || []).map(
          (s) => ({
            id: "shift-" + s.id,
            dbId: s.id,
            type: "shift",
            user_id: s.user_id,
            title: `SHIFT • ${
              userMap[s.user_id] ||
              "Employee"
            }`,
            start: new Date(
              s.start_time
            ),
            end: new Date(
              s.end_time
            ),
            hourly_rate: Number(
              safeUsers.find(
                (u) =>
                  u.id ===
                  s.user_id
              )?.hourly_rate || 0
            ),
          })
        );

      const holidayEvents =
        (holidayRes || [])
          .filter(
            (h) =>
              h.status ===
              "approved"
          )
          .map((h) => ({
            id: "holiday-" + h.id,
            dbId: h.id,
            type: "holiday",
            title: `HOLIDAY • ${
              userMap[h.user_id] ||
              h.name ||
              "Employee"
            }`,
            start: new Date(
              h.start_date
            ),
            end: moment(
              h.end_date
            )
              .add(1, "day")
              .toDate(),
            allDay: true,
          }));

      setUsers(safeUsers);
      setEvents([
        ...shiftEvents,
        ...holidayEvents,
      ]);
    } finally {
      setLoading(false);
    }
  }

  function inSelectedMonth(date) {
    return (
      date.getMonth() ===
        currentDate.getMonth() &&
      date.getFullYear() ===
        currentDate.getFullYear()
    );
  }

  const monthShifts =
    events.filter(
      (e) =>
        e.type === "shift" &&
        inSelectedMonth(e.start)
    );

  const monthHoliday =
    events.filter(
      (e) =>
        e.type === "holiday" &&
        inSelectedMonth(e.start)
    ).length;

  const monthlyWage =
    monthShifts.reduce(
      (sum, e) => {
        const hrs =
          (new Date(e.end) -
            new Date(e.start)) /
          3600000;

        return (
          sum +
          hrs *
            Number(
              e.hourly_rate || 0
            )
        );
      },
      0
    );

  function employeeOnHoliday(
    userId,
    start,
    end
  ) {
    return events.some(
      (e) =>
        e.type ===
          "holiday" &&
        e.title.includes(
          users.find(
            (u) =>
              u.id === userId
          )?.name || ""
        ) &&
        start < e.end &&
        end > e.start
    );
  }

  const handleSelectSlot = ({
    start,
    end,
  }) => {
    setForm({
      user_id: "",
      start: moment(start).format(
        "YYYY-MM-DDTHH:mm"
      ),
      end: moment(end).format(
        "YYYY-MM-DDTHH:mm"
      ),
    });

    setShowCreate(true);
  };

  async function createShift(e) {
    e.preventDefault();

    const start =
      new Date(form.start);
    const end =
      new Date(form.end);

    if (
      employeeOnHoliday(
        form.user_id,
        start,
        end
      )
    ) {
      return alert(
        "Employee is on holiday"
      );
    }

    await scheduleAPI.create({
      user_id: form.user_id,
      date: moment(
        form.start
      ).format("YYYY-MM-DD"),
      start_time:
        form.start,
      end_time: form.end,
    });

    setShowCreate(false);
    loadData();
  }

  async function handleEventDrop({
    event,
    start,
    end,
  }) {
    if (
      event.type !==
      "shift"
    )
      return;

    if (
      employeeOnHoliday(
        event.user_id,
        start,
        end
      )
    ) {
      return alert(
        "Cannot move onto holiday"
      );
    }

    await scheduleAPI.update(
      event.dbId,
      {
        start_time: start,
        end_time: end,
      }
    );

    loadData();
  }

  async function handleEventResize({
    event,
    start,
    end,
  }) {
    if (
      event.type !==
      "shift"
    )
      return;

    await scheduleAPI.update(
      event.dbId,
      {
        start_time: start,
        end_time: end,
      }
    );

    loadData();
  }

  async function deleteShift(
    event
  ) {
    if (
      event.type !==
      "shift"
    )
      return;

    if (
      !window.confirm(
        "Delete shift?"
      )
    )
      return;

    await scheduleAPI.delete(
      event.dbId
    );

    loadData();
  }

  function eventStyleGetter(
    event
  ) {
    if (
      event.type ===
      "holiday"
    ) {
      return {
        style: {
          backgroundColor:
            "#16a34a",
          border: "none",
          borderRadius:
            "8px",
          fontSize:
            "12px",
        },
      };
    }

    return {
      style: {
        backgroundColor:
          "#4f46e5",
        border: "none",
        borderRadius:
          "8px",
        fontSize:
          "12px",
      },
    };
  }

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">

        <div>
          <h1 className="text-3xl font-semibold">
            Schedule Calendar
          </h1>

          <p className="text-sm text-gray-400">
            Weekly rota + leave planner
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-white/5"
          >
            <RefreshCw
              size={16}
            />
          </button>

          <button
            onClick={() =>
              setShowCreate(
                true
              )
            }
            className="px-4 py-2 rounded-xl bg-indigo-600"
          >
            <Plus
              size={16}
            />
          </button>

        </div>

      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">

        <Card
          title="Staff"
          value={users.length}
          icon={
            <Users
              size={16}
            />
          }
        />

        <Card
          title="Month Shifts"
          value={
            monthShifts.length
          }
          icon={
            <CalendarDays
              size={16}
            />
          }
        />

        <Card
          title="Holiday Days"
          value={monthHoliday}
          icon={
            <Plane
              size={16}
            />
          }
        />

        <Card
          title="Monthly Wage"
          value={`£${monthlyWage.toFixed(
            2
          )}`}
          icon={
            <PoundSterling
              size={16}
            />
          }
        />

      </div>

      {/* CALENDAR */}
      <div className="rounded-2xl border border-white/10 bg-[#020617] p-4">

        <DnDCalendar
          localizer={
            localizer
          }
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          resizable
          popup
          defaultView="week"
          views={[
            "month",
            "week",
            "day",
            "agenda",
          ]}
          step={30}
          timeslots={2}
          style={{
            height:
              "78vh",
          }}
          date={
            currentDate
          }
          onNavigate={(
            date
          ) =>
            setCurrentDate(
              date
            )
          }
          onSelectSlot={
            handleSelectSlot
          }
          onEventDrop={
            handleEventDrop
          }
          onEventResize={
            handleEventResize
          }
          onDoubleClickEvent={
            deleteShift
          }
          eventPropGetter={
            eventStyleGetter
          }
        />

      </div>

      {/* MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">

          <div className="w-full max-w-md bg-[#020617] rounded-2xl p-6 border border-white/10">

            <h2 className="text-lg font-semibold mb-4">
              Create Shift
            </h2>

            <form
              onSubmit={
                createShift
              }
              className="space-y-4"
            >

              <select
                required
                value={
                  form.user_id
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    user_id:
                      e
                        .target
                        .value,
                  })
                }
                className="w-full bg-white/5 rounded-xl px-4 py-3"
              >
                <option value="">
                  Select Employee
                </option>

                {users.map(
                  (u) => (
                    <option
                      key={
                        u.id
                      }
                      value={
                        u.id
                      }
                    >
                      {u.name}
                    </option>
                  )
                )}
              </select>

              <input
                type="datetime-local"
                required
                value={
                  form.start
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    start:
                      e
                        .target
                        .value,
                  })
                }
                className="w-full bg-white/5 rounded-xl px-4 py-3"
              />

              <input
                type="datetime-local"
                required
                value={
                  form.end
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    end:
                      e
                        .target
                        .value,
                  })
                }
                className="w-full bg-white/5 rounded-xl px-4 py-3"
              />

              <button className="w-full py-3 rounded-xl bg-indigo-600">
                Save Shift
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
                className="w-full py-3 rounded-xl bg-white/5"
              >
                Cancel
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

function Card({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] p-4">
      <div className="flex justify-between">
        <p className="text-xs text-gray-400">
          {title}
        </p>

        <div className="text-indigo-400">
          {icon}
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-2">
        {value}
      </h2>
    </div>
  );
}

export default ScheduleCalendar;