// src/pages/Dashboard.js
// FIELDSYNC PREMIUM DASHBOARD
// FULL FIXED VERSION
// ✅ No double sidebar
// ✅ Real data only
// ✅ Working wages
// ✅ Live map
// ✅ Cleaner layout
// ✅ Exact premium style
// ✅ Copy / Paste Ready

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

import {
  userAPI,
  shiftAPI,
  holidayAPI,
  billingAPI,
  scheduleAPI,
} from "../services/api";

import {
  Loader2,
  Search,
  Bell,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
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

  return <PremiumDashboard user={user} />;
}

/* ================================================= */

function PremiumDashboard({ user }) {
  const [loading, setLoading] = useState(true);

  const [staff, setStaff] = useState([]);
  const [live, setLive] = useState([]);
  const [leave, setLeave] = useState([]);
  const [plan, setPlan] = useState("free");
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    try {
      const [
        users,
        active,
        holidays,
        billing,
        rota,
      ] = await Promise.all([
        userAPI.getAll(),
        shiftAPI.getActiveAll(),
        holidayAPI.getAll(),
        billingAPI.getStatus(),
        scheduleAPI.getAll(),
      ]);

      setStaff(users || []);
      setLive(active || []);
      setLeave(holidays || []);
      setPlan(billing?.plan || "free");
      setShifts(rota || []);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const employees = staff.length;
  const clockedIn = live.length;

  const onLeave = leave.filter(
    (x) =>
      x.status === "approved" &&
      x.start_date <= today &&
      x.end_date >= today
  ).length;

  const absent =
    employees - clockedIn - onLeave > 0
      ? employees - clockedIn - onLeave
      : 0;

  const attendanceData = [
    { name: "Present", value: clockedIn },
    { name: "Absent", value: absent },
    { name: "Leave", value: onLeave },
  ];

  const todayWages = calcTodayWages(
    live,
    staff
  );

  const weekWages = calcWeekWages(
    staff
  );

  const upcoming = shifts
    .filter((x) => x.date >= today)
    .slice(0, 4);

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">

      {/* SIDEBAR */}
      <aside className="w-[250px] border-r border-white/5 p-6 space-y-8">

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xl">
            F
          </div>

          <div>
            <h1 className="font-bold text-xl">
              FieldSync
            </h1>
            <p className="text-xs text-gray-400">
              Premium
            </p>
          </div>
        </div>

        <Nav />

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="font-medium">
            {user.name}
          </p>
          <p className="text-sm text-gray-400">
            {user.role}
          </p>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 space-y-6 overflow-auto">

        {/* TOP */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">
              Dashboard
            </p>

            <h1 className="text-3xl font-bold mt-1">
              Welcome back, {user.name}
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center">
              <Search size={18} />
            </button>

            <button className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center">
              <Bell size={18} />
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-4">

          <MoneyCard
            title="Today's Wages"
            value={todayWages}
          />

          <MoneyCard
            title="Weekly Wages"
            value={weekWages}
          />

          <Stat
            title="Employees"
            value={employees}
          />

          <Stat
            title="Plan"
            value={plan}
          />
        </div>

        {/* MID */}
        <div className="grid grid-cols-2 gap-4">

          {/* GRAPH */}
          <Panel title="Workforce Status">
            <div className="h-[340px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={attendanceData}
                    dataKey="value"
                    innerRadius={80}
                    outerRadius={115}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#facc15" />
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <Mini
                label="Present"
                value={clockedIn}
                color="bg-green-500"
              />
              <Mini
                label="Absent"
                value={absent}
                color="bg-red-500"
              />
              <Mini
                label="Leave"
                value={onLeave}
                color="bg-yellow-400"
              />
            </div>
          </Panel>

          {/* MAP */}
          <Panel title="Live Staff Map">
            <LiveMap live={live} />
          </Panel>
        </div>

        {/* LOWER */}
        <div className="grid grid-cols-1">
          <Panel title="Upcoming Schedule">
            <div className="space-y-4">
              {upcoming.map((x) => (
                <div
                  key={x.id}
                  className="flex justify-between border-b border-white/5 pb-3"
                >
                  <span>
                    {x.title || "Shift"}
                  </span>

                  <span className="text-gray-400">
                    {x.date}
                  </span>
                </div>
              ))}

              {!upcoming.length && (
                <p className="text-gray-500">
                  No upcoming shifts
                </p>
              )}
            </div>
          </Panel>
        </div>

      </main>
    </div>
  );
}

/* ================================================= */

function calcTodayWages(live, staff) {
  let total = 0;

  live.forEach((x) => {
    const worker = staff.find(
      (u) => u.id === x.user_id
    );

    const rate = Number(
      worker?.hourly_rate || 0
    );

    if (!rate) return;

    const start = new Date(
      x.clock_in_time
    );

    const hours =
      (Date.now() - start) / 3600000;

    total += rate * hours;
  });

  return total.toFixed(2);
}

function calcWeekWages(staff) {
  const total = staff.reduce(
    (sum, x) =>
      sum +
      Number(x.week_hours || 0) *
        Number(x.hourly_rate || 0),
    0
  );

  return total.toFixed(2);
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
        Number(points[0].latitude),
        Number(points[0].longitude),
      ]
    : [51.5072, -0.1276];

  return (
    <div className="h-[420px] rounded-2xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={11}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {points.map((x) => (
          <Marker
            key={x.id}
            position={[
              Number(x.latitude),
              Number(x.longitude),
            ]}
          >
            <Popup>
              {x.users?.name || "Staff"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

/* ================================================= */

function Nav() {
  const items = [
    "Dashboard",
    "Employees",
    "Schedule",
    "Locations",
    "Holiday",
    "Timesheet",
    "Reports",
    "Billing",
  ];

  return (
    <div className="space-y-2">
      {items.map((x, i) => (
        <div
          key={x}
          className={`px-4 py-3 rounded-2xl cursor-pointer ${
            i === 0
              ? "bg-indigo-600"
              : "hover:bg-white/5"
          }`}
        >
          {x}
        </div>
      ))}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-3xl bg-white/5 p-6">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <h2 className="text-4xl font-bold mt-4">
        {value}
      </h2>
    </div>
  );
}

function MoneyCard({ title, value }) {
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

function Panel({ title, children }) {
  return (
    <div className="rounded-3xl bg-white/5 p-6">
      <h2 className="font-semibold text-lg mb-5">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Mini({
  label,
  value,
  color,
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full ${color}`}
      />
      <span className="text-gray-400">
        {label}
      </span>
      <span className="ml-auto">
        {value}
      </span>
    </div>
  );
}

function Loading() {
  return (
    <div className="p-10 flex gap-2 text-gray-400 items-center">
      <Loader2
        size={16}
        className="animate-spin"
      />
      Loading dashboard...
    </div>
  );
}