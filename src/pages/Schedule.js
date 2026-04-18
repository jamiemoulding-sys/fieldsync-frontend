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
  PoundSterling,
  Plus,
  RefreshCw,
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

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    user_ids: [],
    location_id: "",
    date: "",
    from: "",
    to: "",
    start: "09:00",
    end: "17:00",
    mode: "single",
    open_shift: false,
    overtime: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        shiftRes,
        holidayRes,
        userRes,
        locationRes,
      ] = await Promise.all([
        scheduleAPI.getAll(),
        holidayAPI.getAll(),
        userAPI.getAll(),
        locationAPI.getAll(),
      ]);

      const safeUsers = Array.isArray(userRes)
        ? userRes
        : [];

      const safeLocations = Array.isArray(
        locationRes
      )
        ? locationRes
        : [];

      const safeShifts = Array.isArray(
        shiftRes
      )
        ? shiftRes
        : [];

      const safeHoliday = Array.isArray(
        holidayRes
      )
        ? holidayRes
        : [];

      setUsers(safeUsers);
      setLocations(safeLocations);

      const userMap = {};
      const rateMap = {};
      const locationMap = {};

      safeUsers.forEach((u) => {
        userMap[u.id] =
          u.name || u.email || "Staff";

        rateMap[u.id] = Number(
          u.hourly_rate || 0
        );
      });

      safeLocations.forEach((l) => {
        locationMap[l.id] =
          l.name || "Location";
      });

      const shiftEvents = safeShifts.map(
        (s) => {
          const start = new Date(
            s.start_time
          );

          const end = new Date(
            s.end_time
          );

          const open =
            s.is_open || !s.user_id;

          const person = open
            ? "OPEN SHIFT"
            : userMap[s.user_id] ||
              "Staff";

          const hours = `${moment(
            start
          ).format("HH:mm")} - ${moment(
            end
          ).format("HH:mm")}`;

          const loc =
            locationMap[
              s.location_id
            ] || "No Location";

          return {
            id: s.id,
            type: open
              ? "open"
              : "shift",
            start,
            end,
            title: `${person} • ${hours} • ${loc}`,
            resource: {
              user_id:
                s.user_id,
              hourly_rate:
                rateMap[
                  s.user_id
                ] || 0,
              overtime:
                s.overtime,
            },
          };
        }
      );

      const holidayEvents =
        safeHoliday
          .filter(
            (h) =>
              h.status ===
              "approved"
          )
          .map((h) => ({
            id: `holiday-${h.id}`,
            type: "holiday",
            start: new Date(
              h.start_date +
                "T00:00:00"
            ),
            end: new Date(
              h.end_date +
                "T23:59:59"
            ),
            allDay: true,
            title: `${
              h.name ||
              userMap[
                h.user_id
              ] ||
              "Staff"
            } • HOLIDAY`,
          }));

      setEvents([
        ...shiftEvents,
        ...holidayEvents,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function userOnHoliday(
    userId,
    checkDate
  ) {
    const user =
      users.find(
        (u) => u.id === userId
      ) || {};

    const name = (
      user.name || ""
    ).toLowerCase();

    return events.some(
      (e) =>
        e.type === "holiday" &&
        e.title
          .toLowerCase()
          .includes(name) &&
        moment(checkDate).isBetween(
          e.start,
          e.end,
          "day",
          "[]"
        )
    );
  }

  async function createSingle() {
    if (
      !form.date ||
      !form.location_id
    )
      return;

    const selected =
      form.open_shift
        ? [null]
        : form.user_ids;

    for (const id of selected) {
      if (
        id &&
        userOnHoliday(
          id,
          form.date
        )
      )
        continue;

      await scheduleAPI.create({
        user_id: id,
        location_id:
          form.location_id,
        date: form.date,
        start_time: `${form.date}T${form.start}`,
        end_time: `${form.date}T${form.end}`,
        overtime:
          form.overtime,
        is_open:
          form.open_shift,
      });
    }

    setShowModal(false);
    loadData();
  }

  async function createBulk() {
    if (
      !form.from ||
      !form.to ||
      !form.location_id
    )
      return;

    let day = moment(
      form.from
    );

    const end = moment(
      form.to
    );

    while (
      day.isSameOrBefore(
        end,
        "day"
      )
    ) {
      const selected =
        form.open_shift
          ? [null]
          : form.user_ids;

      for (const id of selected) {
        if (
          id &&
          userOnHoliday(
            id,
            day
          )
        )
          continue;

        await scheduleAPI.create({
          user_id: id,
          location_id:
            form.location_id,
          date: day.format(
            "YYYY-MM-DD"
          ),
          start_time: `${day.format(
            "YYYY-MM-DD"
          )}T${form.start}`,
          end_time: `${day.format(
            "YYYY-MM-DD"
          )}T${form.end}`,
          overtime:
            form.overtime,
          is_open:
            form.open_shift,
        });
      }

      day.add(1, "day");
    }

    setShowModal(false);
    loadData();
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
      event.id,
      {
        start_time:
          start,
        end_time: end,
      }
    );

    loadData();
  }

  const monthlyEvents =
    useMemo(() => {
      return events.filter((e) =>
        moment(e.start).isSame(
          date,
          "month"
        )
      );
    }, [events, date]);

  const monthlyShifts =
    monthlyEvents.filter(
      (x) =>
        x.type === "shift" ||
        x.type === "open"
    ).length;

  const monthlyHours =
    monthlyEvents
      .filter(
        (x) =>
          x.type === "shift"
      )
      .reduce(
        (sum, x) =>
          sum +
          moment(
            x.end
          ).diff(
            x.start,
            "minutes"
          ) /
            60,
        0
      );

  const monthlyWages =
    monthlyEvents
      .filter(
        (x) =>
          x.type === "shift"
      )
      .reduce(
        (sum, x) => {
          const hrs =
            moment(
              x.end
            ).diff(
              x.start,
              "minutes"
            ) / 60;

          return (
            sum +
            hrs *
              (x.resource
                ?.hourly_rate ||
                0)
          );
        },
        0
      );

  function eventStyleGetter(
    event
  ) {
    if (
      event.type ===
      "holiday"
    ) {
      return {
        style: {
          background:
            "#16a34a",
          border: "none",
          borderRadius:
            "8px",
        },
      };
    }

    if (
      event.type ===
      "open"
    ) {
      return {
        style: {
          background:
            "#f59e0b",
          color: "#111",
          border: "none",
          borderRadius:
            "8px",
          fontWeight: 700,
        },
      };
    }

    return {
      style: {
        background:
          "#6366f1",
        border: "none",
        borderRadius:
          "8px",
      },
    };
  }

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading schedule...
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
            Smart rota planner
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-white/5"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={() =>
              setShowModal(true)
            }
            className="px-4 py-2 rounded-xl bg-indigo-600 flex gap-2 items-center"
          >
            <Plus size={16} />
            Add Shift
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card
          title="Month Shifts"
          value={monthlyShifts}
          icon={
            <CalendarDays size={16} />
          }
        />

        <Card
          title="Month Hours"
          value={monthlyHours.toFixed(
            1
          )}
          icon={
            <Users size={16} />
          }
        />

        <Card
          title="Month Wages"
          value={`£${monthlyWages.toFixed(
            2
          )}`}
          icon={
            <PoundSterling size={16} />
          }
        />
      </div>

      {/* CALENDAR */}
      <div className="rounded-2xl border border-white/10 bg-[#020617] p-4 schedule-wrap">

        <DnDCalendar
          localizer={
            localizer
          }
          events={events}
          date={date}
          onNavigate={
            setDate
          }
          view={view}
          onView={setView}
          views={[
            Views.MONTH,
            Views.WEEK,
            Views.AGENDA,
          ]}
          popup
          selectable
          resizable
          startAccessor="start"
          endAccessor="end"
          style={{
            height:
              "82vh",
          }}
          eventPropGetter={
            eventStyleGetter
          }
          onEventDrop={
            moveShift
          }
          onEventResize={
            moveShift
          }
          components={{
            week:
              CustomWeekView,
          }}
        />

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">

          <div className="w-full max-w-3xl bg-[#020617] border border-white/10 rounded-2xl p-6 space-y-4">

            <h2 className="text-xl font-semibold">
              Add Shift / Bulk Schedule
            </h2>

            <select
              value={form.mode}
              onChange={(e) =>
                setForm({
                  ...form,
                  mode:
                    e.target.value,
                })
              }
              className="w-full bg-[#0f172a] text-white rounded-xl px-4 py-3"
            >
              <option value="single">
                Single Shift
              </option>
              <option value="bulk">
                Bulk Schedule
              </option>
            </select>

            <div className="grid md:grid-cols-2 gap-3">
              {form.mode ===
              "single" ? (
                <input
                  type="date"
                  value={
                    form.date
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      date:
                        e.target
                          .value,
                    })
                  }
                  className="bg-[#0f172a] text-white rounded-xl px-4 py-3"
                />
              ) : (
                <>
                  <input
                    type="date"
                    value={
                      form.from
                    }
                    onChange={(
                      e
                    ) =>
                      setForm({
                        ...form,
                        from:
                          e.target
                            .value,
                      })
                    }
                    className="bg-[#0f172a] text-white rounded-xl px-4 py-3"
                  />

                  <input
                    type="date"
                    value={
                      form.to
                    }
                    onChange={(
                      e
                    ) =>
                      setForm({
                        ...form,
                        to:
                          e.target
                            .value,
                      })
                    }
                    className="bg-[#0f172a] text-white rounded-xl px-4 py-3"
                  />
                </>
              )}

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
                className="bg-[#0f172a] text-white rounded-xl px-4 py-3"
              >
                <option value="">
                  Location
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
                      {l.name}
                    </option>
                  )
                )}
              </select>

              <input
                type="time"
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
                className="bg-[#0f172a] text-white rounded-xl px-4 py-3"
              />

              <input
                type="time"
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
                className="bg-[#0f172a] text-white rounded-xl px-4 py-3"
              />
            </div>

            {/* MULTI STAFF */}
            <div className="rounded-xl bg-[#0f172a] p-4">
              <p className="mb-3 text-sm">
                Select Multiple Staff
              </p>

              <div className="grid md:grid-cols-3 gap-2">
                {users.map((u) => (
                  <label
                    key={u.id}
                    className="flex gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.user_ids.includes(
                        u.id
                      )}
                      onChange={() => {
                        const exists =
                          form.user_ids.includes(
                            u.id
                          );

                        setForm({
                          ...form,
                          user_ids:
                            exists
                              ? form.user_ids.filter(
                                  (
                                    x
                                  ) =>
                                    x !==
                                    u.id
                                )
                              : [
                                  ...form.user_ids,
                                  u.id,
                                ],
                        });
                      }}
                    />

                    {u.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-6 text-sm">
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
            </div>

            <button
              onClick={() =>
                form.mode ===
                "single"
                  ? createSingle()
                  : createBulk()
              }
              className="w-full py-3 rounded-xl bg-indigo-600"
            >
              Save Schedule
            </button>

            <button
              onClick={() =>
                setShowModal(false)
              }
              className="w-full py-3 rounded-xl bg-white/5"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      <style>{`
        .schedule-wrap .rbc-off-range-bg{
          background:transparent!important;
        }

        .schedule-wrap .rbc-today{
          background:rgba(99,102,241,.12)!important;
        }

        .schedule-wrap .rbc-header{
          padding:12px;
          border-color:rgba(255,255,255,.08);
        }

        .schedule-wrap .rbc-event{
          padding:4px 8px;
          font-size:12px;
        }
      `}</style>

    </div>
  );
}

