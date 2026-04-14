/* =========================================================
src/pages/Dashboard.js
VERSION 2 PREMIUM LIVE TRACKER
FULL COPY / PASTE FILE

UPGRADES INCLUDED
✅ Auto-fit all live pins
✅ Pulse live markers
✅ Last updated timer
✅ Staff count overlay
✅ Cleaner premium dashboard
✅ Faster refresh
✅ Mobile responsive
✅ Existing dashboards preserved
========================================================= */

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  shiftAPI,
  scheduleAPI,
  holidayAPI,
  userAPI,
  reportAPI,
  billingAPI,
} from "../services/api";

import {
  Clock3,
  Users,
  CalendarDays,
  Plane,
  Briefcase,
  CreditCard,
  Activity,
  RefreshCw,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* =========================================================
LEAFLET FIX
========================================================= */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pulseIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:18px;height:18px;">
      <span style="
        position:absolute;
        inset:0;
        border-radius:9999px;
        background:#22c55e;
        animation:pulse 1.8s infinite;
        opacity:.45;
      "></span>
      <span style="
        position:absolute;
        inset:4px;
        border-radius:9999px;
        background:#22c55e;
        border:2px solid white;
      "></span>
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/* =========================================================
MAIN
========================================================= */

export default function Dashboard() {
  const { user } = useAuth();

  const role = user?.role || "employee";

  if (role === "admin") return <AdminDashboard />;
  if (role === "manager") return <ManagerDashboard />;

  return <EmployeeDashboard />;
}

/* =========================================================
EMPLOYEE
========================================================= */

function EmployeeDashboard() {
  const [activeShift, setActiveShift] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [worked, setWorked] = useState(0);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let timer;

    if (activeShift?.clock_in_time) {
      timer = setInterval(() => {
        const now = Date.now();
        const start = new Date(
          activeShift.clock_in_time
        ).getTime();

        const total =
          Math.floor((now - start) / 1000) -
          (activeShift.total_break_seconds || 0);

        setWorked(total > 0 ? total : 0);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [activeShift]);

  const load = async () => {
    const [shift, rota, leave] =
      await Promise.all([
        shiftAPI.getActive(),
        scheduleAPI.getMine(),
        holidayAPI.getMine(),
      ]);

    setActiveShift(shift);
    setSchedule(rota || []);
    setHolidays(leave || []);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Welcome Back"
        sub="Your employee dashboard"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <Card
          title="Status"
          value={activeShift ? "Clocked In" : "Offline"}
          icon={<Clock3 size={16} />}
        />

        <Card
          title="Worked Today"
          value={formatTime(worked)}
          icon={<Activity size={16} />}
        />

        <Card
          title="My Shifts"
          value={schedule.length}
          icon={<CalendarDays size={16} />}
        />

        <Card
          title="Leave Requests"
          value={holidays.length}
          icon={<Plane size={16} />}
        />
      </div>
    </div>
  );
}

/* =========================================================
MANAGER
========================================================= */

function ManagerDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const summary = await reportAPI.getSummary();
    setStats(summary || {});
  };

  return (
    <div className="space-y-6">
      <Header
        title="Manager Dashboard"
        sub="Operations overview"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <Card
          title="Employees"
          value={stats.users || 0}
          icon={<Users size={16} />}
        />

        <Card
          title="Tasks"
          value={stats.tasks || 0}
          icon={<Briefcase size={16} />}
        />

        <Card
          title="Live Users"
          value={stats.activeUsers || 0}
          icon={<Clock3 size={16} />}
        />

        <Card
          title="Completed"
          value={stats.completedTasks || 0}
          icon={<CalendarDays size={16} />}
        />
      </div>
    </div>
  );
}

/* =========================================================
ADMIN
========================================================= */

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [plan, setPlan] = useState("free");
  const [live, setLive] = useState([]);
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    load();

    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  const load = async () => {
    const [summary, billing, active] =
      await Promise.all([
        reportAPI.getSummary(),
        billingAPI.getStatus(),
        shiftAPI.getActiveAll(),
      ]);

    setStats(summary || {});
    setPlan(billing?.plan || "free");
    setLive(active || []);
    setUpdated(new Date());
  };

  const validPins = useMemo(
    () =>
      live.filter(
        (x) => x.latitude && x.longitude
      ),
    [live]
  );

  return (
    <div className="space-y-6">
      <Header
        title="Admin Dashboard"
        sub="Premium live business overview"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <Card
          title="Total Staff"
          value={stats.users || 0}
          icon={<Users size={16} />}
        />

        <Card
          title="Tasks"
          value={stats.tasks || 0}
          icon={<Briefcase size={16} />}
        />

        <Card
          title="Live Users"
          value={stats.activeUsers || 0}
          icon={<Clock3 size={16} />}
        />

        <Card
          title="Plan"
          value={plan}
          icon={<CreditCard size={16} />}
        />
      </div>

      <Panel title="Live Employee Tracker">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <div className="text-sm text-gray-400">
            Real-time clock-in positions
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>
              {validPins.length} active
            </span>

            <span className="flex items-center gap-1">
              <RefreshCw size={12} />
              {updated
                ? updated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "--:--"}
            </span>
          </div>
        </div>

        {validPins.length === 0 ? (
          <div className="text-gray-400">
            No staff currently clocked in.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <MapContainer
              center={[
                Number(validPins[0].latitude),
                Number(validPins[0].longitude),
              ]}
              zoom={12}
              className="h-[420px] w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitToPins rows={validPins} />

              {validPins.map((row) => (
                <Marker
                  key={row.id}
                  icon={pulseIcon}
                  position={[
                    Number(row.latitude),
                    Number(row.longitude),
                  ]}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">
                        {row.users?.name ||
                          "Employee"}
                      </p>

                      <p className="text-gray-500">
                        Clocked in:
                      </p>

                      <p>
                        {time(row.clock_in_time)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* =========================================================
MAP AUTO FIT
========================================================= */

function FitToPins({ rows }) {
  const map = useMap();

  useEffect(() => {
    if (!rows.length) return;

    const bounds = rows.map((x) => [
      Number(x.latitude),
      Number(x.longitude),
    ]);

    map.fitBounds(bounds, {
      padding: [40, 40],
    });
  }, [rows, map]);

  return null;
}

/* =========================================================
UI
========================================================= */

function Header({ title, sub }) {
  return (
    <div>
      <h1 className="text-3xl font-semibold">
        {title}
      </h1>

      <p className="text-sm text-gray-400 mt-1">
        {sub}
      </p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] p-6">
      <h2 className="font-semibold mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] p-5">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-400">
          {title}
        </p>

        <div className="text-indigo-400">
          {icon}
        </div>
      </div>

      <h3 className="text-2xl font-semibold mt-3 capitalize">
        {value}
      </h3>
    </div>
  );
}

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return `${String(h).padStart(2, "0")}:${String(
    m
  ).padStart(2, "0")}:${String(s).padStart(
    2,
    "0"
  )}`;
}

function time(date) {
  return new Date(date).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}