import React, { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Loader2,
} from "lucide-react";

export default function Notifications() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  function loadNotifications() {
    setLoading(true);

    setTimeout(() => {
      setRows([
        {
          id: 1,
          title: "Shift Assigned",
          message: "You have been assigned a shift tomorrow.",
          time: "2 mins ago",
          read: false,
        },
        {
          id: 2,
          title: "Holiday Approved",
          message: "Your holiday request was approved.",
          time: "1 hour ago",
          read: false,
        },
        {
          id: 3,
          title: "Clock Out Reminder",
          message: "Remember to clock out after your shift.",
          time: "Yesterday",
          read: true,
        },
      ]);

      setLoading(false);
    }, 400);
  }

  function markRead(id) {
    setRows((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, read: true }
          : item
      )
    );
  }

  function removeItem(id) {
    setRows((prev) =>
      prev.filter((item) => item.id !== id)
    );
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
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Notifications
          </h1>

          <p className="text-sm text-gray-400">
            Alerts and updates
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-indigo-600 text-sm">
          {unread} unread
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        {rows.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-[#020617] p-5"
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
            No notifications
          </div>
        )}
      </div>
    </div>
  );
}