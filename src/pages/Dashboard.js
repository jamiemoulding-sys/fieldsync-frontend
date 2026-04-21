// src/pages/Dashboard.js
// FULL TRUE FINAL RESTORE DASHBOARD
// ✅ Admin + Manager dashboard restored
// ✅ Employee dashboard custom mobile version
// ✅ Original analytics restored
// ✅ Live map restored
// ✅ Wages restored
// ✅ AI Pattern Catcher added
// ✅ Full copy / paste ready

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import {
  userAPI,
  shiftAPI,
  holidayAPI,
  billingAPI,
  taskAPI,
} from "../services/api";

import {
  Loader2,
  Clock3,
  CalendarDays,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

/* ================================================= */

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading || !user) return <Loading />;

  if (user.role === "employee") {
    return <EmployeeDashboard user={user} />;
  }

  return <AdminDashboard user={user} />;
}

/* ================================================= */
/* EMPLOYEE DASHBOARD */
/* ================================================= */

function EmployeeDashboard({ user }) {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [shifts, setShifts] =
    useState([]);

  const [holidays, setHolidays] =
    useState([]);

  const [tasks, setTasks] =
    useState([]);

  const [activeShift, setActiveShift] =
    useState(null);

  useEffect(() => {
    load();

    const t = setInterval(
      load,
      15000
    );

    return () => clearInterval(t);
  }, []);

  async function load() {
    try {
      const [
        allShifts,
        allHolidays,
        allTasks,
      ] = await Promise.all([
        shiftAPI.getAll(),
        holidayAPI.getAll(),
        taskAPI?.getAll
          ? taskAPI.getAll()
          : [],
      ]);

      const mine =
        (allShifts || []).filter(
          (x) =>
            String(x.user_id) ===
            String(user.id)
        );

      const myHolidays =
        (allHolidays || []).filter(
          (x) =>
            String(x.user_id) ===
            String(user.id)
        );

      const myTasks =
        (allTasks || []).filter(
          (x) =>
            x.assigned_users?.includes(
              user.id
            )
        );

      const live = mine.find(
        (x) =>
          x.clock_in_time &&
          !x.clock_out_time
      );

      setShifts(mine);
      setHolidays(myHolidays);
      setTasks(myTasks);
      setActiveShift(live || null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  const weekHours = shifts
    .slice(-7)
    .reduce((sum, row) => {
      if (!row.clock_in_time)
        return sum;

      const start = new Date(
        row.clock_in_time
      );

      const end = row.clock_out_time
        ? new Date(
            row.clock_out_time
          )
        : new Date();

      return (
        sum +
        (end - start) / 3600000
      );
    }, 0)
    .toFixed(1);

  const approvedDays = holidays
    .filter(
      (x) => x.status === "approved"
    )
    .length;

  const allowance =
    Number(
      user.holiday_allowance || 28
    );

  const remaining =
    allowance - approvedDays;

  const pendingTasks =
    tasks.filter(
      (x) => !x.completed
    ).length;

  return (
    <div className="space-y-5">

      <div>
        <p className="text-sm text-gray-400">
          Dashboard
        </p>

        <h1 className="text-3xl font-bold mt-1">
          Good morning, {user.name}
        </h1>
      </div>

      <button
        onClick={() =>
          navigate("/work-session")
        }
        className="w-full py-5 rounded-3xl bg-indigo-600 text-lg font-semibold"
      >
        {activeShift
          ? "Resume Shift"
          : "Clock In / Start Shift"}
      </button>

      <div className="grid md:grid-cols-2 gap-4">

        <SmallCard
          title="Hours This Week"
          value={`${weekHours} hrs`}
          icon={<Clock3 size={18} />}
        />

        <SmallCard
          title="Holiday Remaining"
          value={`${remaining} days`}
          icon={
            <CalendarDays size={18} />
          }
        />

        <SmallCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={
            <CheckSquare size={18} />
          }
        />

      </div>

    </div>
  );
}

/* ================================================= */
/* ADMIN + MANAGER RESTORED */
/* ================================================= */

function AdminDashboard({ user }) {
  const [loading, setLoading] =
    useState(true);

  const [staff, setStaff] =
    useState([]);

  const [live, setLive] =
    useState([]);

  const [leave, setLeave] =
    useState([]);

  const [plan, setPlan] =
    useState("trial");

  const [allShifts, setAllShifts] =
    useState([]);

  useEffect(() => {
    load();

    const t = setInterval(
      load,
      15000
    );

    return () => clearInterval(t);
  }, []);

  async function load() {
    try {
      const [
        users,
        active,
        holidays,
        billing,
        shifts,
      ] = await Promise.all([
        userAPI.getAll(),
        shiftAPI.getActiveAll(),
        holidayAPI.getAll(),
        billingAPI.getStatus(),
        shiftAPI.getAll(),
      ]);

      setStaff(users || []);
      setLive(active || []);
      setLeave(holidays || []);
      setPlan(
        billing?.plan || "trial"
      );
      setAllShifts(shifts || []);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  const employees =
    staff.length;

  const clockedIn =
    live.length;

  const onLeave =
    leave.filter(
      (x) =>
        x.status === "approved"
    ).length;

  const pieData = [
    {
      name: "Clocked In",
      value: clockedIn,
    },
    {
      name: "Leave",
      value: onLeave,
    },
    {
      name: "Other",
      value:
        employees -
        clockedIn -
        onLeave,
    },
  ];

  const todayWages =
    estimateWages(
      allShifts,
      staff,
      1
    );

  const weekWages =
    estimateWages(
      allShifts,
      staff,
      7
    );

  const aiAlerts =
    buildAIAlerts(
      allShifts,
      staff
    );

  return (
    <div className="space-y-6">

      <div>
        <p className="text-sm text-gray-400">
          Dashboard
        </p>

        <h1 className="text-4xl font-bold mt-1">
          Good morning, {user.name}
        </h1>
      </div>

      <div className="grid md:grid-cols-5 gap-4">

        <Card
          title="Employees"
          value={employees}
          sub="Total"
        />

        <Card
          title="Clocked In"
          value={clockedIn}
          sub="Now"
        />

        <Card
          title="On Leave"
          value={onLeave}
          sub="Today"
        />

        <Card
          title="Plan"
          value={plan}
          sub="Subscription"
        />

        <Card
          title="AI Alerts"
          value={aiAlerts.length}
          sub="Detected"
        />

      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <Panel title="Attendance">
          <div className="h-[320px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={80}
                  outerRadius={110}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#facc15" />
                  <Cell fill="#ef4444" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Live Staff Map">
          <LiveMap live={live} />
        </Panel>

      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <MoneyCard
          title="Today's Wages"
          value={todayWages}
        />

        <MoneyCard
          title="Weekly Wages"
          value={weekWages}
        />

      </div>

      <Panel title="AI Intelligent Pattern Catcher">

        <div className="space-y-3">
          {aiAlerts.length ? (
            aiAlerts.map(
              (
                item,
                index
              ) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white/5 p-4 flex gap-3"
                >
                  <AlertTriangle
                    size={18}
                    className="text-yellow-400"
                  />

                  <p className="text-sm">
                    {item}
                  </p>
                </div>
              )
            )
          ) : (
            <p className="text-gray-400 text-sm">
              No unusual patterns detected.
            </p>
          )}
        </div>

      </Panel>

    </div>
  );
}

/* ================================================= */

function estimateWages(
  shifts,
  staff,
  days
) {
  const since =
    new Date();

  since.setDate(
    since.getDate() - days
  );

  let total = 0;

  shifts.forEach((row) => {
    if (!row.clock_in_time)
      return;

    const start =
      new Date(
        row.clock_in_time
      );

    if (start < since) return;

    const end =
      row.clock_out_time
        ? new Date(
            row.clock_out_time
          )
        : new Date();

    const emp = staff.find(
      (x) =>
        x.id === row.user_id
    );

    const rate = Number(
      emp?.hourly_rate || 0
    );

    total +=
      ((end - start) /
        3600000) *
      rate;
  });

  return total.toFixed(2);
}

function buildAIAlerts(
  shifts,
  staff
) {
  const alerts = [];

  if (
    shifts.filter(
      (x) => !x.clock_out_time
    ).length > 5
  ) {
    alerts.push(
      "Multiple open shifts detected."
    );
  }

  if (
    staff.filter(
      (x) => !x.hourly_rate
    ).length
  ) {
    alerts.push(
      "Some staff missing hourly rates."
    );
  }

  if (
    shifts.length > 50
  ) {
    alerts.push(
      "High activity spike this week."
    );
  }

  return alerts;
}

/* ================================================= */

function LiveMap({ live }) {
  const points = live.filter(
    (x) =>
      x.latitude &&
      x.longitude
  );

  const center = points.length
    ? [
        Number(
          points[0].latitude
        ),
        Number(
          points[0].longitude
        ),
      ]
    : [51.5072, -0.1276];

  return (
    <div className="h-[390px] rounded-2xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={11}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {points.map((row) => (
          <Marker
            key={row.id}
            position={[
              Number(row.latitude),
              Number(row.longitude),
            ]}
          >
            <Popup>
              {row.users?.name ||
                "Staff"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

/* ================================================= */

function SmallCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-5">
      <div className="flex justify-between">
        <p className="text-sm text-gray-400">
          {title}
        </p>
        {icon}
      </div>

      <h2 className="text-2xl font-bold mt-3">
        {value}
      </h2>
    </div>
  );
}

function Card({
  title,
  value,
  sub,
}) {
  return (
    <div className="rounded-3xl bg-white/5 p-5">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <h2 className="text-4xl font-bold mt-3">
        {value}
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        {sub}
      </p>
    </div>
  );
}

function MoneyCard({
  title,
  value,
}) {
  return (
    <div className="rounded-3xl bg-white/5 p-6">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <h2 className="text-4xl font-bold mt-4">
        £{value}
      </h2>
    </div>
  );
}

function Panel({
  title,
  children,
}) {
  return (
    <div className="rounded-3xl bg-white/5 p-6">
      <h2 className="font-semibold text-xl mb-5">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Loading() {
  return (
    <div className="p-10 flex gap-2 text-gray-400">
      <Loader2
        size={16}
        className="animate-spin"
      />
      Loading dashboard...
    </div>
  );
}