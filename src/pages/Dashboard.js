import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

import {
  Users,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Megaphone,
  Sparkles,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth() || {};

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({});
  const [hours, setHours] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [aiFeed, setAiFeed] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);

      const [dashRes, msgRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/announcements"),
      ]);

      const data = dashRes?.data || {};

      setStats(data.stats || {});
      setHours(data.trends?.hours || []);
      setTopUsers(data.topPerformers || []);
      setActivity(data.activity || []);
      setAiFeed(data.aiFeed || []);
      setAnnouncements(msgRes?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const go = (path) => navigate(path);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-36 rounded-3xl bg-white/5 animate-pulse" />
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ALERTS */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border px-5 py-4 ${
                item.priority === "critical"
                  ? "bg-red-500/10 border-red-500/30"
                  : item.priority === "warning"
                  ? "bg-yellow-500/10 border-yellow-500/30"
                  : "bg-indigo-500/10 border-indigo-500/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <Megaphone size={16} />
                    {item.title}
                  </p>

                  <p className="text-sm text-gray-300 mt-1">
                    {item.message}
                  </p>
                </div>

                {(user?.role === "admin" ||
                  user?.role === "manager") && (
                  <button
                    onClick={() =>
                      go("/announcements")
                    }
                    className="text-xs px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                  >
                    Manage
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HERO */}
      <div className="grid xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 rounded-3xl border border-white/10 p-7 bg-gradient-to-br from-indigo-600/20 via-cyan-500/10 to-transparent">
          <p className="text-xs uppercase tracking-[0.22em] text-indigo-300">
            Workforce Command Center
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold mt-3">
            Welcome back,{" "}
            {user?.name || "there"}
          </h1>

          <p className="text-gray-400 mt-3 max-w-2xl">
            Live overview of staff,
            productivity, schedules and
            operational alerts.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            <QuickMini
              label="Active Staff"
              value={stats.activeShifts || 0}
            />
            <QuickMini
              label="Late Today"
              value={stats.late || 0}
            />
            <QuickMini
              label="Open Tasks"
              value={stats.tasks || 0}
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <ActionBtn
              label="Add Employee"
              onClick={() =>
                go("/employees")
              }
            />
            <ActionBtn
              label="Create Shift"
              onClick={() =>
                go("/schedule")
              }
            />
            <ActionBtn
              label="Tasks"
              onClick={() =>
                go("/tasks")
              }
            />
          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="rounded-3xl border border-white/10 bg-[#020617]/80 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles
              size={16}
              className="text-indigo-400"
            />
            <h3 className="font-semibold">
              AI Operations Feed
            </h3>
          </div>

          <div className="space-y-3">
            {aiFeed.length === 0 && (
              <div className="text-sm text-gray-400">
                No issues detected today.
              </div>
            )}

            {aiFeed.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-3 text-sm"
              >
                {item}
              </div>
            ))}
          </div>

          <button
            onClick={logout}
            className="mt-6 w-full rounded-2xl py-3 bg-red-500/15 hover:bg-red-500/25 text-red-300"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI
          title="Users"
          value={stats.users}
          icon={Users}
        />
        <KPI
          title="Hours Today"
          value={stats.hoursToday}
          icon={Clock3}
        />
        <KPI
          title="Completed Tasks"
          value={stats.tasks}
          icon={CheckCircle2}
        />
        <KPI
          title="Issues"
          value={stats.issues}
          icon={AlertTriangle}
        />
      </div>

      {/* CHARTS */}
      <div className="grid xl:grid-cols-2 gap-5">
        <Card title="Weekly Hours">
          <ResponsiveContainer
            width="100%"
            height={260}
          >
            <AreaChart data={hours}>
              <defs>
                <linearGradient
                  id="fillHours"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#6366f1"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="100%"
                    stopColor="#6366f1"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#1f2937"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={11}
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="hours"
                stroke="#6366f1"
                fill="url(#fillHours)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Productivity">
          <ResponsiveContainer
            width="100%"
            height={260}
          >
            <BarChart data={topUsers}>
              <CartesianGrid
                stroke="#1f2937"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={11}
              />

              <Tooltip />

              <Bar
                dataKey="shifts"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* LOWER GRID */}
      <div className="grid xl:grid-cols-2 gap-5">
        <Card title="Recent Workforce Activity">
          <div className="space-y-3">
            {activity.length === 0 && (
              <p className="text-sm text-gray-400">
                No recent activity
              </p>
            )}

            {activity.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${a.name}`}
                  alt={a.name}
                  className="w-10 h-10 rounded-full"
                />

                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {a.name}
                  </p>

                  <p className="text-xs text-gray-400">
                    {a.action}
                  </p>
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-gray-500"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Quick Access">
          <div className="grid sm:grid-cols-2 gap-3">
            <Shortcut
              title="Employees"
              onClick={() =>
                go("/employees")
              }
            />
            <Shortcut
              title="Schedule"
              onClick={() =>
                go("/schedule")
              }
            />
            <Shortcut
              title="Tasks"
              onClick={() =>
                go("/tasks")
              }
            />
            <Shortcut
              title="Reports"
              onClick={() =>
                go("/reports")
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

/* COMPONENTS */

function KPI({
  title,
  value,
  icon: Icon,
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/10 bg-[#020617]/80 p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {title}
        </p>

        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
          <Icon
            size={18}
            className="text-indigo-400"
          />
        </div>
      </div>

      <h2 className="text-3xl font-semibold mt-4">
        {value || 0}
      </h2>
    </motion.div>
  );
}

function Card({
  title,
  children,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#020617]/80 p-5">
      <h3 className="text-sm font-semibold mb-4">
        {title}
      </h3>

      {children}
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition text-sm font-medium"
    >
      {label}
    </button>
  );
}

function QuickMini({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="text-2xl font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}

function Shortcut({
  title,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl bg-white/5 border border-white/10 p-4 text-left hover:bg-white/10 transition"
    >
      <p className="font-medium">
        {title}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        Open module
      </p>
    </button>
  );
}