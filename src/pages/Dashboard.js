import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  shiftAPI,
  scheduleAPI,
  holidayAPI,
  userAPI,
  reportAPI,
  taskAPI,
} from "../services/api";

import {
  Clock3,
  Users,
  CalendarDays,
  Plane,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Briefcase,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const role = user?.role || "employee";

  if (role === "admin") return <AdminDashboard />;
  if (role === "manager") return <ManagerDashboard />;

  return <EmployeeDashboard />;
}

/* ======================================================
EMPLOYEE
====================================================== */

function EmployeeDashboard() {
  const [activeShift, setActiveShift] =
    useState(null);

  const [schedule, setSchedule] =
    useState([]);

  const [holidays, setHolidays] =
    useState([]);

  const [worked, setWorked] =
    useState(0);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let timer;

    if (activeShift?.clock_in_time) {
      timer = setInterval(() => {
        const now = Date.now();

        const start = new Date(
          activeShift.clock_in_time
        ).getTime();

        const savedBreak =
          activeShift.total_break_seconds ||
          0;

        const liveBreak =
          activeShift.break_started_at
            ? Math.floor(
                (now -
                  new Date(
                    activeShift.break_started_at
                  ).getTime()) / 1000
              )
            : 0;

        const sec =
          Math.floor(
            (now - start) / 1000
          ) -
          savedBreak -
          liveBreak;

        setWorked(sec > 0 ? sec : 0);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [activeShift]);

  const load = async () => {
    const [shift, rota, leave] =
      await Promise.all([
        shiftAPI.getActive(),
        scheduleAPI.getMine(),
        holidayAPI.getMine(),
      ]);

    setActiveShift(shift);
    setSchedule(rota || []);
    setHolidays(leave || []);
  };

  const today =
    new Date().toISOString().split("T")[0];

  const todayShift = schedule.find(
    (s) => s.date === today
  );

  return (
    <div className="space-y-6">
      <Header
        title="Welcome Back"
        sub="Your employee overview"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <Card
          title="Status"
          value={
            activeShift
              ? "Clocked In"
              : "Offline"
          }
          icon={<Clock3 size={16} />}
        />

        <Card
          title="Worked Today"
          value={formatTime(worked)}
          icon={
            <CheckCircle2 size={16} />
          }
        />

        <Card
          title="My Shifts"
          value={schedule.length}
          icon={
            <CalendarDays size={16} />
          }
        />

        <Card
          title="Leave Requests"
          value={holidays.length}
          icon={<Plane size={16} />}
        />
      </div>

      <Panel title="Today's Shift">
        {todayShift ? (
          <p className="text-xl font-semibold">
            {time(todayShift.start_time)} -{" "}
            {time(todayShift.end_time)}
          </p>
        ) : (
          <p className="text-gray-400">
            No shift scheduled today
          </p>
        )}
      </Panel>
    </div>
  );
}

/* ======================================================
MANAGER
====================================================== */

function ManagerDashboard() {
  const [users, setUsers] =
    useState([]);

  const [schedule, setSchedule] =
    useState([]);

  const [holidays, setHolidays] =
    useState([]);

  const [liveUsers, setLiveUsers] =
    useState(0);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [u, s, h, stats] =
      await Promise.all([
        userAPI.getAll(),
        scheduleAPI.getAll(),
        holidayAPI.getAll(),
        reportAPI.getSummary(),
      ]);

    setUsers(u || []);
    setSchedule(s || []);
    setHolidays(h || []);
    setLiveUsers(
      stats?.activeUsers || 0
    );
  };

  const today =
    new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <Header
        title="Manager Dashboard"
        sub="Team performance & planning"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <Card
          title="Employees"
          value={users.length}
          icon={<Users size={16} />}
        />

        <Card
          title="Today's Shifts"
          value={
            schedule.filter(
              (x) => x.date === today
            ).length
          }
          icon={
            <CalendarDays size={16} />
          }
        />

        <Card
          title="Pending Leave"
          value={
            holidays.filter(
              (x) =>
                x.status ===
                "pending"
            ).length
          }
          icon={<Plane size={16} />}
        />

        <Card
          title="Clocked In"
          value={liveUsers}
          icon={
            <Clock3 size={16} />
          }
        />
      </div>
    </div>
  );
}

/* ======================================================
ADMIN
====================================================== */

function AdminDashboard() {
  const [stats, setStats] =
    useState({
      users: 0,
      tasks: 0,
      activeUsers: 0,
    });

  const [leave, setLeave] =
    useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [summary, holidays] =
      await Promise.all([
        reportAPI.getSummary(),
        holidayAPI.getAll(),
      ]);

    setStats(summary || {});
    setLeave(holidays || []);
  };

  const pendingLeave =
    leave.filter(
      (x) =>
        x.status === "pending"
    ).length;

  return (
    <div className="space-y-6">
      <Header
        title="Admin Dashboard"
        sub="Full business overview"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <Card
          title="Total Staff"
          value={stats.users || 0}
          icon={<Users size={16} />}
        />

        <Card
          title="Open Tasks"
          value={stats.tasks || 0}
          icon={
            <Briefcase size={16} />
          }
        />

        <Card
          title="Live Users"
          value={
            stats.activeUsers || 0
          }
          icon={<Clock3 size={16} />}
        />

        <Card
          title="Pending Leave"
          value={pendingLeave}
          icon={
            <AlertTriangle size={16} />
          }
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel title="Business Status">
          <p className="text-green-400 font-medium">
            Systems Operational
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Staffing and attendance
            data updating live.
          </p>
        </Panel>

        <Panel title="Growth">
          <p className="text-xl font-semibold">
            Stable
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Active users and staffing
            levels steady.
          </p>
        </Panel>
      </div>
    </div>
  );
}

/* ======================================================
UI
====================================================== */

function Header({
  title,
  sub,
}) {
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

function Card({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] p-5">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-400">
          {title}
        </p>

        <div className="text-indigo-400">
          {icon}
        </div>
      </div>

      <h3 className="text-2xl font-semibold mt-3">
        {value}
      </h3>
    </div>
  );
}

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor(
    (sec % 3600) / 60
  );
  const s = sec % 60;

  return `${String(h).padStart(
    2,
    "0"
  )}:${String(m).padStart(
    2,
    "0"
  )}:${String(s).padStart(
    2,
    "0"
  )}`;
}

function time(date) {
  return new Date(date).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}