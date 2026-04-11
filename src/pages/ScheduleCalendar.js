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
  userAPI,
} from "../services/api";

import {
  CalendarDays,
  Users,
  Plus,
  Trash2,
  RefreshCw,
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

  const [form, setForm] = useState({
    user_id: "",
    start: "",
    end: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [schedRes, usersRes] =
        await Promise.all([
          scheduleAPI.getAll(),
          userAPI.getAll(),
        ]);

      const userMap = {};

      (usersRes || []).forEach((u) => {
        userMap[u.id] =
          u.name || u.email;
      });

      const formatted = (
        schedRes || []
      ).map((s) => ({
        id: s.id,
        user_id: s.user_id,
        title:
          userMap[s.user_id] ||
          "Employee",
        start: new Date(
          s.start_time
        ),
        end: new Date(
          s.end_time
        ),
      }));

      setEvents(formatted);
      setUsers(usersRes || []);

    } catch (err) {
      console.error(err);

    } finally {
      setLoading(false);
    }
  };

  /* CREATE FROM SLOT */
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

  /* SAVE CREATE */
  const createShift = async (
    e
  ) => {
    e.preventDefault();

    try {
      await scheduleAPI.create({
        user_id: form.user_id,
        date: moment(
          form.start
        ).format(
          "YYYY-MM-DD"
        ),
        start_time: form.start,
        end_time: form.end,
      });

      setShowCreate(false);
      loadData();

    } catch (err) {
      alert(
        "Failed to create shift"
      );
    }
  };

  /* DRAG */
  const handleEventDrop =
    async ({
      event,
      start,
      end,
    }) => {
      try {
        await scheduleAPI.update(
          event.id,
          {
            start_time: start,
            end_time: end,
          }
        );

        loadData();

      } catch (err) {
        alert(
          "Move failed"
        );
      }
    };

  /* RESIZE */
  const handleEventResize =
    async ({
      event,
      start,
      end,
    }) => {
      try {
        await scheduleAPI.update(
          event.id,
          {
            start_time: start,
            end_time: end,
          }
        );

        loadData();

      } catch (err) {
        alert(
          "Resize failed"
        );
      }
    };

  /* DELETE */
  const deleteShift =
    async (event) => {
      if (
        !window.confirm(
          `Delete ${event.title}'s shift?`
        )
      )
        return;

      try {
        await scheduleAPI.delete(
          event.id
        );

        loadData();

      } catch (err) {
        alert(
          "Delete failed"
        );
      }
    };

  const totalShifts =
    events.length;

  const todayShifts =
    events.filter(
      (e) =>
        new Date(
          e.start
        ).toDateString() ===
        new Date().toDateString()
    ).length;

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading calendar...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">

        <div>
          <h1 className="text-2xl font-semibold">
            Schedule Calendar
          </h1>

          <p className="text-sm text-gray-400">
            Drag, resize and manage rota
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm flex items-center gap-2"
          >
            <RefreshCw
              size={16}
            />
            Refresh
          </button>

          <button
            onClick={() =>
              setShowCreate(
                true
              )
            }
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm flex items-center gap-2"
          >
            <Plus
              size={16}
            />
            New Shift
          </button>

        </div>

      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-3 gap-4">

        <StatCard
          title="Total Staff"
          value={users.length}
          icon={
            <Users
              size={16}
            />
          }
        />

        <StatCard
          title="Today Shifts"
          value={todayShifts}
          icon={
            <CalendarDays
              size={16}
            />
          }
        />

        <StatCard
          title="All Shifts"
          value={totalShifts}
          icon={
            <CalendarDays
              size={16}
            />
          }
        />

      </div>

      {/* CALENDAR */}
      <div className="rounded-2xl border border-white/10 bg-[#020617] p-4 overflow-hidden">

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
          eventPropGetter={() => ({
            style: {
              backgroundColor:
                "#6366f1",
              borderRadius:
                "8px",
              border:
                "none",
              padding:
                "2px 6px",
              fontSize:
                "12px",
            },
          })}
        />

      </div>

      {/* MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">

          <div className="w-full max-w-md bg-[#020617] border border-white/10 rounded-2xl p-6">

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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                <option value="">
                  Select Employee
                </option>

                {users.map(
                  (
                    u
                  ) => (
                    <option
                      key={
                        u.id
                      }
                      value={
                        u.id
                      }
                    >
                      {u.name ||
                        u.email}
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              />

              <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium">
                Create Shift
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10"
              >
                Cancel
              </button>

            </form>

            <p className="text-xs text-gray-500 mt-4">
              Double click any shift to delete it.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
      <div className="bg-[#020617] border border-white/10 rounded-2xl p-4">

        <div className="flex justify-between items-center">

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
    </div>
  );
}

export default ScheduleCalendar;