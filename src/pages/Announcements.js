// src/pages/Announcements.jsx
// FULL FILE - MULTI COMPANY SAFE

import { useEffect, useState } from "react";
import { announcementAPI } from "../services/api";
import { motion } from "framer-motion";
import {
  Megaphone,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Info,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "normal",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const data = await announcementAPI.getAll();

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load announcements failed:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function createItem() {
    if (!form.title.trim() || !form.message.trim()) {
      alert("Fill all fields");
      return;
    }

    try {
      setSaving(true);

      await announcementAPI.create({
        title: form.title.trim(),
        message: form.message.trim(),
        priority: form.priority,
      });

      setForm({
        title: "",
        message: "",
        priority: "normal",
      });

      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to send announcement");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id) {
    const ok = window.confirm("Delete this announcement?");
    if (!ok) return;

    try {
      await announcementAPI.delete(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  function getStyles(priority) {
    if (priority === "critical") {
      return "bg-red-500/10 border-red-500/30";
    }

    if (priority === "warning") {
      return "bg-yellow-500/10 border-yellow-500/30";
    }

    return "bg-[#020617] border-white/10";
  }

  function getIcon(priority) {
    if (priority === "critical") {
      return (
        <ShieldAlert
          size={16}
          className="text-red-400"
        />
      );
    }

    if (priority === "warning") {
      return (
        <AlertTriangle
          size={16}
          className="text-yellow-400"
        />
      );
    }

    return (
      <Info
        size={16}
        className="text-indigo-400"
      />
    );
  }

  if (loading) {
    return (
      <div className="text-gray-400 flex items-center gap-2">
        <Loader2
          size={16}
          className="animate-spin"
        />
        Loading announcements...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">
            Announcements
          </h1>

          <p className="text-sm text-gray-400">
            Broadcast updates to your workforce
          </p>
        </div>

        <button
          onClick={load}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm flex items-center gap-2"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* CREATE */}
      <div className="rounded-3xl p-[1px] bg-gradient-to-r from-indigo-500/30 to-transparent">
        <div className="bg-[#020617] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <h3 className="font-medium">
              New Message
            </h3>
          </div>

          <input
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            placeholder="Title"
            maxLength={80}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
          />

          <textarea
            rows="5"
            value={form.message}
            onChange={(e) =>
              setForm({
                ...form,
                message: e.target.value,
              })
            }
            placeholder="Write your message..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 resize-none"
          />

          <select
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value,
              })
            }
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
          >
            <option value="normal">
              Normal
            </option>

            <option value="warning">
              Warning
            </option>

            <option value="critical">
              Critical
            </option>
          </select>

          <button
            onClick={createItem}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 py-3 rounded-2xl font-medium flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Megaphone size={16} />
            )}

            Send Announcement
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {items.length === 0 && (
          <div className="text-gray-500">
            No announcements yet
          </div>
        )}

        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: i * 0.04,
            }}
            className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent"
          >
            <div
              className={`border rounded-2xl p-5 ${getStyles(
                item.priority
              )}`}
            >
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getIcon(item.priority)}

                    <h3 className="font-medium">
                      {item.title}
                    </h3>

                    <span className="text-[10px] uppercase tracking-wider text-gray-400 ml-auto">
                      {item.priority}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mt-3 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <button
                  onClick={() =>
                    deleteItem(item.id)
                  }
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}