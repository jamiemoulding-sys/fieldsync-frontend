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
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const stats = [
    { label: "Shifts Tracked", value: "12k+" },
    { label: "Active Users", value: "800+" },
    { label: "Tasks Completed", value: "5k+" },
    { label: "Uptime", value: "99.9%" },
  ];

  const features = [
    {
      icon: <Clock3 size={18} />,
      title: "Real-time operations",
      text:
        "See who is clocked in, active and where your team is right now.",
    },
    {
      icon: <Users size={18} />,
      title: "Team management",
      text:
        "Run schedules, staff permissions and tasks from one dashboard.",
    },
    {
      icon: <MapPinned size={18} />,
      title: "Location control",
      text:
        "Track approved sites and ensure teams are where they should be.",
    },
    {
      icon: <BarChart3 size={18} />,
      title: "Analytics",
      text:
        "Use reports and performance insights to improve output.",
    },
    {
      icon: <Shield size={18} />,
      title: "Secure access",
      text:
        "Role-based permissions for admins, managers and staff.",
    },
    {
      icon: <CheckCircle2 size={18} />,
      title: "Simple setup",
      text:
        "Create your workspace and onboard staff in minutes.",
    },
  ];

  const pricing = [
    {
      name: "Starter",
      price: "£49",
      extra: "+ £7 per extra employee",
      icon: <Users size={18} />,
      featured: false,
      items: [
        "Up to 5 employees included",
        "Staff scheduling",
        "Clock in / out",
        "GPS attendance",
        "Holiday requests",
        "Dashboard",
      ],
    },
    {
      name: "Pro",
      price: "£89",
      extra: "+ £8 per extra employee",
      icon: <Crown size={18} />,
      featured: true,
      items: [
        "Up to 10 employees included",
        "Everything in Starter",
        "Tasks & announcements",
        "Reports & analytics",
        "Performance rankings",
        "Priority support",
      ],
    },
    {
      name: "Business",
      price: "£149",
      extra: "+ £10 per extra employee",
      icon: <Building2 size={18} />,
      featured: false,
      items: [
        "Up to 20 employees included",
        "Everything in Pro",
        "Multi-location management",
        "Payroll exports",
        "Advanced permissions",
        "Dedicated support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">

      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-600/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-3xl rounded-full" />
      </div>

      {/* NAV */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">

        <div>
          <h1 className="text-xl font-semibold">
            FieldSync
          </h1>

          <p className="text-xs text-gray-500">
            Workforce OS
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() =>
              navigate("/login")
            }
            className="px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5"
          >
            Sign In
          </button>

          <button
            onClick={() =>
              navigate("/signup")
            }
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
          >
            Get Started
          </button>

        </div>

      </div>

      {/* HERO */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-24">

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >

            <div className="inline-flex px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs mb-6">
              14 Day Free Trial
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold leading-tight">
              Run your team
              <br />
              <span className="text-gray-400">
                without chaos
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-400 max-w-xl leading-relaxed">
              Scheduling, attendance,
              tasks, locations,
              reporting and payroll-ready
              exports in one system.
            </p>

            <div className="mt-8 flex gap-4 flex-wrap">

              <button
                onClick={() =>
                  navigate("/signup")
                }
                className="px-7 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-medium flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() =>
                  navigate("/login")
                }
                className="px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Login
              </button>

            </div>

          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="rounded-3xl p-[1px] bg-gradient-to-b from-white/15 to-transparent"
          >

            <div className="bg-[#020617]/95 border border-white/10 rounded-3xl p-6">

              <div className="grid grid-cols-2 gap-4">

                <Panel title="Live Staff" value="14" />
                <Panel title="Tasks Today" value="32" />
                <Panel title="Late Arrivals" value="1" />
                <Panel title="Locations" value="6" />

              </div>

            </div>

          </motion.div>

        </div>

      </div>

      {/* STATS */}
      <div className="relative z-10 border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">

          {stats.map((item) => (
            <div
              key={item.label}
              className="text-center"
            >
              <p className="text-3xl font-semibold">
                {item.value}
              </p>

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
            Everything in one system
          </h2>

          <p className="text-gray-400 mt-4">
            Replace spreadsheets,
            WhatsApp groups and
            admin headaches.
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
              Pricing Plans
            </h2>

            <p className="text-gray-400 mt-4">
              14 day free trial on every plan
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

                  <p className="text-4xl font-bold mt-4">
                    {plan.price}
                    <span className="text-base text-gray-400 font-normal">
                      /month
                    </span>
                  </p>

                  <p className="text-sm text-gray-400 mt-2">
                    {plan.extra}
                  </p>

                  <div className="space-y-3 mt-6 text-sm text-gray-300">

                    {plan.items.map((item) => (
                      <p key={item}>
                        ✔ {item}
                      </p>
                    ))}

                  </div>

                  <button
                    onClick={() =>
                      navigate("/signup")
                    }
                    className="mt-8 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-medium"
                  >
                    Start Free Trial
                  </button>

                </div>
              </div>
            ))}

          </div>

        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-24 text-center">

        <h2 className="text-4xl font-semibold">
          Ready to scale?
        </h2>

        <p className="text-gray-400 mt-4">
          Launch your workspace in minutes.
        </p>

        <button
          onClick={() =>
            navigate("/signup")
          }
          className="mt-8 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-medium"
        >
          Create Workspace
        </button>

      </div>

    </div>
  );
}

function Panel({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <p className="text-xs text-gray-400">
        {title}
      </p>

      <h3 className="text-2xl font-semibold mt-2">
        {value}
      </h3>
    </div>
  );
}