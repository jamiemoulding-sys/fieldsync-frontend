import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6 relative overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-green-500/10 blur-3xl rounded-full" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-3xl rounded-full" />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.4,
        }}
        className="relative z-10 w-full max-w-xl rounded-3xl p-[1px] bg-gradient-to-b from-white/15 to-transparent"
      >
        <div className="bg-[#020617]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center">

          {/* ICON */}
          <div className="w-20 h-20 rounded-3xl bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={38} />
          </div>

          {/* TEXT */}
          <div className="space-y-3">
            <div className="inline-flex px-3 py-1 rounded-full bg-green-500/10 text-green-300 text-xs">
              Subscription Activated
            </div>

            <h1 className="text-4xl font-semibold tracking-tight">
              Payment Successful
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto">
              Your Pro plan is now active and all premium features
              have been unlocked for your workspace.
            </p>
          </div>

          {/* FEATURES */}
          <div className="grid sm:grid-cols-3 gap-3 mt-8 text-left">

            <Feature text="Advanced analytics" />

            <Feature text="Unlimited employees" />

            <Feature text="Priority upgrades" />

          </div>

          {/* ACTIONS */}
          <div className="grid sm:grid-cols-2 gap-4 mt-8">

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition font-medium flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={18} />
              Go to Dashboard
            </button>

            <button
              onClick={() =>
                navigate("/billing")
              }
              className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition font-medium flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Billing
            </button>

          </div>

          {/* FOOTER */}
          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="mt-6 text-sm text-gray-400 hover:text-white transition inline-flex items-center gap-2"
          >
            Continue to workspace
            <ArrowRight size={15} />
          </button>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-indigo-300">
            <Sparkles size={14} />
            Thank you for upgrading to Pro
          </div>

        </div>
      </motion.div>

    </div>
  );
}

function Feature({ text }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-gray-300 text-center">
      {text}
    </div>
  );
}