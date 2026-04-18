import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import {
  scheduleAPI,
  holidayAPI,
  userAPI,
  locationAPI,
} from "../services/api";

import {
  CalendarDays,
  Users,
  Plus,
  RefreshCw,
  Trash2,
  PoundSterling,
} from "lucide-react";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    user_id: "",
    location_id: "",
    start: "",
    end: "",
    is_open: false,
    overtime: false,
  });

  useEffect(() => {
    loadData(true);
  }, []);

  async function loadData(show = false) {
    try {
      if (show) setLoading(true);

      const [
        schedRes,
        holRes,
        usersRes,
        locRes,
      ] = await Promise.all([
        scheduleAPI.getAll(),
        holidayAPI.getAll(),
        userAPI.getAll(),
        locationAPI.getAll(),
      ]);

      const safeUsers = Array.isArray(usersRes)
        ? usersRes
        : [];

      const safeLocs = Array.isArray(locRes)
        ? locRes
        : [];

      setUsers(safeUsers);
      setLocations(safeLocs);

      const userMap = {};
      const rateMap = {};

      safeUsers.forEach((u) => {
        userMap[u.id] =
          u.name || u.email || "Employee";

        rateMap[u.id] = Number(
          u.hourly_rate || 0
        );
      });

      const locMap = {};

      safeLocs.forEach((l) => {
        locMap[l.id] = l.name;
      });

      const shifts = (
        Array.isArray(schedRes)
          ? schedRes
          : []
      ).map((s) => {
        const isOpen =
          s.is_open ||
          !s.user_id;

        const title = isOpen
          ? `OPEN SHIFT • ${
              locMap[s.location_id] ||
              "Location"
            }`
          : `${userMap[s.user_id]} • ${
              moment(
                s.start_time
              ).format("HH:mm")
            }-${moment(
              s.end_time
            ).format("HH:mm")} • ${
              locMap[s.location_id] ||
              "Location"
            }`;

        return {
          id: s.id,
          type: isOpen
            ? "open"
            : "shift",
          user_id: s.user_id,
          title,
          start: new Date(
            s.start_time
          ),
          end: new Date(
            s.end_time
          ),
          overtime:
            s.overtime || false,
          hourly_rate:
            rateMap[s.user_id] || 0,
        };
      });

      const holidays = (
        Array.isArray(holRes)
          ? holRes
          : []
      )
        .filter(
          (h) =>
            h.status === "approved"
        )
        .map((h) => ({
          id: `h-${h.id}`,
          type: "holiday",
          title: `${
            h.name ||
            userMap[h.user_id] ||
            "Employee"
          } • HOLIDAY`,
          start: new Date(
            h.start_date +
              "T00:00:00"
          ),
          end: new Date(
            h.end_date +
              "T23:59:59"
          ),
        }));

      setEvents([
        ...shifts,
        ...holidays,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function styleEvent(event) {
    if (event.type === "holiday") {
      return {
        style: {
          background:
            "#16a34a",
          border: "none",
          borderRadius: "8px",
        },
      };
    }

    if (event.type === "open") {
      return {
        style: {
          background:
            "#f59e0b",
          border: "none",
          borderRadius: "8px",
          color: "#111",
          fontWeight: 700,
        },
      };
    }

    return {
      style: {
        background:
          event.overtime
            ? "#dc2626"
            : "#6366f1",
        border: "none",
        borderRadius: "8px",
      },
    };
  }

  async function createShift(e) {
    e.preventDefault();

    try {
      await scheduleAPI.create({
        user_id: form.is_open
          ? null
          : form.user_id,
        location_id:
          form.location_id,
        date: moment(
          form.start
        ).format("YYYY-MM-DD"),
        start_time: form.start,
        end_time: form.end,
        is_open:
          form.is_open,
        overtime:
          form.overtime,
      });

      setShowCreate(false);

      setForm({
        user_id: "",
        location_id: "",
        start: "",
        end: "",
        is_open: false,
        overtime: false,
      });

      loadData(false);
    } catch {
      alert(
        "Failed to create shift"
      );
    }
  }

  async function deleteShift(
    event
  ) {
    if (
      event.type ===
      "holiday"
    )
      return;

    if (
      !window.confirm(
        "Delete shift?"
      )
    )
      return;

    await scheduleAPI.delete(
      event.id
    );

    loadData(false);
  }

  async function onDrop({
    event,
    start,
    end,
  }) {
    if (
      event.type ===
      "holiday"
    )
      return;

    await scheduleAPI.update(
      event.id,
      {
        start_time: start,
        end_time: end,
      }
    );

    loadData(false);
  }

  async function onResize({
    event,
    start,
    end,
  }) {
    if (
      event.type ===
      "holiday"
    )
      return;

    await scheduleAPI.update(
      event.id,
      {
        start_time: start,
        end_time: end,
      }
    );

    loadData(false);
  }

  const visibleEvents =
    useMemo(
      () =>
        events.filter((e) =>
          moment(e.start).isSame(
            date,
            "month"
          )
        ),
      [events, date]
    );

  const monthWage =
    visibleEvents
      .filter(
        (x) =>
          x.type ===
          "shift"
      )
      .reduce(
        (sum, x) => {
          const hrs =
            moment(
              x.end
            ).diff(
              moment(
                x.start
              ),
              "minutes"
            ) / 60;

          return (
            sum +
            hrs *
              x.hourly_rate
          );
        },
        0
      );

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            Schedule
          </h1>

          <p className="text-sm text-gray-400">
            Full planner
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">

          <button
            onClick={() =>
              loadData(false)
            }
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

      <div className="grid md:grid-cols-3 gap-4">

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
          title="Events"
          value={events.length}
          icon={
            <CalendarDays
              size={16}
            />
          }
        />

        <Card
          title="Month Wage"
          value={`£${monthWage.toFixed(
            2
          )}`}
          icon={
            <PoundSterling
              size={16}
            />
          }
        />

      </div>

      <div className="rounded-2xl border border-white/10 bg-[#020617] p-4 overflow-hidden">

        <DnDCalendar
          localizer={
            localizer
          }
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={date}
          onNavigate={
            setDate
          }
          view={view}
          onView={setView}
          selectable
          resizable
          popup
          views={[
            Views.MONTH,
            Views.WEEK,
            Views.DAY,
            Views.AGENDA,
          ]}
          defaultView="month"
          style={{
            height:
              "82vh",
          }}
          eventPropGetter={
            styleEvent
          }
          onEventDrop={
            onDrop
          }
          onEventResize={
            onResize
          }
          onDoubleClickEvent={
            deleteShift
          }
          draggableAccessor={(
            e
          ) =>
            e.type !==
            "holiday"
          }
          resizableAccessor={(
            e
          ) =>
            e.type !==
            "holiday"
          }
        />

      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">

          <div className="w-full max-w-lg bg-[#020617] border border-white/10 rounded-2xl p-6">

            <h2 className="text-lg font-semibold mb-4">
              Add Shift
            </h2>

            <form
              onSubmit={
                createShift
              }
              className="space-y-4"
            >

              <select
                value={
                  form.location_id
                }
                required
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    location_id:
                      e.target
                        .value,
                  })
                }
                className="w-full bg-[#0f172a] text-white rounded-xl px-4 py-3"
              >
                <option value="">
                  Select Location
                </option>

                {locations.map(
                  (
                    l
                  ) => (
                    <option
                      key={
                        l.id
                      }
                      value={
                        l.id
                      }
                    >
                      {
                        l.name
                      }
                    </option>
                  )
                )}
              </select>

              {!form.is_open && (
                <select
                  value={
                    form.user_id
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      user_id:
                        e.target
                          .value,
                    })
                  }
                  className="w-full bg-[#0f172a] text-white rounded-xl px-4 py-3"
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
                        {u.name}
                      </option>
                    )
                  )}
                </select>
              )}

              <input
                type="datetime-local"
                value={
                  form.start
                }
                required
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    start:
                      e.target
                        .value,
                  })
                }
                className="w-full bg-[#0f172a] text-white rounded-xl px-4 py-3"
              />

              <input
                type="datetime-local"
                value={
                  form.end
                }
                required
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    end:
                      e.target
                        .value,
                  })
                }
                className="w-full bg-[#0f172a] text-white rounded-xl px-4 py-3"
              />

              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={
                    form.is_open
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      is_open:
                        e.target
                          .checked,
                    })
                  }
                />
                Open Shift
              </label>

              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={
                    form.overtime
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      overtime:
                        e.target
                          .checked,
                    })
                  }
                />
                Overtime
              </label>

              <button className="w-full py-3 rounded-xl bg-indigo-600">
                Save
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

            <p className="text-xs text-gray-500 mt-4">
              Double click shift to delete.
            </p>

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
  );
}