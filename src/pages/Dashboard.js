// src/pages/Dashboard.js
// FIELDSYNC PREMIUM DASHBOARD v1
// COPY / PASTE READY
// ✅ Premium modern UI
// ✅ Real data only
// ✅ No fake stats
// ✅ No NaN wages
// ✅ Live map always visible
// ✅ Smart insights
// ✅ Employee / Manager / Admin modes
// ✅ Existing APIs used
// ✅ Clean enterprise style

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import {
  shiftAPI,
  holidayAPI,
  reportAPI,
  billingAPI,
  taskAPI,
  userAPI,
} from "../services/api";

import {
  Users,
  Clock3,
  Briefcase,
  Plane,
  CreditCard,
  PoundSterling,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
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

  return <MainDashboard user={user} admin={user.role === "admin"} />;
}

/* ================================================= */
/* EMPLOYEE */
/* ================================================= */

function EmployeeDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [shift, setShift] = useState(null);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [a, b, c] = await Promise.all([
        shiftAPI.getActive(),
        taskAPI.getAll(),
        holidayAPI.getMine(),
      ]);

      setShift(a || null);
      setTasks(Array.isArray(b) ? b : []);
      setHolidays(Array.isArray(c) ? c : []);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <Hero
        title={`Good morning, ${user.name}`}
        subtitle="Here's your workday overview."
      />

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          title="Status"
          value={shift ? "Clocked In" : "Off Duty"}
          icon={<Clock3 size={18} />}
        />

        <StatCard
          title="Tasks"
          value={tasks.length}
          icon={<Briefcase size={18} />}
        />

        <StatCard
          title="Completed"
          value={tasks.filter((x) => x.completed).length}
          icon={<CheckCircle2 size={18} />}
        />

        <StatCard
          title="Holiday Requests"
          value={holidays.length}
          icon={<Plane size={18} />}
        />
      </div>

      <QuickActions
        items={[
          ["/tasks", "My Tasks"],
          ["/timesheet", "My Hours"],
          ["/holidays", "My Holidays"],
        ]}
      />
    </div>
  );
}

/* ================================================= */
/* MAIN */
/* ================================================= */

