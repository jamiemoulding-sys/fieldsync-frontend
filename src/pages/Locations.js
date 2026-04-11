import { useState, useEffect } from "react";
import { locationAPI } from "../services/api";
import LocationPicker from "../components/LocationPicker";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Radius,
  Search,
} from "lucide-react";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const [position, setPosition] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    radius: 100,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();

    const data = locations.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        l.address?.toLowerCase().includes(q)
    );

    setFiltered(data);
  }, [search, locations]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationAPI.getLocations();
      const list = Array.isArray(data) ? data : [];

      setLocations(list);
      setFiltered(list);
    } catch (err) {
      setError("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingLocation(null);
    setPosition(null);

    setFormData({
      name: "",
      address: "",
      radius: 100,
    });
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (loc) => {
    setEditingLocation(loc);

    setFormData({
      name: loc.name,
      address: loc.address || "",
      radius: loc.radius || 100,
    });

    setPosition({
      lat: loc.latitude,
      lng: loc.longitude,
    });

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!position) {
      return setError("Select map position");
    }

    try {
      const payload = {
        ...formData,
        latitude: position.lat,
        longitude: position.lng,
      };

      if (editingLocation) {
        await locationAPI.update(editingLocation.id, payload);
        setSuccess("Location updated");
      } else {
        await locationAPI.create(payload);
        setSuccess("Location created");
      }

      setShowModal(false);
      resetForm();
      loadLocations();

    } catch (err) {
      setError(err?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this location?")) return;

    try {
      await locationAPI.delete(id);
      loadLocations();
    } catch {
      setError("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading locations...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Locations
          </h1>

          <p className="text-sm text-gray-400">
            Manage geofence work zones
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Add Location
        </button>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Total Locations" value={locations.length} />
        <StatCard
          title="Avg Radius"
          value={
            locations.length
              ? `${Math.round(
                  locations.reduce(
                    (a, b) => a + Number(b.radius || 0),
                    0
                  ) / locations.length
                )}m`
              : "0m"
          }
        />
        <StatCard
          title="Search Results"
          value={filtered.length}
        />
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-3.5 text-gray-500"
        />

        <input
          placeholder="Search locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#020617] border border-white/10 rounded-2xl pl-11 pr-4 py-3"
        />
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No locations found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent"
            >
              <div className="bg-[#020617] border border-white/10 rounded-2xl p-5">

                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-medium text-lg">
                      {loc.name}
                    </p>

                    <p className="text-sm text-gray-400 mt-1 flex gap-2 items-start">
                      <MapPin size={14} />
                      {loc.address || "No address"}
                    </p>

                    <p className="text-xs text-indigo-400 mt-3 flex gap-2 items-center">
                      <Radius size={14} />
                      Radius {loc.radius || 100}m
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-5">
                  <button
                    onClick={() => handleEdit(loc)}
                    className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm flex items-center justify-center gap-2"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-[#020617] border border-white/10 rounded-2xl w-full max-w-xl p-6"
            >
              <h2 className="text-lg font-semibold mb-5">
                {editingLocation
                  ? "Edit Location"
                  : "Create Location"}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Location name"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                />

                <input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: e.target.value,
                    })
                  }
                  placeholder="Address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                />

                <LocationPicker
                  position={position}
                  setPosition={setPosition}
                />

                {position && (
                  <p className="text-xs text-gray-400">
                    {position.lat.toFixed(5)},{" "}
                    {position.lng.toFixed(5)}
                  </p>
                )}

                <input
                  type="number"
                  min="10"
                  value={formData.radius}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      radius: e.target.value,
                    })
                  }
                  placeholder="Radius (meters)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                />

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-3 rounded-xl bg-white/5 hover:bg-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500"
                  >
                    {editingLocation
                      ? "Update"
                      : "Create"}
                  </button>
                </div>

              </form>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* FEEDBACK */}
      {error && (
        <div className="text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-400 text-sm">
          {success}
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
      <div className="bg-[#020617] border border-white/10 rounded-2xl p-4">
        <p className="text-xs text-gray-400">
          {title}
        </p>

        <h2 className="text-2xl font-semibold mt-2">
          {value}
        </h2>
      </div>
    </div>
  );
}