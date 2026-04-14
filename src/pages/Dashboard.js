// src/pages/Dashboard.js
// FULL FIXED PRO VERSION
// Restored live map + fixed charts + real APIs + dark UI

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  shiftAPI,
  scheduleAPI,
  holidayAPI,
  reportAPI,
  billingAPI,
} from "../services/api";

import {
  Users,
  Clock3,
  CalendarDays,
  CreditCard,
  Activity,
  Briefcase,
  Plane,
  CheckCircle2,
  RefreshCw,
  Loader2,
  MapPin,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
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
  const { user } = useAuth();

  if (!user) return <Loading />;

  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  if (user.role === "manager") {
    return <ManagerDashboard />;
  }

  return <EmployeeDashboard />;
}

/* ================================================= */
/* EMPLOYEE */
/* ================================================= */

function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [shift, setShift] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [a, b, c] = await Promise.all([
        shiftAPI.getActive(),
        scheduleAPI.getMine(),
        holidayAPI.getMine(),
      ]);

      setShift(a || null);
      setSchedule(b || []);
      setHolidays(c || []);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <Title
        title="Welcome Back"
        sub="Your workspace"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <Card
          title="Status"
          value={shift ? "Clocked In" : "Offline"}
          icon={<Clock3 size={16} />}
        />

        <Card
          title="Upcoming Shifts"
          value={schedule.length}
          icon={<CalendarDays size={16} />}
        />

        <Card
          title="Holiday Requests"
          value={holidays.length}
          icon={<Plane size={16} />}
        />

        <Card
          title="Today"
          value={new Date().toLocaleDateString()}
          icon={<Activity size={16} />}
        />
      </div>
    </div>
  );
}

/* ================================================= */
/* MANAGER */
/* ================================================= */

function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await reportAPI.getSummary();
      setStats(data || {});
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  const taskData = [
    {
      name: "Open",
      value:
        (stats.tasks || 0) -
        (stats.completedTasks || 0),
    },
    {
      name: "Done",
      value:
        stats.completedTasks || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <Title
        title="Manager Dashboard"
        sub="Operations overview"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <Card
          title="Employees"
          value={stats.users || 0}
          icon={<Users size={16} />}
        />

        <Card
          title="Tasks"
          value={stats.tasks || 0}
          icon={<Briefcase size={16} />}
        />

        <Card
          title="Live Staff"
          value={stats.activeUsers || 0}
          icon={<Clock3 size={16} />}
        />

        <Card
          title="Completed"
          value={stats.completedTasks || 0}
          icon={<CheckCircle2 size={16} />}
        />
      </div>

      <Panel title="Task Status">
        <ChartBox>
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={taskData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#6366f1"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </Panel>
    </div>
  );
}

/* ================================================= */
/* ADMIN */
/* ================================================= */

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [plan, setPlan] = useState("free");
  const [updated, setUpdated] = useState("");
  const [liveStaff, setLiveStaff] = useState([]);

  useEffect(() => {
    load();

    const timer = setInterval(load, 15000);

    return () => clearInterval(timer);
  }, []);

  async function load() {
    try {
      const [summary, bill, shifts] =
        await Promise.all([
          reportAPI.getSummary(),
          billingAPI.getStatus(),
          shiftAPI.getActiveAll(),
        ]);

      setStats(summary || {});
      setPlan(bill?.plan || "free");
      setLiveStaff(shifts || []);
      setUpdated(
        new Date().toLocaleTimeString()
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  const attendance =
    stats.users > 0
      ? Math.round(
          ((stats.activeUsers || 0) /
            stats.users) *
            100
        )
      : 0;

  const pieData = [
    {
      name: "Present",
      value: attendance,
    },
    {
      name: "Away",
      value: 100 - attendance,
    },
  ];

  const chartData = [
    {
      name: "Users",
      value: stats.users || 0,
    },
    {
      name: "Tasks",
      value: stats.tasks || 0,
    },
    {
      name: "Live",
      value: stats.activeUsers || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <Title
        title="Admin Dashboard"
        sub="Business overview"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <Card
          title="Staff"
          value={stats.users || 0}
          icon={<Users size={16} />}
        />

        <Card
          title="Tasks"
          value={stats.tasks || 0}
          icon={<Briefcase size={16} />}
        />

        <Card
          title="Clocked In"
          value={stats.activeUsers || 0}
          icon={<Clock3 size={16} />}
        />

        <Card
          title="Plan"
          value={plan}
          icon={<CreditCard size={16} />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Business Activity">
          <ChartBox>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Attendance">
          <ChartBox>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={80}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#1e293b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>

          <p className="text-center text-2xl font-semibold">
            {attendance}%
          </p>
        </Panel>

        <Panel title="Live Staff">
          <div className="space-y-3 max-h-[300px] overflow-auto">
            {liveStaff.length === 0 && (
              <p className="text-gray-400">
                No active staff
              </p>
            )}

            {liveStaff.map((row) => (
              <div
                key={row.id}
                className="border border-white/10 rounded-xl p-3"
              >
                <p className="font-medium">
                  {row.users?.name ||
                    row.users?.email ||
                    "Staff"}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Clocked in
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Live Map View">
        <div className="h-[420px] rounded-2xl overflow-hidden">
          <MapContainer
            center={[52.63, 1.29]}
            zoom={10}
            style={{
              height: "100%",
              width: "100%",
            }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {liveStaff.map((staff) => {
              if (
                !staff.latitude ||
                !staff.longitude
              )
                return null;

              return (
                <Marker
                  key={staff.id}
                  position={[
                    staff.latitude,
                    staff.longitude,
                  ]}
                >
                  <Popup>
                    {staff.users?.name ||
                      "Employee"}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </Panel>

      <Panel title="Live Updates">
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <RefreshCw size={14} />
          Last refresh {updated}
        </div>
      </Panel>
    </div>
  );
}

/* ================================================= */
/* COMPONENTS */
/* ================================================= */

function Loading() {
  return (
    <div className="text-gray-400 flex items-center gap-2">
      <Loader2
        size={16}
        className="animate-spin"
      />
      Loading dashboard...
    </div>
  );
}

function Title({ title, sub }) {
  return (
    <div>
      <h1 className="text-3xl font-semibold">
        {title}
      </h1>

      <p className="text-sm text-gray-400 mt-1">
        {sub}
      </p>
    </div>
  );
}

function Card({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] p-5">
      <div className="flex justify-between">
        <p className="text-xs text-gray-400">
          {title}
        </p>

        <div className="text-indigo-400">
          {icon}
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-3 capitalize">
        {value}
      </h2>
    </div>
  );
}

function Panel({
  title,
  children,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] p-6">
      <h2 className="font-semibold mb-4">
        {title}
      </h2>

      {children}
    </div>
  );
}

function ChartBox({
  children,
}) {
  return (
    <div className="h-[260px] min-w-0">
      {children}
    </div>
  );
}