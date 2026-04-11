import { useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import {
  Crown,
  Check,
  Shield,
  Zap,
  BarChart3,
  RefreshCw,
} from "lucide-react";

export default function Billing() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      const res = await api.post(
        "/billing/create-checkout-session"
      );

      if (!res.data?.url) {
        alert("Something went wrong");
        return;
      }

      window.location.href =
        res.data.url;

    } catch (err) {
      console.error(err);
      alert("Payment failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* HERO */}
      <div className="rounded-3xl p-[1px] bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-transparent">

        <div className="bg-[#020617] border border-white/10 rounded-3xl p-8">

          <div className="flex justify-between gap-6 flex-wrap items-center">

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm mb-4">
                <Crown size={15} />
                Pro Access
              </div>

              <h1 className="text-4xl font-semibold text-white">
                Upgrade to Pro
              </h1>

              <p className="text-gray-400 mt-3 max-w-xl">
                Unlock advanced analytics,
                automation tools, exports,
                priority support and premium
                management features.
              </p>
            </div>

            <div className="text-right">
              <p className="text-gray-400 text-sm">
                Starting from
              </p>

              <h2 className="text-5xl font-bold text-white mt-1">
                £6
              </h2>

              <p className="text-gray-400 text-sm">
                per month
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* FEATURES */}
      <div className="grid md:grid-cols-3 gap-4">

        <FeatureCard
          icon={<BarChart3 size={18} />}
          title="Advanced Reports"
          text="Deep analytics, staff insights and exports."
        />

        <FeatureCard
          icon={<Zap size={18} />}
          title="Automation"
          text="Smarter workflows and faster admin tasks."
        />

        <FeatureCard
          icon={<Shield size={18} />}
          title="Priority Support"
          text="Faster help when your business needs it."
        />

      </div>

      {/* PLAN */}
      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 rounded-3xl bg-[#020617] border border-white/10 p-6">

          <h3 className="text-xl font-semibold text-white">
            Pro Plan Includes
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {[
              "Unlimited reports",
              "CSV exports",
              "Productivity dashboards",
              "Performance rankings",
              "Priority updates",
              "Future premium tools",
            ].map((item) => (
              <Benefit
                key={item}
                text={item}
              />
            ))}
          </div>

        </div>

        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl p-[1px] bg-gradient-to-b from-indigo-500/30 to-transparent"
        >
          <div className="bg-[#020617] border border-white/10 rounded-3xl p-6">

            <p className="text-sm text-indigo-400">
              Most Popular
            </p>

            <h2 className="text-2xl font-semibold text-white mt-2">
              Pro Monthly
            </h2>

            <p className="text-4xl font-bold text-white mt-4">
              £6
              <span className="text-base text-gray-400 font-normal">
                /month
              </span>
            </p>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full mt-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                  Redirecting...
                </>
              ) : (
                <>
                  <Crown size={16} />
                  Start Subscription
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Secure checkout powered by Stripe
            </p>

          </div>
        </motion.div>

      </div>

    </div>
  );
}

/* COMPONENTS */

function FeatureCard({
  icon,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl bg-[#020617] border border-white/10 p-5">
      <div className="text-indigo-400">
        {icon}
      </div>

      <h3 className="text-white font-medium mt-3">
        {title}
      </h3>

      <p className="text-sm text-gray-400 mt-2">
        {text}
      </p>
    </div>
  );
}

function Benefit({ text }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
      <div className="w-7 h-7 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center">
        <Check size={14} />
      </div>

      <span className="text-sm text-white">
        {text}
      </span>
    </div>
  );
}