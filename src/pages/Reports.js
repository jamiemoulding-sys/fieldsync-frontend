import { useEffect, useMemo, useState } from "react";
import { reportAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  CalendarDays,
  CheckSquare,
  TrendingUp,
  Crown,
  AlertCircle,
  RefreshCw,
  Download,
  Search,
} from "lucide-react";

export default function Reports() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    totalShifts: 0,
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeUsers: 0,
    hoursWorked: 0,
    employees: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (user?.role === "admin" && user?.isPro) {
      loadReports();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await reportAPI.getTimesheets();

      setData({
        totalShifts: res?.totalShifts || 0,
        totalUsers: res?.totalUsers || 0,
        totalTasks: res?.totalTasks || 0,
        completedTasks: res?.completedTasks || 0,
        activeUsers: res?.activeUsers || 0,
        hoursWorked: res?.hoursWorked || 0,
        employees: res?.employees || [],
      });

    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to load reports"
      );

    } finally {
      setLoading(false);
    }
  };

  const completionRate =
    data.totalTasks > 0
      ? Math.round(
          (data.completedTasks /
            data.totalTasks) *
            100
        )
      : 0;

  const activeRate =
    data.totalUsers > 0
      ? Math.round(
          (data.activeUsers /
            data.totalUsers) *
            100
        )
      : 0;

  const employees = useMemo(() => {
    let rows = [...data.employees];

    if (search.trim()) {
      const q = search.toLowerCase();

      rows = rows.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }

    return rows;
  }, [data.employees, search]);

  const exportCSV = () => {
    const rows = [
      [
        "Metric",
        "Value",
      ],
      ["Total Shifts", data.totalShifts],
      ["Employees", data.totalUsers],
      ["Hours Worked", data.hoursWorked],
      ["Tasks", data.totalTasks],
      ["Completed Tasks", data.completedTasks],
      ["Completion Rate", `${completionRate}%`],
    ];

    const csv = rows
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob(
      [csv],
      { type: "text/csv" }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download =
      "fieldsync-report.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  if (authLoading) return null;

  if (!user || user.role !== "admin") {
    return (
      <LockScreen text="You don’t have access to Reports" />
    );
  }

  if (!user.isPro) {
    return (
      <div className="flex items-center justify-center h-[70vh]">

        <div className="w-full max-w-md rounded-2xl p-[1px] bg-gradient-to-b from-indigo-500/30 to-transparent">

          <div className="bg-[#020617] border border-white/10 rounded-2xl p-8 text-center space-y-5">

            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Crown size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                Pro Reports
              </h1>

              <p className="text-sm text-gray-400 mt-2">
                Unlock analytics,
                exports and advanced
                reporting tools.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/upgrade")
              }
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition font-medium"
            >
              Upgrade to Pro
            </button>

          </div>

        </div>

      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">

        <div>
          <h1 className="text-2xl font-semibold">
            Reports
          </h1>

          <p className="text-sm text-gray-400">
            Business analytics &
            export center
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={loadReports}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm flex items-center gap-2"
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm flex items-center gap-2"
          >
            <Download size={15} />
            Export
          </button>

        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-300 flex gap-2 items-center">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">

        <KPI
          title="Shifts"
          value={data.totalShifts}
          icon={
            <CalendarDays size={16} />
          }
        />

        <KPI
          title="Employees"
          value={data.totalUsers}
          icon={<Users size={16} />}
        />

        <KPI
          title="Hours"
          value={data.hoursWorked}
          icon={
            <BarChart3 size={16} />
          }
        />

        <KPI
          title="Completion"
          value={`${completionRate}%`}
          icon={
            <TrendingUp size={16} />
          }
        />

      </div>

      {/* INSIGHTS */}
      <div className="grid md:grid-cols-2 gap-4">

        <Card title="Operations Summary">

          <InfoRow
            label="Active Users"
            value={data.activeUsers}
          />

          <InfoRow
            label="Tasks Outstanding"
            value={
              data.totalTasks -
              data.completedTasks
            }
          />

          <InfoRow
            label="Task Completion"
            value={`${completionRate}%`}
          />

          <InfoRow
            label="Activity Rate"
            value={`${activeRate}%`}
          />

        </Card>

        <Card title="Performance Score">

          <ProgressBar
            label="Completion"
            value={completionRate}
          />

          <ProgressBar
            label="Activity"
            value={activeRate}
          />

          <ProgressBar
            label="Utilisation"
            value={
              data.totalShifts
                ? 82
                : 0
            }
          />

        </Card>

      </div>

      {/* STAFF TABLE */}
      <Card title="Employee Breakdown">

        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-4 top-3.5 text-gray-500"
          />

          <input
            placeholder="Search employee..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3"
          />
        </div>

        {employees.length === 0 ? (
          <p className="text-sm text-gray-500">
            No employee report data
          </p>
        ) : (
          <div className="space-y-2">
            {employees.map(
              (u, i) => (
                <motion.div
                  key={
                    u.id || i
                  }
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      i * 0.03,
                  }}
                  className="grid grid-cols-4 gap-3 p-3 rounded-xl bg-white/5 text-sm"
                >
                  <span>
                    {u.name ||
                      u.email}
                  </span>

                  <span>
                    {u.shifts || 0} shifts
                  </span>

                  <span>
                    {u.hours || 0} hrs
                  </span>

                  <span className="text-green-400">
                    {
                      u.tasksCompleted ||
                      0
                    }{" "}
                    tasks
                  </span>
                </motion.div>
              )
            )}
          </div>
        )}

      </Card>

    </div>
  );
}

/* COMPONENTS */

function LockScreen({
  text,
}) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-gray-400 text-sm">
        {text}
      </div>
    </div>
  );
}

function KPI({
  title,
  value,
  icon,
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl p-[1px] bg-gradient-to-b from-indigo-500/20 to-transparent"
    >
      <div className="bg-[#020617] border border-white/10 rounded-2xl p-5">

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400">
            {title}
          </p>

          <div className="text-indigo-400">
            {icon}
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-3">
          {value}
        </h2>

      </div>
    </motion.div>
  );
}

function Card({
  title,
  children,
}) {
  return (
    <div className="rounded-2xl bg-[#020617] border border-white/10 p-5">
      <h3 className="text-sm text-gray-400 mb-4">
        {title}
      </h3>

      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex justify-between border-b border-white/5 py-2 text-sm">
      <span className="text-gray-400">
        {label}
      </span>

      <span>{value}</span>
    </div>
  );
}

function ProgressBar({
  label,
  value,
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">
          {label}
        </span>

        <span>{value}%</span>
      </div>

      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}