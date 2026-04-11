import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { userAPI, inviteAPI } from "../services/api";
import { motion } from "framer-motion";

export default function Employees() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("employee");

  const [tempRoleData, setTempRoleData] = useState({
    userId: null,
    role: "manager",
    expiresAt: "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    let data = [...employees];

    if (roleFilter !== "all") {
      data = data.filter((u) => u.role === roleFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }

    setFiltered(data);
  }, [employees, search, roleFilter]);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const data = await userAPI.getAll();

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load employees");
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
      return alert("Select expiry date");
    }

    try {
      await userAPI.setTempRole(tempRoleData.userId, {
        role: tempRoleData.role,
        expiresAt: tempRoleData.expiresAt,
      });

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

  const sendInvite = async () => {
    try {
      if (!inviteEmail) return alert("Enter email");

      await inviteAPI.send({
        email: inviteEmail,
        role: inviteRole,
      });

      alert("Invite sent");

      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("employee");
    } catch (err) {
      alert(err?.response?.data?.error || "Invite failed");
    }
  };

  if (user?.role === "employee") {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-400">
        No access
      </div>
    );
  }

  if (loading) {
    return <div className="text-gray-400">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-gray-400 text-sm">
            Manage staff & permissions
          </p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={() => setInviteOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm"
          >
            + Invite Employee
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="grid md:grid-cols-2 gap-3">
        <input
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
        >
          <option value="all">All Roles</option>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#020617]">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Temp Role</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((emp, i) => {
              const canEdit =
                user?.role === "admin" ||
                user?.role === "manager";

              const isSelf = emp.id === user?.id;

              return (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${emp.name}`}
                        className="w-9 h-9 rounded-full"
                      />

                      <div>
                        <p>{emp.name}</p>
                        <p className="text-xs text-gray-400">
                          {emp.email}
                        </p>
                      </div>
                    </div>
                  </td>

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

                  <td className="p-4">
                    {emp.temp_role ? (
                      <div className="text-xs space-y-1">
                        <p className="text-yellow-400">
                          {emp.temp_role}
                        </p>

                        <p className="text-gray-500">
                          until{" "}
                          {new Date(
                            emp.temp_role_expires
                          ).toLocaleDateString()}
                        </p>
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
                        className="text-indigo-400 text-xs"
                      >
                        + Assign
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-4">
                    <span className="text-green-400 text-xs">
                      ● Active
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No employees found
          </div>
        )}
      </div>

      {/* INVITE */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#020617] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">
              Invite Employee
            </h2>

            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={sendInvite}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-xl"
            >
              Send Invite
            </button>

            <button
              onClick={() => setInviteOpen(false)}
              className="w-full text-gray-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TEMP ROLE */}
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
              Assign
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

function RoleBadge({ role }) {
  const styles = {
    admin: "bg-red-500/20 text-red-400",
    manager: "bg-indigo-500/20 text-indigo-400",
    employee: "bg-gray-500/20 text-gray-400",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs ${styles[role]}`}
    >
      {role}
    </span>
  );
}