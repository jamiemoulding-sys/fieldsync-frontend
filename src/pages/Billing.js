import { useState, useEffect } from "react";
import { billingAPI } from "../services/api";
import { motion } from "framer-motion";
import {
  Crown,
  Shield,
  Zap,
  BarChart3,
  Building2,
  Users,
  RefreshCw,
  CreditCard,
  Sparkles,
  Clock3,
  Check,
} from "lucide-react";

export default function Billing() {
  const [loadingPlan, setLoadingPlan] =
    useState(null);

  const [portalLoading, setPortalLoading] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState("");

  const [subscription, setSubscription] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /* ====================================
     LOAD BILLING
  ==================================== */

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    try {
      setLoading(true);

      const data =
        await billingAPI.getStatus();

      setSubscription(data || null);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  /* ====================================
     TRIAL TIMER
  ==================================== */

  useEffect(() => {
    if (
      subscription?.plan &&
      subscription?.status === "active"
    ) {
      setTimeLeft("");
      return;
    }

    const trialEnd =
      localStorage.getItem(
        "trial_ends_at"
      );

    if (!trialEnd) {
      const date = new Date();
      date.setDate(
        date.getDate() + 14
      );

      localStorage.setItem(
        "trial_ends_at",
        date.toISOString()
      );
    }

    const timer =
      setInterval(() => {
        const now =
          new Date().getTime();

        const end =
          new Date(
            localStorage.getItem(
              "trial_ends_at"
            )
          ).getTime();

        const diff =
          end - now;

        if (diff <= 0) {
          setTimeLeft(
            "Trial expired"
          );
          clearInterval(
            timer
          );
          return;
        }

        const days = Math.floor(
          diff /
            (1000 *
              60 *
              60 *
              24)
        );

        const hours =
          Math.floor(
            (diff %
              (1000 *
                60 *
                60 *
                24)) /
              (1000 *
                60 *
                60)
          );

        const mins =
          Math.floor(
            (diff %
              (1000 *
                60 *
                60)) /
              (1000 * 60)
          );

        setTimeLeft(
          `${days}d ${hours}h ${mins}m left`
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, [subscription]);

  /* ====================================
     ACTIONS
  ==================================== */

  const handleUpgrade = async (
    plan
  ) => {
    try {
      setLoadingPlan(plan);

      const res =
        await billingAPI.checkout(
          { plan }
        );

      if (res?.url) {
        window.location.href =
          res.url;
      }
    } catch {
      alert(
        "Checkout failed"
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  const openPortal =
    async () => {
      try {
        setPortalLoading(
          true
        );

        const res =
          await billingAPI.portal();

        if (res?.url) {
          window.location.href =
            res.url;
        }
      } catch {
        alert(
          "Billing portal unavailable"
        );
      } finally {
        setPortalLoading(
          false
        );
      }
    };

  /* ====================================
     PLANS
  ==================================== */

  const plans = [
    {
      key: "starter",
      title: "Starter",
      price: "£49",
      included:
        "Includes 5 employees",
      extra:
        "+ £7 per extra employee",
      badge:
        "Small Teams",
      icon: (
        <Users size={18} />
      ),
      featured: false,
      features: [
        "Staff scheduling",
        "Clock in / out",
        "Holiday requests",
        "Basic reports",
      ],
    },

    {
      key: "pro",
      title: "Pro",
      price: "£89",
      included:
        "Includes 15 employees",
      extra:
        "+ £8 per extra employee",
      badge:
        "Most Popular",
      icon: (
        <Crown size={18} />
      ),
      featured: true,
      features: [
        "Everything in Starter",
        "Advanced reports",
        "Timesheets",
        "Performance tools",
        "Priority support",
      ],
    },

    {
      key: "business",
      title: "Business",
      price: "£149",
      included:
        "Includes 30 employees",
      extra:
        "+ £10 per extra employee",
      badge:
        "Scale Fast",
      icon: (
        <Building2
          size={18}
        />
      ),
      featured: false,
      features: [
        "Everything in Pro",
        "Multi-site management",
        "Custom branding",
        "Dedicated support",
        "Enterprise controls",
      ],
    },
  ];

  const currentPlan =
    subscription?.plan;

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading billing...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* HERO */}
      <div className="rounded-3xl p-[1px] bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-transparent">
        <div className="bg-[#020617] border border-white/10 rounded-3xl p-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm mb-4">
            <Sparkles size={15} />

            {currentPlan
              ? "Active Subscription"
              : "14 Day Free Trial"}
          </div>

          <h1 className="text-4xl font-semibold text-white">
            Billing &
            Subscription
          </h1>

          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Manage plans,
            payments and
            premium features.
          </p>

          {currentPlan ? (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-500/10 text-green-400 font-medium">
              <CreditCard
                size={16}
              />

              {currentPlan.toUpperCase()}
              {subscription?.next_payment &&
                ` • Next payment ${subscription.next_payment}`}
            </div>
          ) : (
            timeLeft && (
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-500/10 text-green-400 font-medium">
                <Clock3
                  size={16}
                />
                {timeLeft}
              </div>
            )
          )}

          <button
            onClick={
              openPortal
            }
            disabled={
              portalLoading
            }
            className="mt-6 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white inline-flex items-center gap-2"
          >
            <CreditCard
              size={16}
            />

            {portalLoading
              ? "Loading..."
              : "Manage Billing"}
          </button>
        </div>
      </div>

      {/* FEATURES */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          icon={
            <BarChart3
              size={18}
            />
          }
          title="Reports"
          text="Track staffing & growth."
        />

        <FeatureCard
          icon={
            <Zap size={18} />
          }
          title="Automation"
          text="Save admin time."
        />

        <FeatureCard
          icon={
            <Shield
              size={18}
            />
          }
          title="Secure"
          text="Protected payments."
        />
      </div>

      {/* PLANS */}
      <div className="grid lg:grid-cols-3 gap-6">
        {plans.map(
          (plan) => {
            const isCurrent =
              currentPlan ===
              plan.key;

            return (
              <motion.div
                key={
                  plan.key
                }
                whileHover={{
                  y: -4,
                }}
                className={`rounded-3xl p-[1px] ${
                  plan.featured
                    ? "bg-gradient-to-b from-indigo-500/40 to-transparent"
                    : "bg-white/10"
                }`}
              >
                <div className="bg-[#020617] border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center gap-2 text-indigo-400 text-sm">
                    {
                      plan.icon
                    }
                    {
                      plan.badge
                    }
                  </div>

                  <h2 className="text-2xl font-semibold text-white mt-3">
                    {
                      plan.title
                    }
                  </h2>

                  <p className="text-4xl font-bold text-white mt-4">
                    {
                      plan.price
                    }

                    <span className="text-base text-gray-400 font-normal">
                      /month
                    </span>
                  </p>

                  <p className="text-sm text-green-400 mt-2">
                    {
                      plan.included
                    }
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    {
                      plan.extra
                    }
                  </p>

                  <div className="mt-5 space-y-2">
                    {plan.features.map(
                      (
                        item,
                        i
                      ) => (
                        <div
                          key={
                            i
                          }
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <Check
                            size={
                              14
                            }
                            className="text-green-400"
                          />

                          {
                            item
                          }
                        </div>
                      )
                    )}
                  </div>

                  <button
                    onClick={() =>
                      !isCurrent &&
                      handleUpgrade(
                        plan.key
                      )
                    }
                    disabled={
                      isCurrent ||
                      loadingPlan !==
                        null
                    }
                    className={`w-full mt-6 py-3 rounded-2xl text-white font-medium flex items-center justify-center gap-2 ${
                      isCurrent
                        ? "bg-green-600 cursor-default"
                        : plan.featured
                        ? "bg-indigo-600 hover:bg-indigo-500"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {loadingPlan ===
                    plan.key ? (
                      <>
                        <RefreshCw
                          size={
                            16
                          }
                          className="animate-spin"
                        />
                        Redirecting...
                      </>
                    ) : isCurrent ? (
                      <>
                        <Check
                          size={
                            16
                          }
                        />
                        Current Plan
                      </>
                    ) : (
                      <>
                        <Crown
                          size={
                            16
                          }
                        />
                        Choose Plan
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          }
        )}
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