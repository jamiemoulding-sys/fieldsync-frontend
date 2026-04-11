import { useEffect, useState } from "react";
import { holidayAPI } from "../services/api";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function HolidayRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await holidayAPI.getAll();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await holidayAPI.update(id, { status });
      load();
    } catch {
      alert("Update failed");
    }
  };

  const filtered = requests.filter((r) =>
    filter === "all" ? true : r.status === filter
  );

  const pending = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  const days = [];

  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    days.push(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        i
      )
    );
  }

  const getRequestsForDay = (day) => {
    return filtered.filter((r) => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      return day >= start && day <= end;
    });
  };

  const changeMonth = (dir) => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + dir);
    setCurrentMonth(next);
  };

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading holiday requests...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Holiday Requests
          </h1>
          <p className="text-sm text-gray-400">
            Approve leave & manage absences
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          title="Total"
          value={requests.length}
          icon={<CalendarDays size={16} />}
        />
        <StatCard
          title="Pending"
          value={pending}
          icon={<Clock3 size={16} />}
        />
        <StatCard
          title="Approved"
          value={approved}
          icon={<CheckCircle2 size={16} />}
        />
        <StatCard
          title="Rejected"
          value={rejected}
          icon={<XCircle size={16} />}
        />
      </div>

      {/* CALENDAR */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
        <div className="bg-[#020617] border border-white/10 rounded-2xl p-5">

          <div className="flex justify-between items-center mb-5">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-xl bg-white/5"
            >
              <ChevronLeft size={18} />
            </button>

            <h3 className="font-medium">
              {currentMonth.toLocaleString("default", {
                month: "long",
              })}{" "}
              {currentMonth.getFullYear()}
            </h3>

            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-xl bg-white/5"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              const entries = getRequestsForDay(day);

              return (
                <div
                  key={i}
                  className="bg-white/5 rounded-xl p-2 min-h-[110px]"
                >
                  <div className="text-xs text-gray-500 mb-2">
                    {day.getDate()}
                  </div>

                  {entries.map((r) => (
                    <div
                      key={r.id}
                      className={`text-xs px-2 py-1 rounded mb-1 ${
                        r.status === "approved"
                          ? "bg-green-500/20 text-green-300"
                          : r.status === "rejected"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {r.name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#020617]">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="text-left p-4">Employee</th>
              <th className="text-left p-4">Dates</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-t border-white/5 hover:bg-white/5"
              >
                <td className="p-4">{r.name}</td>

                <td className="p-4 text-gray-400">
                  {format(r.start_date)} → {format(r.end_date)}
                </td>

                <td className="p-4">
                  <Badge status={r.status} />
                </td>

                <td className="p-4">
                  {r.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateStatus(r.id, "approved")
                        }
                        className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-xs"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(r.id, "rejected")
                        }
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs">
                      Complete
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No requests found
          </div>
        )}
      </div>

    </div>
  );
}

function format(date) {
  return new Date(date).toLocaleDateString();
}

function Badge({ status }) {
  const styles = {
    pending: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
      <div className="bg-[#020617] border border-white/10 rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400">
            {title}
          </p>
          <div className="text-indigo-400">
            {icon}
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-2">
          {value}
        </h2>
      </div>
    </div>
  );
}