import { useMemo, useState } from "react";
import {
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { useAuth } from "../hooks/useAuth";

import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  Users,
  Calendar,
  MapPin,
  FileText,
  BarChart3,
  User,
  CreditCard,
  Bell,
  Megaphone,
  Search,
  Menu,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function AppLayout() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    user,
    loading,
    logout,
  } = useAuth();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  /* MOVE ALL CONSTANTS + HOOKS ABOVE RETURNS */

  const role =
    user?.role || "employee";

  const menu = [
    {
      title: "CORE",
      items: [
        {
          label:
            "Dashboard",
          icon:
            LayoutDashboard,
          path:
            "/dashboard",
        },
        {
          label:
            "Work Session",
          icon: Clock,
          path:
            "/work-session",
        },
        {
          label:
            "Tasks",
          icon:
            CheckSquare,
          path: "/tasks",
        },
      ],
    },

    {
      title:
        "MANAGEMENT",
      items: [
        {
          label:
            "Employees",
          icon: Users,
          path:
            "/employees",
          roles: [
            "manager",
            "admin",
          ],
        },
        {
          label:
            "Schedule",
          icon:
            Calendar,
          path:
            "/schedule",
          roles: [
            "manager",
            "admin",
          ],
        },
        {
          label:
            "Locations",
          icon:
            MapPin,
          path:
            "/locations",
          roles: [
            "manager",
            "admin",
          ],
        },
        {
          label:
            "Holiday Requests",
          icon:
            FileText,
          path:
            "/holiday-requests",
          roles: [
            "manager",
            "admin",
          ],
        },
        {
          label:
            "Announcements",
          icon:
            Megaphone,
          path:
            "/announcements",
          roles: [
            "manager",
            "admin",
          ],
        },
      ],
    },

    {
      title:
        "BUSINESS",
      items: [
        {
          label:
            "Reports",
          icon:
            BarChart3,
          path:
            "/reports",
          roles: [
            "admin",
          ],
        },
        {
          label:
            "Performance",
          icon:
            Sparkles,
          path:
            "/performance",
          roles: [
            "manager",
            "admin",
          ],
        },
      ],
    },

    {
      title:
        "ACCOUNT",
      items: [
        {
          label:
            "Profile",
          icon: User,
          path:
            "/profile",
        },
        {
          label:
            "Billing",
          icon:
            CreditCard,
          path:
            "/billing",
          roles: [
            "admin",
          ],
        },
      ],
    },
  ];

  const filteredMenu =
    useMemo(() => {
      return menu
        .map(
          (group) => ({
            ...group,
            items:
              group.items.filter(
                (
                  item
                ) => {
                  const roleAllowed =
                    !item.roles ||
                    item.roles.includes(
                      role
                    );

                  const searchMatch =
                    item.label
                      .toLowerCase()
                      .includes(
                        search.toLowerCase()
                      );

                  return (
                    roleAllowed &&
                    searchMatch
                  );
                }
              ),
          })
        )
        .filter(
          (group) =>
            group.items
              .length >
            0
        );
    }, [role, search]);

  const pageTitle =
    menu
      .flatMap(
        (g) => g.items
      )
      .find(
        (item) =>
          item.path ===
          location.pathname
      )?.label ||
    "Dashboard";

  const initials = (
    user?.name ||
    user?.email ||
    "U"
  )
    .charAt(0)
    .toUpperCase();

  /* NOW RETURNS AFTER HOOKS */

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const go = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const Sidebar = () => (
    <div>
      Sidebar here
    </div>
  );

  return (
    <div className="h-screen bg-[#020617] text-white flex">
      <aside className="hidden lg:block w-80 border-r border-white/5">
        <Sidebar />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside>
            <Sidebar />
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-white/5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setMobileOpen(
                  true
                )
              }
              className="lg:hidden"
            >
              <Menu
                size={18}
              />
            </button>

            <h1>
              {pageTitle}
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Search
              size={16}
            />

            <input
              value={
                search
              }
              onChange={(
                e
              ) =>
                setSearch(
                  e.target
                    .value
                )
              }
              placeholder="Search..."
              className="bg-white/5 px-3 py-2 rounded-xl"
            />
          </div>

          <button
            onClick={logout}
          >
            <Bell
              size={18}
            />
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}