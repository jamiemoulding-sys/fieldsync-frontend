// src/pages/Dashboard.js
// FULL TRUE FINAL DASHBOARD
// ✅ Employee dashboard fully rebuilt
// ✅ Admin + Manager dashboard untouched
// ✅ Employee sees ONLY own data
// ✅ Real working clock in / clock out
// ✅ Uses WorkSession page
// ✅ Holiday allowance remaining
// ✅ Mobile first
// ✅ Clean premium UI
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
  ArrowRight,
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

  return <MainDashboard user={user} />;
}

/* ================================================= */
/* EMPLOYEE DASHBOARD */
/* ================================================= */

function EmployeeDashboard({ user }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeShift, setActiveShift] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    load();

    const t = setInterval(load, 15000);
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
        taskAPI?.getAll ? taskAPI.getAll() : [],
      ]);

      const mine = (allShifts || []).filter(
        (x) => String(x.user_id) === String(user.id)
      );

      const myHolidays = (allHolidays || []).filter(
        (x) => String(x.user_id) === String(user.id)
      );

      const myTasks = (allTasks || []).filter(
        (x) =>
          x.assigned_users?.includes(user.id)
      );

      const live = mine.find(
        (x) =>
          x.clock_in_time &&
          !x.clock_out_time
      );

      setActiveShift(live || null);
      setShifts(mine);
      setHolidays(myHolidays);
      setTasks(myTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  const today = new Date().toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );

  const weekHours = shifts
    .slice(-7)
    .reduce((sum, row) => {
      if (!row.clock_in_time) return sum;

      const start = new Date(
        row.clock_in_time
      );

      const end = row.clock_out_time
        ? new Date(row.clock_out_time)
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
    .reduce((sum, row) => {
      const start = new Date(
        row.start_date
      );

      const end = new Date(
        row.end_date
      );

      const days =
        Math.floor(
          (end - start) /
            86400000
        ) + 1;

      return sum + days;
    }, 0);

  const allowance =
    Number(
      user.holiday_allowance || 28
    );

  const remaining =
    allowance - approvedDays;

  const pendingTasks = tasks.filter(
    (x) => !x.completed
  ).length;

  const latestShift =
    shifts.length > 0
      ? shifts[shifts.length - 1]
      : null;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="px-4 py-5 md:px-8 space-y-5">

        {/* Header */}
        <div>
          <p className="text-sm text-gray-400">
            Dashboard
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-1">
            Good morning, {user.name}
          </h1>

          <p className="text-gray-400 mt-1">
            {today}
          </p>
        </div>

        {/* Main Clock Button */}
        <button
          onClick={() =>
            navigate("/work-session")
          }
          className="w-full rounded-3xl bg-indigo-600 py-5 text-lg font-semibold"
        >
          {activeShift
            ? "Resume Shift"
            : "Clock In / Start Shift"}
        </button>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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

          <SmallCard
            title="Profile"
            value="View Details"
            icon={
              <ArrowRight size={18} />
            }
          />

        </div>

        {/* Latest Timesheet */}
        <Panel title="Latest Timesheet">
          {latestShift ? (
            <p className="text-sm text-gray-300">
              Last shift:{" "}
              {latestShift.clock_in_time?.split(
                "T"
              )[0]}
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              No shifts yet
            </p>
          )}
        </Panel>

      </main>
    </div>
  );
}

/* ================================================= */
/* ADMIN + MANAGER */
/* ================================================= */

function MainDashboard({ user }) {
  const [loading, setLoading] =
    useState(true);

  const [staff, setStaff] =
    useState([]);

  const [live, setLive] =
    useState([]);

  const [plan, setPlan] =
    useState("trial");

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
        billing,
      ] = await Promise.all([
        userAPI.getAll(),
        shiftAPI.getActiveAll(),
        billingAPI.getStatus(),
      ]);

      setStaff(users || []);
      setLive(active || []);
      setPlan(
        billing?.plan || "trial"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  const employees =
    staff.length;

  const clockedIn =
    live.length;

  const pieData = [
    {
      name: "Present",
      value: clockedIn,
    },
    {
      name: "Absent",
      value:
        employees -
        clockedIn,
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="px-8 py-7 space-y-6">

        <div>
          <h1 className="text-4xl font-bold">
            Good morning, {user.name}
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-4">

          <Card
            title="Employees"
            value={employees}
            sub="Active"
          />

          <Card
            title="Clocked In"
            value={clockedIn}
            sub="Now"
          />

          <Card
            title="Plan"
            value={plan}
            sub="Subscription"
          />

        </div>

        <div className="grid grid-cols-2 gap-4">

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

      </main>
    </div>
  );
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