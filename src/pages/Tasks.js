import { useState, useEffect } from "react";
import { taskAPI, locationAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import {
  CheckCircle,
  MapPin,
  Plus,
  Clock3,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";

export default function Tasks() {
  const { user, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "normal",
  });

  const [selectedLocation, setSelectedLocation] =
    useState("");

  const [completedTasks, setCompletedTasks] =
    useState([]);

  useEffect(() => {
    if (authLoading || !user) return;
    loadData();
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [tasksData, locationsData] =
        await Promise.all([
          taskAPI.getTasks(),
          locationAPI.getLocations(),
        ]);

      setTasks(
        Array.isArray(tasksData)
          ? tasksData
          : []
      );

      setLocations(
        Array.isArray(locationsData)
          ? locationsData
          : []
      );

    } catch (err) {
      console.error(err);

    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      await taskAPI.create({
        ...newTask,
        location_id: selectedLocation,
      });

      setShowModal(false);

      setNewTask({
        title: "",
        description: "",
        priority: "normal",
      });

      setSelectedLocation("");

      loadData();

    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await taskAPI.complete(taskId);

      setCompletedTasks((prev) => [
        ...prev,
        taskId,
      ]);

    } catch (err) {
      alert("Failed to complete task");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="text-gray-400">
        Loading tasks...
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) =>
    `${task.title} ${task.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const total = tasks.length;
  const done = completedTasks.length;
  const open = total - done;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">

        <div>
          <h1 className="text-2xl font-semibold">
            Tasks
          </h1>

          <p className="text-sm text-gray-400">
            Manage daily operations
          </p>
        </div>

        <button
          onClick={() =>
            setShowModal(true)
          }
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm transition"
        >
          <Plus size={16} />
          Add Task
        </button>

      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-3 gap-4">

        <StatCard
          title="Total Tasks"
          value={total}
          icon={<Clock3 size={16} />}
        />

        <StatCard
          title="Open Tasks"
          value={open}
          icon={<AlertTriangle size={16} />}
        />

        <StatCard
          title="Completed"
          value={done}
          icon={<CheckCircle size={16} />}
        />

      </div>

      {/* SEARCH */}
      <div className="relative">

        <Search
          size={16}
          className="absolute left-4 top-3.5 text-gray-500"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search tasks..."
          className="w-full bg-[#020617] border border-white/10 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
        />

      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-5">

        {filteredTasks.map((task, i) => {
          const isDone =
            completedTasks.includes(
              task.id
            );

          const location =
            locations.find(
              (l) =>
                l.id ===
                task.location_id
            );

          return (
            <motion.div
              key={task.id}
              initial={{
                opacity: 0,
                y: 20,
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
              <div className="bg-[#020617] border border-white/10 rounded-2xl p-5 h-full flex flex-col justify-between">

                <div>

                  <div className="flex justify-between items-start gap-3">

                    <p className="font-semibold">
                      {task.title}
                    </p>

                    <PriorityBadge
                      priority={
                        task.priority ||
                        "normal"
                      }
                    />

                  </div>

                  <p className="text-sm text-gray-400 mt-2">
                    {task.description ||
                      "No description"}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-4">
                    <MapPin size={12} />
                    {location?.name ||
                      "Unknown"}
                  </div>

                </div>

                <div className="mt-5">

                  {isDone ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle
                        size={16}
                      />
                      Completed
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        handleComplete(
                          task.id
                        )
                      }
                      className="w-full bg-green-600 hover:bg-green-500 py-2 rounded-xl text-sm transition"
                    >
                      Complete Task
                    </button>
                  )}

                </div>

              </div>
            </motion.div>
          );
        })}

      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No matching tasks
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">

          <motion.div
            initial={{
              scale: 0.95,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="w-full max-w-md bg-[#020617] border border-white/10 rounded-2xl p-6"
          >

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-lg font-semibold">
                Create Task
              </h2>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={
                handleCreateTask
              }
              className="space-y-4"
            >

              <input
                placeholder="Task title"
                value={
                  newTask.title
                }
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    title:
                      e.target
                        .value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                required
              />

              <textarea
                placeholder="Description"
                value={
                  newTask.description
                }
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    description:
                      e.target
                        .value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-h-[110px]"
              />

              <select
                value={
                  newTask.priority
                }
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    priority:
                      e.target
                        .value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                <option value="low">
                  Low
                </option>
                <option value="normal">
                  Normal
                </option>
                <option value="high">
                  High
                </option>
              </select>

              <select
                value={
                  selectedLocation
                }
                onChange={(e) =>
                  setSelectedLocation(
                    e.target.value
                  )
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                required
              >
                <option value="">
                  Select Location
                </option>

                {locations.map(
                  (loc) => (
                    <option
                      key={
                        loc.id
                      }
                      value={
                        loc.id
                      }
                    >
                      {loc.name}
                    </option>
                  )
                )}

              </select>

              <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-medium transition">
                Create Task
              </button>

            </form>

          </motion.div>

        </div>
      )}

    </div>
  );
}

/* COMPONENTS */

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
      <div className="bg-[#020617] border border-white/10 rounded-2xl p-4">

        <div className="flex justify-between items-center">

          <p className="text-xs text-gray-400">
            {title}
          </p>

          <div className="text-indigo-400">
            {icon}
          </div>

        </div>

        <h2 className="text-2xl mt-2 font-semibold">
          {value}
        </h2>

      </div>
    </div>
  );
}

function PriorityBadge({
  priority,
}) {
  const styles = {
    low: "bg-gray-500/20 text-gray-300",
    normal:
      "bg-indigo-500/20 text-indigo-300",
    high: "bg-red-500/20 text-red-300",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}