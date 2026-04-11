import { useEffect, useMemo, useState } from "react";
import { performanceAPI } from "../services/api";
import { motion } from "framer-motion";
import {
  Trophy,
  Clock3,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Medal,
  Search,
  RefreshCw,
  Star,
} from "lucide-react";

export default function Performance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("shifts");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);

      const res = await performanceAPI.getAll();
      setData(Array.isArray(res) ? res : []);

    } catch (err) {
      console.error(err);

    } finally {
      setLoading(false);
    }
  };

  const processed = useMemo(() => {
    let rows = [...data];

    if (search.trim()) {
      const q = search.toLowerCase();

      rows = rows.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }

    rows.sort((a, b) => {
      if (sortBy === "hours") {
        return Number(b.hours_worked || 0) -
          Number(a.hours_worked || 0);
      }

      if (sortBy === "score") {
        return calcScore(b) - calcScore(a);
      }

      return Number(b.total_shifts || 0) -
        Number(a.total_shifts || 0);
    });

    return rows;
  }, [data, search, sortBy]);

  const topPerformer = processed[0];

  const alerts = data.filter(
    (u) => Number(u.total_shifts || 0) < 2
  ).length;

  const avgScore = data.length
    ? Math.round(
        data.reduce(
          (sum, user) => sum + calcScore(user),
          0
        ) / data.length
      )
    : 0;

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading performance...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">

        <div>
          <h1 className="text-2xl font-semibold">
            Performance
          </h1>

          <p className="text-sm text-gray-400">
            Team productivity insights & rankings
          </p>
        </div>

        <button
          onClick={load}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm flex items-center gap-2"
        >
          <RefreshCw size={15} />
          Refresh
        </button>

      </div>

      {/* HERO */}
      {topPerformer && (
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-yellow-500/30 via-indigo-500/20 to-transparent">

          <div className="bg-[#020617] border border-white/10 rounded-2xl p-6">

            <div className="flex justify-between items-center gap-4 flex-wrap">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                  <Trophy size={24} />
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    Top Performer
                  </p>

                  <h2 className="text-xl font-semibold">
                    {topPerformer.name ||
                      topPerformer.email}
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    {topPerformer.total_shifts || 0} shifts •{" "}
                    {Number(
                      topPerformer.hours_worked || 0
                    ).toFixed(1)} hrs
                  </p>
                </div>

              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">
                  Productivity Score
                </p>

                <p className="text-3xl font-semibold text-yellow-400">
                  {calcScore(topPerformer)}%
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">

        <KPI
          title="Employees"
          value={data.length}
          icon={<Briefcase size={16} />}
        />

        <KPI
          title="Average Score"
          value={`${avgScore}%`}
          icon={<Star size={16} />}
        />

        <KPI
          title="Top Hours"
          value={Number(
            topPerformer?.hours_worked || 0
          ).toFixed(1)}
          icon={<Clock3 size={16} />}
        />

        <KPI
          title="Alerts"
          value={alerts}
          icon={<AlertTriangle size={16} />}
        />

      </div>

      {/* FILTER BAR */}
      <div className="grid md:grid-cols-2 gap-3">

        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-3.5 text-gray-500"
          />

          <input
            placeholder="Search employee..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-[#020617] border border-white/10 rounded-2xl pl-11 pr-4 py-3"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
          className="bg-[#020617] border border-white/10 rounded-2xl px-4 py-3"
        >
          <option value="shifts">
            Sort by Shifts
          </option>

          <option value="hours">
            Sort by Hours
          </option>

          <option value="score">
            Sort by Score
          </option>
        </select>

      </div>

      {/* EMPTY */}
      {processed.length === 0 && (
        <div className="text-gray-500">
          No employees found
        </div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-4">

        {processed.map((user, i) => {
          const shifts = Number(
            user.total_shifts || 0
          );

          const hours = Number(
            user.hours_worked || 0
          );

          const score = calcScore(user);

          const low = shifts < 2;

          return (
            <motion.div
              key={user.id}
              initial={{
                opacity: 0,
                y: 14,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: i * 0.03,
              }}
              className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent"
            >
              <div className="bg-[#020617] border border-white/10 rounded-2xl p-5">

                {/* TOP */}
                <div className="flex justify-between items-start">

                  <div className="flex gap-3">

                    <div className="w-11 h-11 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-semibold">
                      {(user.name ||
                        user.email ||
                        "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium text-sm">
                        {user.name ||
                          user.email}
                      </p>

                      <p className="text-xs text-gray-400">
                        Team Member
                      </p>
                    </div>

                  </div>

                  {i === 0 && (
                    <Medal
                      size={18}
                      className="text-yellow-400"
                    />
                  )}

                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 gap-3 mt-4">

                  <Stat
                    label="Shifts"
                    value={shifts}
                  />

                  <Stat
                    label="Hours"
                    value={hours.toFixed(1)}
                  />

                </div>

                {/* BAR */}
                <div className="mt-4">

                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">
                      Productivity
                    </span>

                    <span>{score}%</span>
                  </div>

                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">

                    <div
                      className={`h-full ${
                        low
                          ? "bg-red-500"
                          : "bg-indigo-500"
                      }`}
                      style={{
                        width: `${score}%`,
                      }}
                    />

                  </div>

                </div>

                {/* STATUS */}
                <div className="mt-4 text-xs">
                  {low ? (
                    <span className="text-red-400">
                      Needs attention
                    </span>
                  ) : (
                    <span className="text-green-400">
                      Performing well
                    </span>
                  )}
                </div>

              </div>
            </motion.div>
          );
        })}

      </div>

    </div>
  );
}

function calcScore(user) {
  const shifts = Number(
    user.total_shifts || 0
  );

  const hours = Number(
    user.hours_worked || 0
  );

  return Math.min(
    Math.round(shifts * 12 + hours * 2),
    100
  );
}

function KPI({ title, value, icon }) {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-indigo-500/20 to-transparent">
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

function Stat({ label, value }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="text-sm font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}