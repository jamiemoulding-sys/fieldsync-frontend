import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Users,
  MapPinned,
  Shield,
  Clock3,
  Crown,
  Building2,
  Star,
  TrendingUp,
  Zap,
  PoundSterling,
  TimerReset,
  Briefcase,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const stats = [
    { label: "Admin Hours Saved", value: "10+ / week" },
    { label: "Average Payroll Errors Reduced", value: "82%" },
    { label: "Time To Build Rota", value: "Under 5 mins" },
    { label: "Potential Annual Saving", value: "£12k+" },
  ];

  const features = [
    {
      icon: <Clock3 size={18} />,
      title: "Live Workforce Tracking",
      text: "See who is clocked in, late, on break, active or missing in real time.",
    },
    {
      icon: <Users size={18} />,
      title: "Smart Scheduling",
      text: "Build weekly rotas in minutes and instantly notify staff.",
    },
    {
      icon: <MapPinned size={18} />,
      title: "GPS Clock In",
      text: "Prevent false clock-ins and verify site attendance.",
    },
    {
      icon: <BarChart3 size={18} />,
      title: "Reports & Insights",
      text: "Wages, attendance, overtime, trends and labour costs instantly.",
    },
    {
      icon: <Shield size={18} />,
      title: "Role Permissions",
      text: "Admins, managers and staff each get the right access.",
    },
    {
      icon: <Zap size={18} />,
      title: "Everything Included",
      text: "No locked features. Every plan includes the full system.",
    },
  ];

  const pricing = [
    {
      name: "Starter",
      price: "£39",
      staff: "Up to 5 staff included",
      extra: "+ £5 per extra employee",
      icon: <Users size={18} />,
      featured: false,
    },
    {
      name: "Growth",
      price: "£79",
      staff: "Up to 15 staff included",
      extra: "+ £5 per extra employee",
      icon: <Crown size={18} />,
      featured: true,
    },
    {
      name: "Business",
      price: "£129",
      staff: "Up to 30 staff included",
      extra: "+ £5 per extra employee",
      icon: <Building2 size={18} />,
      featured: false,
    },
  ];

  const allIncluded = [
    "Unlimited scheduling",
    "Clock in / out",
    "GPS attendance",
    "Break tracking",
    "Holiday management",
    "Tasks system",
    "Announcements",
    "Notifications",
    "Reports dashboard",
    "Payroll exports",
    "Timesheets",
    "Live attendance board",
    "Employee mobile app",
    "Manager controls",
    "Offline mode",
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-indigo-600/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-cyan-500/10 blur-3xl rounded-full" />
      </div>

      {/* NAV */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src="/logo192.png"
            alt="FieldSync"
            className="w-11 h-11 rounded-xl"
          />

          <div>
            <h1 className="text-2xl font-semibold">FieldSync</h1>
            <p className="text-xs text-gray-500">
              Workforce Operating System
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-xl text-sm hover:bg-white/5"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
          >
            Start Free Trial
          </button>
        </div>
      </div>

      {/* HERO */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-24">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs mb-6">
              Built for trades, hospitality, retail, care & field teams
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold leading-tight">
              Run your workforce
              <br />
              <span className="text-indigo-400">
                without the chaos
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-400 max-w-xl leading-relaxed">
              Scheduling, attendance, payroll-ready exports,
              holidays, tasks, live dashboards and reporting —
              all in one simple platform.
            </p>

            <div className="mt-8 flex gap-4 flex-wrap">
              <button
                onClick={() => navigate("/signup")}
                className="px-7 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-medium flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-7 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10"
              >
                Login
              </button>
            </div>

            <div className="mt-6 space-y-2 text-sm text-green-400">
              <p>✔ Save 10+ admin hours every week</p>
              <p>✔ Reduce lateness & missed shifts</p>
              <p>✔ Replace spreadsheets instantly</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl p-[1px] bg-gradient-to-b from-white/15 to-transparent"
          >
            <div className="bg-[#020617] border border-white/10 rounded-3xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <Panel title="Clocked In" value="27" />
                <Panel title="Late Staff" value="2" />
                <Panel title="Tasks Today" value="84" />
                <Panel title="Sites Live" value="11" />
              </div>

              <div className="mt-5 space-y-3">
                <Insight
                  icon={<TrendingUp size={15} />}
                  text="Labour efficiency up 19%"
                />
                <Insight
                  icon={<PoundSterling size={15} />}
                  text="£3,240 saved this month"
                />
                <Insight
                  icon={<TimerReset size={15} />}
                  text="Rota built in 4 mins"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* STATS */}
      <div className="relative z-10 border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-3xl font-semibold">{item.value}</p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-semibold">
            Everything your business needs
          </h2>

          <p className="text-gray-400 mt-4">
            Replace multiple apps with one system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white/5 border border-white/10 p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                {item.icon}
              </div>

              <h3 className="font-medium text-lg">
                {item.title}
              </h3>

              <p className="text-sm text-gray-400 mt-2">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-semibold">
              Simple pricing. Everything included.
            </h2>

            <p className="text-gray-400 mt-4">
              No hidden upgrades • No locked tools • 14 day free trial
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-[1px] ${
                  plan.featured
                    ? "bg-gradient-to-b from-indigo-500/40 to-transparent"
                    : "bg-white/10"
                }`}
              >
                <div className="bg-[#020617] border border-white/10 rounded-3xl p-6 h-full">
                  <div className="flex items-center gap-2 text-indigo-400 text-sm">
                    {plan.icon}
                    {plan.name}
                  </div>

                  {plan.featured && (
                    <div className="mt-3 inline-flex px-3 py-1 rounded-full bg-indigo-500/10 text-xs text-indigo-300">
                      Most Popular
                    </div>
                  )}

                  <p className="text-5xl font-bold mt-4">
                    {plan.price}
                    <span className="text-base text-gray-400 font-normal">
                      /month
                    </span>
                  </p>

                  <p className="text-green-400 text-sm mt-3">
                    {plan.staff}
                  </p>

                  <p className="text-gray-400 text-sm mt-1">
                    {plan.extra}
                  </p>

                  <div className="mt-6 space-y-3 text-sm text-gray-300">
                    {allIncluded.map((item) => (
                      <p
                        key={item}
                        className="flex gap-2"
                      >
                        <CheckCircle2
                          size={16}
                          className="text-green-400 mt-0.5"
                        />
                        {item}
                      </p>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate("/signup")}
                    className="mt-8 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-medium"
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* VALUE */}
          <div className="mt-14 rounded-3xl bg-white/5 border border-white/10 p-8 text-center">
            <Star
              className="mx-auto text-yellow-400 mb-4"
              size={24}
            />

            <h3 className="text-2xl font-semibold">
              Most businesses recover the monthly fee in saved admin
              time alone
            </h3>

            <p className="text-gray-400 mt-3">
              Spend less time chasing staff, fixing rotas and
              calculating hours.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-4xl font-semibold">
          Ready to run smarter?
        </h2>

        <p className="text-gray-400 mt-4">
          Join businesses saving time, cutting costs and growing
          faster with FieldSync.
        </p>

        <button
          onClick={() => navigate("/signup")}
          className="mt-8 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-medium"
        >
          Create Workspace
        </button>
      </div>
    </div>
  );
}

function Panel({ title, value }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <p className="text-xs text-gray-400">{title}</p>
      <h3 className="text-2xl font-semibold mt-2">{value}</h3>
    </div>
  );
}

function Insight({ icon, text }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center gap-2 text-sm text-indigo-300">
      {icon}
      {text}
    </div>
  );
}