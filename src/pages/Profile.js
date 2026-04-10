import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-gray-400 text-sm">
          Your account information
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-indigo-500/20 to-transparent">
        <div className="bg-[#020617] border border-white/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(99,102,241,0.2)]">

          <div className="flex items-center gap-4">

            {/* AVATAR */}
            <div className="w-14 h-14 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-semibold">
              {user?.email?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* INFO */}
            <div>
              <p className="text-lg font-medium">
                {user?.email}
              </p>
              <p className="text-sm text-gray-400">
                {user?.role}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4">

        <StatCard title="Email" value={user?.email} />
        <StatCard title="Role" value={user?.role} />
        <StatCard
          title="Plan"
          value={user?.isPro ? "Pro" : "Trial"}
        />

      </div>

    </div>
  );
}

/* STAT CARD */

function StatCard({ title, value }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent"
    >
      <div className="bg-[#020617] border border-white/10 rounded-2xl p-4 shadow-[0_0_25px_rgba(99,102,241,0.15)]">

        <p className="text-gray-400 text-xs mb-1">{title}</p>
        <p className="text-sm font-medium text-white">
          {value || "-"}
        </p>

      </div>
    </motion.div>
  );
}