function MainDashboard({ user, admin }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [staff, setStaff] = useState([]);
  const [live, setLive] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [plan, setPlan] = useState("free");
  const [updated, setUpdated] = useState("");

  useEffect(() => {
    load();

    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    try {
      const req = [
        reportAPI.getSummary(),
        userAPI.getAll(),
        shiftAPI.getActiveAll(),
        taskAPI.getAll(),
        holidayAPI.getAll(),
      ];

      if (admin) req.push(billingAPI.getStatus());

      const res = await Promise.all(req);

      setStats(res[0] || {});
      setStaff(Array.isArray(res[1]) ? res[1] : []);
      setLive(Array.isArray(res[2]) ? res[2] : []);
      setTasks(Array.isArray(res[3]) ? res[3] : []);
      setHolidays(Array.isArray(res[4]) ? res[4] : []);

      if (admin) setPlan(res[5]?.plan || "free");

      setUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  const totalUsers = Number(stats.users || staff.length || 0);
  const activeUsers = Number(stats.activeUsers || live.length || 0);

  const attendance =
    totalUsers > 0
      ? Math.round((activeUsers / totalUsers) * 100)
      : 0;

  const todayWages = Number(stats.todayWages || 0);
  const weekWages = Number(stats.weekWages || 0);

  const safeToday = isNaN(todayWages) ? 0 : todayWages;
  const safeWeek = isNaN(weekWages) ? 0 : weekWages;

  const paid = staff.filter(
    (x) => Number(x.hourly_rate || 0) > 0
  ).length;

  const missingRates = staff.length - paid;

  const overContract = staff.filter(
    (x) =>
      Number(x.contracted_hours || 0) > 0 &&
      Number(x.week_hours || 0) >
        Number(x.contracted_hours || 0)
  ).length;

  const pendingLeave = holidays.filter(
    (x) => x.status === "pending"
  ).length;

  const openTasks = tasks.filter(
    (x) => !x.completed
  ).length;

  const wageData = [
    { name: "Today", value: safeToday },
    { name: "Week", value: safeWeek },
  ];

  const pieData = [
    { name: "Present", value: attendance },
    { name: "Away", value: 100 - attendance },
  ];

  const insights = [];

  if (missingRates > 0)
    insights.push(
      `${missingRates} staff missing pay rates`
    );

  if (overContract > 0)
    insights.push(
      `${overContract} staff over contracted hours`
    );

  if (pendingLeave > 0)
    insights.push(
      `${pendingLeave} leave requests pending`
    );

  if (openTasks > 0)
    insights.push(`${openTasks} open tasks remain`);

  return (
    <div className="space-y-6">
      <Hero
        title={`Good morning, ${user.name}`}
        subtitle="Here’s what’s happening with your workforce today."
      />

      {/* KPI */}
      <div className="grid xl:grid-cols-5 md:grid-cols-3 gap-4">
        <StatCard
          title="Employees"
          value={totalUsers}
          icon={<Users size={18} />}
        />

        <StatCard
          title="Clocked In"
          value={activeUsers}
          icon={<Clock3 size={18} />}
        />

        <StatCard
          title="Open Tasks"
          value={openTasks}
          icon={<Briefcase size={18} />}
        />

        <StatCard
          title="Attendance"
          value={`${attendance}%`}
          icon={<TrendingUp size={18} />}
        />

        <StatCard
          title="Plan"
          value={plan}
          icon={<CreditCard size={18} />}
        />
      </div>

      {/* PAYROLL */}
      <div className="grid md:grid-cols-2 gap-4">
        <BigCard
          title="Today's Wages"
          value={`£${safeToday.toFixed(2)}`}
          sub="Live labour spend today"
          icon={<PoundSterling size={18} />}
        />

        <BigCard
          title="Weekly Wages"
          value={`£${safeWeek.toFixed(2)}`}
          sub="Current week total"
          icon={<CreditCard size={18} />}
        />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Wage Trend">
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wageData}>
                <CartesianGrid
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#4f46e5"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Attendance">
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>

          <p className="text-center text-3xl font-bold">
            {attendance}%
          </p>
        </Panel>
      </div>

      {/* MAP */}
      <Panel title="Live Map Tracking">
        <LiveMap live={live} />
      </Panel>

      {/* INSIGHTS */}
      <Panel title="Business Insights">
        <div className="space-y-3">
          {insights.length === 0 && (
            <p className="text-gray-400 text-sm">
              No critical alerts.
            </p>
          )}

          {insights.map((x, i) => (
            <div
              key={i}
              className="rounded-xl bg-amber-500/10 text-amber-300 px-4 py-3 text-sm flex items-center gap-2"
            >
              <AlertTriangle size={16} />
              {x}
            </div>
          ))}
        </div>
      </Panel>

      {/* QUICK LINKS */}
      <QuickActions
        items={[
          ["/employees", "Employees"],
          ["/schedule", "Schedule"],
          ["/timesheet", "Timesheets"],
          ["/reports", "Reports"],
        ]}
      />

      {/* UPDATE */}
      <Panel title="Live Updates">
        <div className="text-sm text-gray-400 flex gap-2 items-center">
          <RefreshCw size={14} />
          Last refresh {updated}
        </div>
      </Panel>
    </div>
  );
}

/* ================================================= */
/* MAP */
/* ================================================= */

function LiveMap({ live }) {
  const points = useMemo(
    () =>
      (live || []).filter(
        (x) =>
          x.latitude &&
          x.longitude &&
          !isNaN(Number(x.latitude)) &&
          !isNaN(Number(x.longitude))
      ),
    [live]
  );

  const center = points.length
    ? [
        Number(points[0].latitude),
        Number(points[0].longitude),
      ]
    : [51.509, -0.12];

  return (
    <div className="relative h-[420px] rounded-2xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={10}
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

      {!points.length && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] bg-black/70 px-4 py-2 rounded-xl text-sm">
          No staff currently clocked in
        </div>
      )}
    </div>
  );
}

/* ================================================= */
/* UI */
/* ================================================= */

function Hero({ title, subtitle }) {
  return (
    <div className="rounded-3xl p-8 bg-gradient-to-r from-indigo-600/20 to-slate-800 border border-white/10">
      <h1 className="text-4xl font-bold">
        {title}
      </h1>
      <p className="text-gray-300 mt-2">
        {subtitle}
      </p>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#020617] p-5 hover:border-indigo-500/40 transition">
      <div className="flex justify-between">
        <p className="text-sm text-gray-400">
          {title}
        </p>
        <div className="text-indigo-400">
          {icon}
        </div>
      </div>

      <h2 className="text-3xl font-bold mt-4">
        {value}
      </h2>
    </div>
  );
}

function BigCard({
  title,
  value,
  sub,
  icon,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#020617] p-6">
      <div className="flex justify-between">
        <p className="text-sm text-gray-400">
          {title}
        </p>
        <div className="text-indigo-400">
          {icon}
        </div>
      </div>

      <h2 className="text-5xl font-bold mt-4">
        {value}
      </h2>

      <p className="text-xs text-gray-500 mt-3">
        {sub}
      </p>
    </div>
  );
}

function QuickActions({ items }) {
  return (
    <Panel title="Quick Actions">
      <div className="grid md:grid-cols-4 gap-3">
        {items.map(([to, label]) => (
          <Link
            key={to}
            to={to}
            className="rounded-2xl bg-white/5 hover:bg-white/10 p-4 text-center"
          >
            {label}
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#020617] p-6">
      <h2 className="font-semibold text-lg mb-5">
        {title}
      </h2>
      {children}
    </div>
  );
}

function ChartBox({ children }) {
  return (
    <div className="h-[260px] w-full min-w-0">
      {children}
    </div>
  );
}

function Loading() {
  return (
    <div className="text-gray-400 flex gap-2 items-center">
      <Loader2
        size={16}
        className="animate-spin"
      />
      Loading dashboard...
    </div>
  );
}