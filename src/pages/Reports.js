import { useEffect, useMemo, useState } from "react";
import { reportAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  CalendarDays,
  TrendingUp,
  Crown,
  AlertCircle,
  RefreshCw,
  Download,
  Search,
  ShieldCheck,
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

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const isPaid =
    user?.is_pro === true ||
    user?.isPro === true ||
    user?.subscription_status ===
      "active" ||
    !!user?.current_plan;

  useEffect(() => {
    if (authLoading) return;

    if (user?.role === "admin") {
      loadReports();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const summary =
        await reportAPI.getSummary();

      const timesheets =
        await reportAPI.getTimesheets();

      setData({
        totalShifts:
          summary?.totalShifts || 0,

        totalUsers:
          summary?.totalUsers || 0,

        totalTasks:
          summary?.totalTasks || 0,

        completedTasks:
          summary?.completedTasks ||
          0,

        activeUsers:
          summary?.activeUsers || 0,

        hoursWorked:
          summary?.hoursWorked || 0,

        employees:
          Array.isArray(timesheets)
            ? timesheets
            : [],
      });
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  /* FIXED: useMemo BEFORE returns */
  const employees = useMemo(() => {
    let rows = [...data.employees];

    if (search.trim()) {
      const q =
        search.toLowerCase();

      rows = rows.filter(
        (u) =>
          u.name
            ?.toLowerCase()
            .includes(q) ||
          u.email
            ?.toLowerCase()
            .includes(q)
      );
    }

    return rows;
  }, [data.employees, search]);

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

  const exportCSV = () => {
    const rows = [
      [
        "Employee",
        "Email",
        "Clock In",
        "Clock Out",
        "Hours",
      ],
      ...employees.map((u) => [
        u.name,
        u.email,
        u.clock_in_time,
        u.clock_out_time,
        u.hours,
      ]),
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
      "fieldsync-reports.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  if (authLoading) return null;

  if (!user || user.role !== "admin") {
    return (
      <CenterText text="Admins only." />
    );
  }

  if (!isPaid) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="bg-[#020617] border border-white/10 rounded-3xl p-8 text-center max-w-md w-full">

          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto mb-5">
            <Crown size={26} />
          </div>

          <h1 className="text-2xl font-semibold">
            Upgrade Required
          </h1>

          <p className="text-gray-400 mt-3 text-sm">
            Reports are included in
            paid plans.
          </p>

          <button
            onClick={() =>
              navigate("/billing")
            }
            className="mt-6 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500"
          >
            View Plans
          </button>

        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <CenterText text="Loading reports..." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4 flex-wrap items-center">

        <div>
          <h1 className="text-2xl font-semibold">
            Reports
          </h1>

          <p className="text-sm text-gray-400">
            Business analytics &
            exports
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={loadReports}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2"
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2"
          >
            <Download size={15} />
            Export
          </button>

        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-300 text-sm flex gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

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

      <Card title="Timesheets">

        <div className="relative mb-4">

          <Search
            size={16}
            className="absolute left-4 top-3.5 text-gray-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search employee..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3"
          />

        </div>

        <div className="space-y-2">

          {employees.length === 0 ? (
            <p className="text-sm text-gray-500">
              No records found
            </p>
          ) : (
            employees.map(
              (u, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="grid md:grid-cols-5 gap-3 bg-white/5 rounded-xl p-3 text-sm"
                >
                  <span>
                    {u.name}
                  </span>

                  <span>
                    {u.email}
                  </span>

                  <span>
                    {u.hours} hrs
                  </span>

                  <span>
                    {u.clock_in_time
                      ? "Worked"
                      : "-"}
                  </span>

                  <span className="text-green-400">
                    Complete
                  </span>

                </motion.div>
              )
            )
          )}

        </div>

      </Card>
    </div>
  );
}

function KPI({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl bg-[#020617] border border-white/10 p-5">
      <div className="flex justify-between">
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

function CenterText({
  text,
}) {
  return (
    <div className="flex items-center justify-center h-[60vh] text-gray-400">
      {text}
    </div>
  );
}