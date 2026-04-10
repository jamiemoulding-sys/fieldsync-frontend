import { useEffect, useState } from "react";
import { performanceAPI } from "../services/api";
import { motion } from "framer-motion";

export default function Performance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await performanceAPI.getAll(); // ✅ already unwrapped
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Performance error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading performance...</div>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Performance</h1>
        <p className="text-gray-400 text-sm">
          Track team productivity and output
        </p>
      </div>

      {/* EMPTY */}
      {data.length === 0 && (
        <div className="text-gray-500">No data available</div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-4">

        {data.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent"
          >
            <div className="bg-[#020617] border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(99,102,241,0.15)]">

              {/* USER */}
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-semibold">
                  {user.email?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-gray-400">
                    Team Member
                  </p>
                </div>

              </div>

              {/* METRICS */}
              <div className="grid grid-cols-2 gap-3 mt-4">

                <Stat label="Shifts" value={user.total_shifts} />
                <Stat
                  label="Hours"
                  value={Number(user.hours_worked || 0).toFixed(1)}
                />

              </div>

              {/* MINI BAR */}
              <div className="mt-4 h-2 bg-white/5 rounded overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{
                    width: `${Math.min(user.total_shifts * 10, 100)}%`,
                  }}
                />
              </div>

            </div>
          </motion.div>
        ))}

      </div>
    </div>
  );
}

/* STAT BLOCK */

function Stat({ label, value }) {
  return (
    <div className="bg-white/5 rounded-lg p-2 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold">{value || 0}</p>
    </div>
  );
}