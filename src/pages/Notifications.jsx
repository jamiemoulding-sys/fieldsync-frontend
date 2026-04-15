import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Loader2,
  CheckCheck,
} from "lucide-react";

const STORAGE_KEY = "user_notifications";

export default function Notifications() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  function getUserKey() {
    return `${STORAGE_KEY}_${user?.id || "guest"}`;
  }

  function loadNotifications() {
    setLoading(true);

    setTimeout(() => {
      const saved = localStorage.getItem(
        getUserKey()
      );

      if (saved) {
        setRows(JSON.parse(saved));
      } else {
        const starter = [
          {
            id: 1,
            title: "Shift Assigned",
            message:
              "You have been assigned a shift tomorrow.",
            time: "2 mins ago",
            read: false,
          },
          {
            id: 2,
            title: "Holiday Approved",
            message:
              "Your holiday request was approved.",
            time: "1 hour ago",
            read: false,
          },
          {
            id: 3,
            title: "Clock Out Reminder",
            message:
              "Remember to clock out after your shift.",
            time: "Yesterday",
            read: true,
          },
        ];

        setRows(starter);

        localStorage.setItem(
          getUserKey(),
          JSON.stringify(starter)
        );
      }

      setLoading(false);
    }, 300);
  }

  function saveRows(data) {
    setRows(data);

    localStorage.setItem(
      getUserKey(),
      JSON.stringify(data)
    );
  }

  function markRead(id) {
    const updated = rows.map((item) =>
      item.id === id
        ? { ...item, read: true }
        : item
    );

    saveRows(updated);
  }

  function removeItem(id) {
    const updated = rows.filter(
      (item) => item.id !== id
    );

    saveRows(updated);
  }

  function markAllRead() {
    const updated = rows.map((item) => ({
      ...item,
      read: true,
    }));

    saveRows(updated);
  }

  function clearAll() {
    saveRows([]);
  }

  const unread = rows.filter(
    (item) => !item.read
  ).length;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2
          size={16}
          className="animate-spin"
        />
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Notifications
          </h1>

          <p className="text-sm text-gray-400">
            Alerts and updates
          </p>
        </div>

        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-xl bg-indigo-600 text-sm">
            {unread} unread
          </div>

          {rows.length > 0 && (
            <>
              <button
                onClick={markAllRead}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm"
              >
                Mark All Read
              </button>

              <button
                onClick={clearAll}
                className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-sm text-red-400"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {rows.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 ${
              item.read
                ? "border-white/10 bg-[#020617]"
                : "border-indigo-500/30 bg-[#0b1225]"
            }`}
          >
            <div className="flex justify-between gap-4">
              <div className="flex gap-3">
                <Bell
                  size={18}
                  className="text-indigo-400 mt-1"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {item.title}
                    </h3>

                    {!item.read && (
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 mt-1">
                    {item.message}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    {item.time}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {!item.read && (
                  <button
                    onClick={() =>
                      markRead(item.id)
                    }
                    className="w-10 h-10 rounded-xl bg-green-600/20 text-green-400 flex items-center justify-center"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}

                <button
                  onClick={() =>
                    removeItem(item.id)
                  }
                  className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#020617] p-10 text-center text-gray-500">
            <CheckCheck
              size={28}
              className="mx-auto mb-3"
            />
            No notifications
          </div>
        )}
      </div>
    </div>
  );
}