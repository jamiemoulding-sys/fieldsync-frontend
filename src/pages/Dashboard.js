import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth() || {};

  const [stats, setStats] = useState({});
  const [hours, setHours] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/dashboard");
    const data = res?.data || {};

    setStats(data.stats || {});
    setHours(data.trends?.hours || []);
    setTopUsers(data.topPerformers || []);
    setActivity(data.activity || []);
  };

  return (
    <div className="space-y-6">

      {/* 🔥 COMMAND HEADER */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-600/20 to-transparent border border-white/10">
        <h1 className="text-2xl font-semibold">
          👋 Good morning, {user?.name || "there"}
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          {stats.activeShifts || 0} active • {stats.late || 0} late • {stats.tasks || 0} tasks today
        </p>

        <div className="flex gap-3 mt-4">
          <ActionBtn label="+ Employee" />
          <ActionBtn label="+ Shift" />
          <ActionBtn label="Invite" />
        </div>
      </div>

      {/* 🚨 ALERTS */}
      <div className="space-y-2">
        <Alert text="🚨 2 employees are late today" color="red" />
        <Alert text="⚠️ 3 shifts starting soon" color="yellow" />
      </div>

      {/* 📊 KPI */}
      <div className="grid grid-cols-4 gap-4">
        <KPI title="Active Now" value={stats.activeShifts} />
        <KPI title="Hours Today" value={stats.hoursToday} />
        <KPI title="Shifts Today" value={stats.shiftsToday} />
        <KPI title="Issues" value={stats.issues} />
      </div>

      {/* 📈 CHARTS */}
      <div className="grid grid-cols-2 gap-4">

        <Card title="Weekly Activity">
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={hours}>
              <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip />
              <Line dataKey="hours" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Performers">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={topUsers}>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip />
              <Bar dataKey="completed" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </div>

      {/* 👥 LIVE STAFF */}
      <Card title="Live Team Status">
        <div className="space-y-2">
          {activity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
              <img
                src={`https://ui-avatars.com/api/?name=${a.name}`}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-sm">{a.name}</p>
                <p className="text-xs text-gray-400">{a.action}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}

/* 🔧 COMPONENTS */

function KPI({ title, value }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="p-4 rounded-2xl bg-[#020617] border border-white/10">
      <p className="text-gray-400 text-xs">{title}</p>
      <h2 className="text-xl mt-1">{value || 0}</h2>
    </motion.div>
  );
}

function Card({ title, children }) {
  return (
    <div className="p-4 rounded-2xl bg-[#020617]/80 border border-white/10">
      <h3 className="text-xs text-gray-400 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Alert({ text, color }) {
  const colors = {
    red: "bg-red-500/10 border-red-500/30 text-red-300",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
  };

  return (
    <div className={`p-3 rounded-xl border ${colors[color]}`}>
      <p className="text-sm">{text}</p>
    </div>
  );
}

function ActionBtn({ label }) {
  return (
    <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm">
      {label}
    </button>
  );
}