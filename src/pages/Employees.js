import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { userAPI } from "../services/api";
import { motion } from "framer-motion";

export default function Employees() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tempRoleData, setTempRoleData] = useState({
    userId: null,
    role: "manager",
    expiresAt: "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await userAPI.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, role) => {
    try {
      await userAPI.updateRole(id, { role });
      loadEmployees();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update role");
    }
  };

  const assignTempRole = async () => {
    if (!tempRoleData.expiresAt) {
      return alert("Please select an expiry date");
    }

    try {
      await userAPI.setTempRole(
        tempRoleData.userId,
        {
          role: tempRoleData.role,
          expiresAt: tempRoleData.expiresAt,
        }
      );

      setTempRoleData({
        userId: null,
        role: "manager",
        expiresAt: "",
      });

      loadEmployees();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to assign temp role");
    }
  };

  // 🔒 HARD LOCK
  if (user?.role === "employee") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-gray-400 text-sm">
          You don’t have access to Employees
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-gray-400">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Employees</h1>
        <p className="text-gray-400 text-sm">
          Manage your team & permissions
        </p>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#020617]">

        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Temporary Role</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp, i) => {

              const canEdit =
                user?.role === "admin" ||
                user?.role === "manager";

              const isSelf = emp.id === user?.id;

              return (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  {/* USER */}
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${emp.name}`}
                      className="w-9 h-9 rounded-full"
                    />

                    <div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-gray-400 text-xs">{emp.email}</p>
                    </div>
                  </td>

                  {/* ROLE */}
                  <td className="p-4">
                    {canEdit && !isSelf ? (
                      <select
                        value={emp.role}
                        onChange={(e) =>
                          updateRole(emp.id, e.target.value)
                        }
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>

                        {user?.role === "admin" && (
                          <option value="admin">Admin</option>
                        )}
                      </select>
                    ) : (
                      <RoleBadge role={emp.role} />
                    )}
                  </td>

                  {/* TEMP ROLE */}
                  <td className="p-4">

                    {emp.temp_role ? (
                      <div className="text-xs space-y-1">
                        <span className="text-yellow-400">
                          {emp.temp_role}
                        </span>

                        <p className="text-gray-500">
                          until {new Date(emp.temp_role_expires).toLocaleDateString()}
                        </p>

                        {canEdit && (
                          <button
                            onClick={async () => {
                              await userAPI.setTempRole(emp.id, {
                                role: null,
                                expiresAt: null,
                              });
                              loadEmployees();
                            }}
                            className="text-red-400 hover:underline text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ) : canEdit ? (
                      <button
                        onClick={() =>
                          setTempRoleData({
                            userId: emp.id,
                            role: "manager",
                            expiresAt: "",
                          })
                        }
                        className="text-indigo-400 text-xs hover:underline"
                      >
                        + Assign
                      </button>
                    ) : (
                      <span className="text-gray-500 text-xs">—</span>
                    )}

                  </td>

                  {/* STATUS */}
                  <td className="p-4">
                    <span className="text-green-400 text-xs flex items-center gap-1">
                      ● Active
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {employees.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No employees yet
          </div>
        )}
      </div>

      {/* TEMP ROLE MODAL */}
      {tempRoleData.userId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

          <div className="bg-[#020617] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">

            <h2 className="text-lg font-semibold">
              Assign Temporary Role
            </h2>

            <select
              value={tempRoleData.role}
              onChange={(e) =>
                setTempRoleData({
                  ...tempRoleData,
                  role: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            >
              <option value="manager">Manager</option>
              {user?.role === "admin" && (
                <option value="admin">Admin</option>
              )}
            </select>

            <input
              type="date"
              value={tempRoleData.expiresAt}
              onChange={(e) =>
                setTempRoleData({
                  ...tempRoleData,
                  expiresAt: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />

            <button
              onClick={assignTempRole}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-xl"
            >
              Assign Temporary Role
            </button>

            <button
              onClick={() =>
                setTempRoleData({
                  userId: null,
                  role: "manager",
                  expiresAt: "",
                })
              }
              className="w-full text-gray-400 text-sm"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

/* ROLE BADGE */

function RoleBadge({ role }) {
  const styles = {
    admin: "bg-red-500/20 text-red-400",
    manager: "bg-indigo-500/20 text-indigo-400",
    employee: "bg-gray-500/20 text-gray-400",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${styles[role]}`}>
      {role}
    </span>
  );
}