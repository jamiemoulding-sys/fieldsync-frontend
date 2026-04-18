// src/pages/Schedule.jsx
// ADD LOCATIONS MASTER VERSION
// COPY / PASTE READY
// ✅ Multi-location scheduling
// ✅ Existing rota system upgraded
// ✅ Filled shifts
// ✅ Open shifts needing cover
// ✅ Weekly / Monthly / Day views
// ✅ Drag & drop move shifts
// ✅ Resize shifts
// ✅ Click shift to edit
// ✅ Delete shifts
// ✅ Overtime toggle
// ✅ Wage totals by selected month
// ✅ Wage totals by selected location
// ✅ Location filters
// ✅ Prevent double booking
// ✅ Prevent holiday conflicts
// ✅ Dropdown readability fixed

import React, { useEffect, useState } from "react";
import {
  Calendar,
  momentLocalizer,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import {
  scheduleAPI,
  holidayAPI,
  userAPI,
} from "../services/api";

import {
  Users,
  CalendarDays,
  PoundSterling,
  Plus,
  RefreshCw,
  Building2,
  Briefcase,
} from "lucide-react";

const localizer =
  momentLocalizer(moment);

const DnDCalendar =
  withDragAndDrop(Calendar);

/* ADD YOUR LOCATIONS HERE */
const locations = [
  {
    id: "colchester",
    name: "Colchester",
    colour: "#4f46e5",
  },
  {
    id: "chelmsford",
    name: "Chelmsford",
    colour: "#16a34a",
  },
  {
    id: "ipswich",
    name: "Ipswich",
    colour: "#f59e0b",
  },
  {
    id: "head-office",
    name: "Head Office",
    colour: "#7c3aed",
  },
];

export default function Schedule() {
  const [events, setEvents] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [date, setDate] =
    useState(new Date());

  const [loading, setLoading] =
    useState(true);

  const [filterLocation, setFilterLocation] =
    useState("all");

  const [showModal, setShowModal] =
    useState(false);

  const [editing, setEditing] =
    useState(null);

  const [form, setForm] = useState({
    user_id: "",
    location_id:
      "colchester",
    start: "",
    end: "",
    open_shift: false,
    overtime: false,
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const [
        schedules,
        holidays,
        usersData,
      ] = await Promise.all([
        scheduleAPI.getAll(),
        holidayAPI.getAll(),
        userAPI.getAll(),
      ]);

      const safeUsers =
        usersData || [];

      const userMap = {};

      safeUsers.forEach((u) => {
        userMap[u.id] =
          u.name || u.email;
      });

      const shiftEvents =
        (schedules || []).map(
          (s) => {
            const isOpen =
              s.open_shift ||
              !s.user_id;

            const location =
              locations.find(
                (l) =>
                  l.id ===
                  s.location_id
              ) ||
              locations[0];

            const staff =
              isOpen
                ? "OPEN SHIFT"
                : userMap[
                    s.user_id
                  ] ||
                  "Staff";

            return {
              id:
                "shift-" +
                s.id,
              dbId: s.id,
              type:
                isOpen
                  ? "open"
                  : s.overtime
                  ? "overtime"
                  : "shift",
              user_id:
                s.user_id,
              location_id:
                s.location_id ||
                "colchester",
              title: `${staff} | ${
                location.name
              }`,
              start:
                new Date(
                  s.start_time
                ),
              end:
                new Date(
                  s.end_time
                ),
              hourly_rate:
                Number(
                  safeUsers.find(
                    (u) =>
                      u.id ===
                      s.user_id
                  )
                    ?.hourly_rate ||
                    0
                ),
              colour:
                location.colour,
            };
          }
        );

      const holidayEvents =
        (holidays || [])
          .filter(
            (h) =>
              h.status ===
              "approved"
          )
          .map((h) => ({
            id:
              "holiday-" +
              h.id,
            dbId: h.id,
            type:
              "holiday",
            title: `${
              userMap[
                h.user_id
              ] ||
              h.name
            } HOLIDAY`,
            start:
              new Date(
                h.start_date
              ),
            end: moment(
              h.end_date
            )
              .add(
                1,
                "day"
              )
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

  function sameMonth(d) {
    return (
      d.getMonth() ===
        date.getMonth() &&
      d.getFullYear() ===
        date.getFullYear()
    );
  }

  const filteredEvents =
    events.filter((e) => {
      const monthOk =
        sameMonth(e.start);

      const locationOk =
        filterLocation ===
          "all" ||
        e.location_id ===
          filterLocation ||
        e.type ===
          "holiday";

      return (
        monthOk &&
        locationOk
      );
    });

  const paidEvents =
    filteredEvents.filter(
      (e) =>
        e.type ===
          "shift" ||
        e.type ===
          "overtime"
    );

  const openCount =
    filteredEvents.filter(
      (e) =>
        e.type ===
        "open"
    ).length;

  const monthlyWage =
    paidEvents.reduce(
      (sum, e) => {
        const hrs =
          (e.end -
            e.start) /
          3600000;

        return (
          sum +
          hrs *
            e.hourly_rate
        );
      },
      0
    );

  function hasHoliday(
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
              u.id ===
              userId
          )?.name || ""
        ) &&
        start <
          e.end &&
        end >
          e.start
    );
  }

  function doubleBooked(
    userId,
    start,
    end,
    ignoreId = null
  ) {
    return events.some(
      (e) =>
        e.type !==
          "holiday" &&
        e.user_id ===
          userId &&
        e.dbId !==
          ignoreId &&
        start < e.end &&
        end > e.start
    );
  }

  async function saveShift() {
    const start =
      new Date(
        form.start
      );

    const end =
      new Date(
        form.end
      );

    if (
      !form.open_shift
    ) {
      if (
        hasHoliday(
          form.user_id,
          start,
          end
        )
      ) {
        return alert(
          "Staff is on holiday"
        );
      }

      if (
        doubleBooked(
          form.user_id,
          start,
          end,
          editing?.dbId
        )
      ) {
        return alert(
          "Already booked elsewhere"
        );
      }
    }

    const payload = {
      user_id:
        form.open_shift
          ? null
          : form.user_id,
      location_id:
        form.location_id,
      open_shift:
        form.open_shift,
      overtime:
        form.overtime,
      date: moment(
        form.start
      ).format(
        "YYYY-MM-DD"
      ),
      start_time:
        form.start,
      end_time:
        form.end,
    };

    if (editing) {
      await scheduleAPI.update(
        editing.dbId,
        payload
      );
    } else {
      await scheduleAPI.create(
        payload
      );
    }

    closeModal();
    load();
  }

  async function deleteShift() {
    await scheduleAPI.delete(
      editing.dbId
    );
    closeModal();
    load();
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);

    setForm({
      user_id: "",
      location_id:
        "colchester",
      start: "",
      end: "",
      open_shift: false,
      overtime: false,
    });
  }

  function newShift() {
    setEditing(null);

    setForm({
      user_id: "",
      location_id:
        "colchester",
      start: moment().format(
        "YYYY-MM-DDT09:00"
      ),
      end: moment().format(
        "YYYY-MM-DDT17:00"
      ),
      open_shift: false,
      overtime: false,
    });

    setShowModal(true);
  }

  function editShift(
    event
  ) {
    if (
      event.type ===
      "holiday"
    )
      return;

    setEditing(event);

    setForm({
      user_id:
        event.user_id ||
        "",
      location_id:
        event.location_id,
      start: moment(
        event.start
      ).format(
        "YYYY-MM-DDTHH:mm"
      ),
      end: moment(
        event.end
      ).format(
        "YYYY-MM-DDTHH:mm"
      ),
      open_shift:
        event.type ===
        "open",
      overtime:
        event.type ===
        "overtime",
    });

    setShowModal(true);
  }

  async function moveShift({
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
      event.dbId,
      {
        start_time:
          start,
        end_time: end,
      }
    );

    load();
  }

  function styleEvent(
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
          borderRadius:
            "8px",
          border: "none",
        },
      };
    }

    if (
      event.type ===
      "open"
    ) {
      return {
        style: {
          backgroundColor:
            "#f59e0b",
          borderRadius:
            "8px",
          border: "none",
        },
      };
    }

    if (
      event.type ===
      "overtime"
    ) {
      return {
        style: {
          backgroundColor:
            "#7c3aed",
          borderRadius:
            "8px",
          border: "none",
        },
      };
    }

    return {
      style: {
        backgroundColor:
          event.colour,
        borderRadius:
          "8px",
        border: "none",
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
            Schedule
          </h1>

          <p className="text-sm text-gray-400">
            Multi-location rota planner
          </p>
        </div>

        <div className="flex gap-2">

          <select
            value={
              filterLocation
            }
            onChange={(
              e
            ) =>
              setFilterLocation(
                e.target
                  .value
              )
            }
            className="px-4 py-2 rounded-xl bg-[#111827] text-white border border-white/10"
          >
            <option value="all">
              All Locations
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

          <button
            onClick={load}
            className="px-4 py-2 rounded-xl bg-white/5"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={
              newShift
            }
            className="px-4 py-2 rounded-xl bg-indigo-600"
          >
            <Plus size={16} />
          </button>

        </div>

      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">

        <Card
          title="Staff"
          value={
            users.length
          }
          icon={
            <Users size={16} />
          }
        />

        <Card
          title="Shifts"
          value={
            paidEvents.length
          }
          icon={
            <CalendarDays size={16} />
          }
        />

        <Card
          title="Open"
          value={
            openCount
          }
          icon={
            <Briefcase size={16} />
          }
        />

        <Card
          title="Wages"
          value={`£${monthlyWage.toFixed(
            2
          )}`}
          icon={
            <PoundSterling size={16} />
          }
        />

      </div>

      {/* CALENDAR */}
      <div className="rounded-2xl border border-white/10 bg-[#020617] p-4">

        <DnDCalendar
          localizer={
            localizer
          }
          events={
            filteredEvents
          }
          startAccessor="start"
          endAccessor="end"
          date={date}
          onNavigate={setDate}
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
          style={{
            height:
              "78vh",
          }}
          onEventDrop={
            moveShift
          }
          onEventResize={
            moveShift
          }
          onSelectEvent={
            editShift
          }
          eventPropGetter={
            styleEvent
          }
          tooltipAccessor={(
            e
          ) =>
            `${e.title} ${moment(
              e.start
            ).format(
              "HH:mm"
            )}-${moment(
              e.end
            ).format(
              "HH:mm"
            )}`
          }
        />

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-[#020617] border border-white/10 p-6 space-y-4">

            <h2 className="text-xl font-semibold">
              {editing
                ? "Edit Shift"
                : "Create Shift"}
            </h2>

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
              className="w-full px-4 py-3 rounded-xl bg-[#111827] text-white border border-white/10"
            >
              <option value="">
                Select Staff
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

            <select
              value={
                form.location_id
              }
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
              className="w-full px-4 py-3 rounded-xl bg-[#111827] text-white border border-white/10"
            >
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

            <input
              type="datetime-local"
              value={
                form.start
              }
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
              className="w-full px-4 py-3 rounded-xl bg-[#111827] text-white border border-white/10"
            />

            <input
              type="datetime-local"
              value={
                form.end
              }
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
              className="w-full px-4 py-3 rounded-xl bg-[#111827] text-white border border-white/10"
            />

            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={
                  form.open_shift
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    open_shift:
                      e.target
                        .checked,
                  })
                }
              />
              Open Shift
            </label>

            <label className="flex gap-2">
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

            <button
              onClick={
                saveShift
              }
              className="w-full py-3 rounded-xl bg-indigo-600"
            >
              Save
            </button>

            {editing && (
              <button
                onClick={
                  deleteShift
                }
                className="w-full py-3 rounded-xl bg-red-600"
              >
                Delete
              </button>
            )}

            <button
              onClick={
                closeModal
              }
              className="w-full py-3 rounded-xl bg-white/5"
            >
              Cancel
            </button>

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