/* CUSTOM WEEK VIEW */
function CustomWeekView({
  date,
  events,
}) {
  const start = moment(date).startOf(
    "week"
  );

  const days = Array.from(
    { length: 7 },
    (_, i) =>
      start
        .clone()
        .add(i, "day")
  );

  return (
    <div className="grid grid-cols-7 gap-3 p-3 h-full overflow-auto">
      {days.map((day) => {
        const rows =
          events.filter((e) =>
            moment(
              e.start
            ).isSame(
              day,
              "day"
            )
          );

        return (
          <div
            key={day.format()}
            className="rounded-xl bg-[#0f172a] p-3 min-h-[600px]"
          >
            <div className="font-semibold mb-3 text-sm border-b border-white/10 pb-2">
              {day.format(
                "ddd DD MMM"
              )}
            </div>

            <div className="space-y-2">
              {rows.length ===
              0 ? (
                <div className="text-xs text-gray-500">
                  No shifts
                </div>
              ) : (
                rows.map(
                  (r) => (
                    <div
                      key={r.id}
                      className={`text-xs rounded-lg px-2 py-2 ${
                        r.type ===
                        "holiday"
                          ? "bg-green-600/20 text-green-300"
                          : r.type ===
                            "open"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-indigo-600/20 text-indigo-300"
                      }`}
                    >
                      {r.title}
                    </div>
                  )
                )
              )}
            </div>
          </div>
        );
      })}
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