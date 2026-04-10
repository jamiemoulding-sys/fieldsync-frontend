import { useState, useEffect } from "react";
import { locationAPI } from "../services/api";
import LocationPicker from "../components/LocationPicker";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";

export default function Locations() {
  const { user } = useAuth();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    radius: 100,
  });

  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await locationAPI.getLocations();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!position) {
      setError("Please select a location on the map");
      return;
    }

    try {
      const payload = {
        ...formData,
        latitude: position.lat,
        longitude: position.lng,
      };

      if (editingLocation) {
        await locationAPI.update(editingLocation.id, payload);
        setSuccess("Updated");
      } else {
        await locationAPI.create(payload);
        setSuccess("Created");
      }

      setShowModal(false);
      setEditingLocation(null);
      setPosition(null);
      setFormData({ name: "", address: "", radius: 100 });

      loadLocations();
    } catch (err) {
      // 🔥 FIX: no .response (API already unwraps)
      setError(err?.message || "Save failed");
    }
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

  const handleDelete = async (id) => {
    try {
      await locationAPI.delete(id);
      loadLocations();
    } catch (err) {
      setError(err?.message || "Delete failed");
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading locations...</div>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Locations</h1>
          <p className="text-gray-400 text-sm">
            Manage your business locations
          </p>
        </div>

        <button
          onClick={() => {
            setEditingLocation(null);
            setPosition(null);
            setFormData({ name: "", address: "", radius: 100 });
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-indigo-500/20"
        >
          + Add Location
        </button>
      </div>

      {/* LIST */}
      {locations.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No locations yet
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent"
            >
              <div className="bg-[#020617] border border-white/10 rounded-2xl p-4">

                <p className="font-semibold text-white">{loc.name}</p>
                <p className="text-gray-400 text-sm">{loc.address}</p>

                <p className="text-xs text-gray-500 mt-1">
                  Radius: {loc.radius || 100}m
                </p>

                <div className="flex gap-2 mt-4">

                  <button
                    onClick={() => handleEdit(loc)}
                    className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1 rounded-lg"
                  >
                    Delete
                  </button>

                </div>

              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#020617] border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold mb-4">
              {editingLocation ? "Edit Location" : "Add Location"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                placeholder="Location name"
                required
              />

              <input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                placeholder="Address"
              />

              <LocationPicker
                position={position}
                setPosition={setPosition}
              />

              {position && (
                <p className="text-xs text-gray-400">
                  {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                </p>
              )}

              <input
                type="number"
                value={formData.radius}
                onChange={(e) =>
                  setFormData({ ...formData, radius: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                placeholder="Radius (m)"
              />

              <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-xl text-sm transition">
                {editingLocation ? "Update" : "Create"}
              </button>

            </form>
          </motion.div>
        </div>
      )}

      {/* FEEDBACK */}
      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
      {success && (
        <div className="text-green-400 text-sm">{success}</div>
      )}

    </div>
  );
}