// src/pages/Dashboard.js
// FIELDSYNC PREMIUM DASHBOARD
// EXACT LAYOUT VERSION
// Real data only
// Copy / Paste Ready

import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import {
  userAPI,
  shiftAPI,
  holidayAPI,
  billingAPI,
  scheduleAPI,
} from "../services/api";

import {
  Users,
  Clock3,
  Plane,
  MapPin,
  CreditCard,
  Loader2,
  Search,
  Bell,
  LogOut,
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

      setStaff(Array.isArray(users) ? users : []);
      setLive(Array.isArray(active) ? active : []);
      setLeave(Array.isArray(holidays) ? holidays : []);
      setPlan(billing?.plan || "free");
      setShifts(Array.isArray(rota) ? rota : []);
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

  const locations = live.filter(
    (x) => x.latitude && x.longitude
  ).length;

  const absent =
    employees - clockedIn - onLeave > 0
      ? employees - clockedIn - onLeave
      : 0;

  const attendanceData = [
    {
      name: "Present",
      value: clockedIn,
    },
    {
      name: "Absent",
      value: absent,
    },
    {
      name: "Leave",
      value: onLeave,
    },
  ];

  const todayWages = calcTodayWages(
    live,
    staff
  );

  const weeklyWages = calcWeekWages(
    staff
  );

  const upcoming = shifts
    .filter((x) => x.date >= today)
    .slice(0, 3);

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      {/* SIDEBAR */}
      <aside className="w-[260px] border-r border-white/5 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-yellow-500 flex items-center justify-center font-bold text-black">
              F
            </div>

            <div>
              <h1 className="font-bold text-xl">
                FieldSync
              </h1>
              <p className="text-xs text-gray-400">
                Workforce Management
              </p>
            </div>
          </div>

          <Nav />

        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="font-medium">
              {user.name}
            </p>
            <p className="text-sm text-gray-400">
              {user.role}
            </p>
          </div>

          <button className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500">
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 space-y-6 overflow-auto">
        {/* TOPBAR */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">
              Dashboard
            </p>

            <h1 className="text-3xl font-bold mt-2">
              Good morning, {user.name}
            </h1>

            <p className="text-gray-400 mt-1">
              Here's what's happening with your workforce today.
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <div className="px-4 py-3 rounded-2xl bg-white/5 flex items-center gap-2 min-w-[220px]">
              <Search size={16} />
              <span className="text-gray-400 text-sm">
                Search...
              </span>
            </div>

            <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <Bell size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold">
              {user.name?.charAt(0)}
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-5 gap-4">
          <Stat
            title="Employees"
            value={employees}
            sub="Active"
          />
          <Stat
            title="Clocked In"
            value={clockedIn}
            sub="Now"
          />
          <Stat
            title="On Leave"
            value={onLeave}
            sub="Today"
          />
          <Stat
            title="Locations"
            value={locations}
            sub="Active"
          />
          <Stat
            title="Plan"
            value={plan}
            sub="Subscription"
          />
        </div>

        {/* MID */}
        <div className="grid grid-cols-2 gap-4">
          {/* GRAPH */}
          <Panel title="Today's Attendance">
            <div className="h-[320px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={attendanceData}
                    innerRadius={75}
                    outerRadius={105}
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#facc15" />
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <Mini
                color="bg-green-500"
                label="Present"
                value={clockedIn}
              />
              <Mini
                color="bg-red-500"
                label="Absent"
                value={absent}
              />
              <Mini
                color="bg-yellow-400"
                label="Leave"
                value={onLeave}
              />
            </div>
          </Panel>

          {/* MAP */}
          <Panel title="Live Map Tracking">
            <LiveMap live={live} />
          </Panel>
        </div>

        {/* LOWER */}
        <div className="grid grid-cols-3 gap-4">
          <MoneyCard
            title="Today's Wages"
            value={todayWages}
          />

          <MoneyCard
            title="Weekly Wages"
            value={weeklyWages}
          />

          <Panel title="Upcoming Schedule">
            <div className="space-y-4">
              {upcoming.map((x) => (
                <div key={x.id}>
                  <p className="font-medium">
                    {x.title || "Shift"}
                  </p>

                  <p className="text-sm text-gray-400">
                    {x.date}
                  </p>
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
    const user = staff.find(
      (u) => u.id === x.user_id
    );

    const rate = Number(
      user?.hourly_rate || 0
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
  return staff
    .reduce(
      (sum, x) =>
        sum +
        Number(
          x.week_hours || 0
        ) *
          Number(
            x.hourly_rate || 0
          ),
      0
    )
    .toFixed(2);
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
    <div className="h-[380px] rounded-2xl overflow-hidden">
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
              {x.users?.name ||
                "Staff"}
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
    "Holiday Requests",
    "Timesheet",
    "Profile",
    "Reports",
    "Billing",
  ];

  return (
    <div className="space-y-2">
      {items.map((x, i) => (
        <div
          key={x}
          className={`px-4 py-3 rounded-2xl ${
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

function Stat({
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

      <p className="text-sm text-gray-500 mt-2">
        Estimated payroll cost
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
      <h2 className="font-semibold text-lg mb-5">
        {title}
      </h2>

      {children}
    </div>
  );
}

function Mini({
  color,
  label,
  value,
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
    <div className="p-10 text-gray-400 flex gap-2 items-center">
      <Loader2
        size={16}
        className="animate-spin"
      />
      Loading dashboard...
    </div>
  );
}