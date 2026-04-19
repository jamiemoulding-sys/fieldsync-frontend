// src/pages/Dashboard.js
// FULL FIXED BUILD VERSION
// ✅ Full file
// ✅ Duplicate user removed
// ✅ Trial banner added
// ✅ Build safe
// ✅ Keeps layout + analytics

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  userAPI,
  shiftAPI,
  holidayAPI,
  billingAPI,
} from "../services/api";

import { Loader2 } from "lucide-react";

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

  if (loading || !user) {
    return <Loading />;
  }

  return <MainDashboard user={user} />;
}

/* ================================================= */

function MainDashboard({ user }) {
  const [loading, setLoading] = useState(true);

  const [staff, setStaff] = useState([]);
  const [live, setLive] = useState([]);
  const [leave, setLeave] = useState([]);
  const [plan, setPlan] = useState("trial");
  const [allShifts, setAllShifts] = useState([]);

  useEffect(() => {
    load();

    const timer = setInterval(load, 15000);

    return () => clearInterval(timer);
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
      setPlan(billing?.plan || "trial");
      setAllShifts(shifts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const employees = staff.length;
  const clockedIn = live.length;

  const onLeave = leave.filter(
    (row) =>
      row.status === "approved" &&
      row.start_date <= today &&
      row.end_date >= today
  ).length;

  const absent =
    employees - clockedIn - onLeave > 0
      ? employees - clockedIn - onLeave
      : 0;

  const gpsActive = live.filter(
    (row) => row.latitude && row.longitude
  ).length;

  const attendance = employees
    ? Math.round((clockedIn / employees) * 100)
    : 0;

  const pieData = [
    { name: "Present", value: clockedIn },
    { name: "Absent", value: absent },
    { name: "Leave", value: onLeave },
  ];

  const todayWages = getTodayWages(
    allShifts,
    staff
  );

  const weekWages = getWeekWages(
    allShifts,
    staff
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="px-8 py-7 space-y-6">

        {/* HEADER */}
        <div>
          <p className="text-sm text-gray-400">
            Dashboard
          </p>

          <h1 className="text-4xl font-bold mt-1">
            Good morning, {user.name}
          </h1>

          <p className="text-gray-400 mt-1">
            Live workforce intelligence powered by FieldSync AI.
          </p>

          {user?.trialActive && (
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl text-yellow-300">
              Trial ends on{" "}
              {new Date(
                user.trial_end
              ).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* KPI */}
        <div className="grid grid-cols-5 gap-4">
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
            title="On Leave"
            value={onLeave}
            sub="Today"
          />

          <Card
            title="GPS Active"
            value={gpsActive}
            sub="Live"
          />

          <Card
            title="Plan"
            value={plan}
            sub="Subscription"
          />
        </div>

        {/* CHART + MAP */}
        <div className="grid grid-cols-2 gap-4">

          <Panel title="Today's Attendance">
            <div className="h-[320px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={80}
                    outerRadius={110}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#facc15" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center -mt-36 mb-16">
              <h2 className="text-4xl font-bold">
                {attendance}%
              </h2>

              <p className="text-gray-400">
                Present
              </p>
            </div>
          </Panel>

          <Panel title="Live Staff Map">
            <LiveMap live={live} />
          </Panel>

        </div>

        {/* MONEY */}
        <div className="grid grid-cols-2 gap-4">
          <MoneyCard
            title="Today's Wages"
            value={todayWages}
          />

          <MoneyCard
            title="Weekly Wages"
            value={weekWages}
          />
        </div>

      </main>
    </div>
  );
}

/* ================================================= */

function getTodayWages(shifts, staff) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  let total = 0;

  shifts.forEach((row) => {
    if (!row.clock_in_time) return;

    const date = new Date(
      row.clock_in_time
    )
      .toISOString()
      .split("T")[0];

    if (date !== today) return;

    const employee = staff.find(
      (x) => x.id === row.user_id
    );

    const rate = Number(
      employee?.hourly_rate || 0
    );

    const start = new Date(
      row.clock_in_time
    );

    const end = row.clock_out_time
      ? new Date(row.clock_out_time)
      : new Date();

    total +=
      ((end - start) / 3600000) *
      rate;
  });

  return total.toFixed(2);
}

function getWeekWages(shifts, staff) {
  const weekAgo = new Date();

  weekAgo.setDate(
    weekAgo.getDate() - 7
  );

  let total = 0;

  shifts.forEach((row) => {
    if (!row.clock_in_time) return;

    const start = new Date(
      row.clock_in_time
    );

    if (start < weekAgo) return;

    const employee = staff.find(
      (x) => x.id === row.user_id
    );

    const rate = Number(
      employee?.hourly_rate || 0
    );

    const end = row.clock_out_time
      ? new Date(row.clock_out_time)
      : new Date();

    total +=
      ((end - start) / 3600000) *
      rate;
  });

  return total.toFixed(2);
}

/* ================================================= */

function LiveMap({ live }) {
  const points = live.filter(
    (row) =>
      row.latitude &&
      row.longitude
  );

  const center = points.length
    ? [
        Number(points[0].latitude),
        Number(points[0].longitude),
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
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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