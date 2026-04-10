import { useEffect, useState } from "react";
import { reportAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    totalShifts: 0,
    totalUsers: 0,
    totalTasks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.isPro || user?.role !== "admin") return;
    loadReports();
  }, [user]);

  const loadReports = async () => {
    try {
      setLoading(true);

      const res = await reportAPI.getTimesheets();

      setData({
        totalShifts: res?.totalShifts || 0,
        totalUsers: res?.totalUsers || 0,
        totalTasks: res?.totalTasks || 0,
      });

    } catch (err) {
      console.error(err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  // 🔒 ROLE LOCK (FIRST)
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-gray-400 text-sm">
          You don’t have access to Reports
        </div>
      </div>
    );
  }

  // 🔒 PAYWALL (SECOND)
  if (!user?.isPro) {
    return (
      <div className="flex items-center justify-center h-[60vh]">

        <div className="rounded-2xl p-[1px] bg-gradient-to-b from-indigo-500/20 to-transparent w-full max-w-md">
          <div className="bg-[#020617] border border-white/10 rounded-2xl p-6 text-center space-y-4 shadow-[0_0_40px_rgba(99,102,241,0.2)]">

            <h1 className="text-xl font-semibold">📊 Reports</h1>

            <p className="text-gray-400 text-sm">
              Unlock advanced insights and analytics
            </p>

            <button
              onClick={() => navigate("/upgrade")}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-xl text-sm transition"
            >
              Upgrade to Pro
            </button>

          </div>
        </div>

      </div>
    );
  }

  if (loading) {
    return <div className="text-gray-400">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-gray-400 text-sm">
          Overview of your business performance
        </p>
      </div>

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}

      {/* KPI GRID */}
      <div className="grid md:grid-cols-3 gap-4">

        <KPI title="Total Shifts" value={data.totalShifts} />
        <KPI title="Users" value={data.totalUsers} />
        <KPI title="Tasks" value={data.totalTasks} />

      </div>

    </div>
  );
}

/* KPI */

function KPI({ title, value }) {
  const spark = [1, 2, 3, 2, 4];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative rounded-2xl p-[1px] bg-gradient-to-b from-indigo-500/20 to-transparent"
    >
      <div className="bg-[#020617] border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(99,102,241,0.15)]">

        <p className="text-gray-400 text-xs">{title}</p>
        <h2 className="text-xl font-semibold">{value}</h2>

        {/* sparkline */}
        <div className="mt-2 h-6 flex items-end gap-[2px]">
          {spark.map((v, i) => (
            <div
              key={i}
              className="bg-indigo-500/70 rounded"
              style={{ height: `${v * 6}px`, width: "4px" }}
            />
          ))}
        </div>

      </div>
    </motion.div>
  );
}