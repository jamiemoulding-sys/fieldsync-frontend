// src/pages/Employees.js
// ELITE EMPLOYEES FINAL
// COPY / PASTE READY
// ✅ Existing UI kept
// ✅ Search / filter / sort
// ✅ Grid + table
// ✅ Invite modal
// ✅ Real employee data editor
// ✅ Optional payroll fields
// ✅ Dashboard-ready wage data
// ✅ Missing data insights
// ✅ Cleaner logic

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { userAPI, inviteAPI } from "../services/api";
import { motion } from "framer-motion";

import {
  Users,
  Search,
  Trash2,
  UserPlus,
  Crown,
  Shield,
  User,
  RefreshCw,
  X,
  LayoutGrid,
  Table,
  ArrowUpDown,
  Pencil,
  Save,
  AlertTriangle,
} from "lucide-react";

export default function Employees() {
  const { user } = useAuth();

  const [employees, setEmployees] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("name");

  const [view, setView] =
    useState("table");

  const [inviteOpen, setInviteOpen] =
    useState(false);

  const [inviteEmail, setInviteEmail] =
    useState("");

  const [inviteRole, setInviteRole] =
    useState("employee");

  const [editor, setEditor] =
    useState(null);

  const [form, setForm] = useState({});

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const data =
        await userAPI.getAll();

      setEmployees(
        Array.isArray(data)
          ? data
          : []
      );
    } catch {
      setError(
        "Failed to load employees"
      );
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let rows = [...employees];

    if (roleFilter !== "all") {
      rows = rows.filter(
        (x) =>
          x.role === roleFilter
      );
    }

    if (search.trim()) {
      const q =
        search.toLowerCase();

      rows = rows.filter(
        (x) =>
          x.name
            ?.toLowerCase()
            .includes(q) ||
          x.email
            ?.toLowerCase()
            .includes(q)
      );
    }

    rows.sort((a, b) => {
      if (sortBy === "role") {
        return (
          a.role || ""
        ).localeCompare(
          b.role || ""
        );
      }

      return (
        a.name ||
        a.email ||
        ""
      ).localeCompare(
        b.name ||
          b.email ||
          ""
      );
    });

    return rows;
  }, [
    employees,
    search,
    roleFilter,
    sortBy,
  ]);

  async function updateRole(
    id,
    role
  ) {
    try {
      setSaving(true);

      await userAPI.update(id, {
        role,
      });

      await loadEmployees();

      setSuccess(
        "Role updated"
      );
    } catch {
      setError(
        "Failed to update role"
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(id) {
    if (id === user?.id)
      return;

    if (
      !window.confirm(
        "Delete employee?"
      )
    )
      return;

    try {
      setSaving(true);

      await userAPI.delete(id);

      await loadEmployees();

      setSuccess(
        "Employee removed"
      );
    } catch {
      setError(
        "Delete failed"
      );
    } finally {
      setSaving(false);
    }
  }

  function openEditor(emp) {
    setEditor(emp);

    setForm({
      hourly_rate:
        emp.hourly_rate || "",
      contracted_hours:
        emp.contracted_hours ||
        "",
      overtime_rate:
        emp.overtime_rate || "",
      night_rate:
        emp.night_rate || "",
      employment_type:
        emp.employment_type ||
        "",
      department:
        emp.department || "",
      start_date:
        emp.start_date || "",
      holiday_allowance:
        emp.holiday_allowance ||
        "",
      payroll_id:
        emp.payroll_id || "",
      phone:
        emp.phone || "",
      emergency_contact:
        emp.emergency_contact ||
        "",
    });
  }

  async function saveEditor() {
    try {
      setSaving(true);

      await userAPI.update(
        editor.id,
        form
      );

      setEditor(null);

      await loadEmployees();

      setSuccess(
        "Employee updated"
      );
    } catch {
      setError(
        "Save failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function sendInvite() {
    try {
      setSaving(true);

      await inviteAPI.send({
        email: inviteEmail,
        role: inviteRole,
      });

      setInviteEmail("");
      setInviteRole(
        "employee"
      );
      setInviteOpen(false);

      setSuccess(
        "Invite sent"
      );
    } catch {
      setError(
        "Invite failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (user?.role === "employee") {
    return (
      <div className="text-gray-400">
        No access
      </div>
    );
  }

  const managers =
    employees.filter(
      (x) =>
        x.role === "manager"
    ).length;

  const admins =
    employees.filter(
      (x) =>
        x.role === "admin"
    ).length;

  const missingRates =
    employees.filter(
      (x) =>
        !x.hourly_rate &&
        !x.hour_rate
    ).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between gap-4 flex-wrap items-center">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Users size={24} />
            Employees
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Workforce &
            payroll setup
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={
              loadEmployees
            }
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 flex gap-2 items-center"
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          <button
            onClick={() =>
              setInviteOpen(
                true
              )
            }
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex gap-2 items-center"
          >
            <UserPlus size={15} />
            Invite
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {success && (
        <Alert
          green
          text={success}
        />
      )}

      {error && (
        <Alert
          red
          text={error}
        />
      )}

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">
        <CardStat
          title="Total Staff"
          value={
            employees.length
          }
        />

        <CardStat
          title="Managers"
          value={managers}
        />

        <CardStat
          title="Admins"
          value={admins}
        />

        <CardStat
          title="Missing Pay Rate"
          value={
            missingRates
          }
        />
      </div>

      {/* WARNINGS */}
      {missingRates > 0 && (
        <div className="rounded-xl px-4 py-3 bg-amber-500/10 text-amber-300 text-sm flex items-center gap-2">
          <AlertTriangle
            size={16}
          />
          {
            missingRates
          }{" "}
          staff need hourly
          rates for wage
          dashboard accuracy.
        </div>
      )}

      {/* FILTERS */}
      <div className="grid md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search
            size={16}
            className="absolute left-4 top-3.5 text-gray-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search employees..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#020617] border border-white/10"
          />
        </div>

        <select
          value={
            roleFilter
          }
          onChange={(e) =>
            setRoleFilter(
              e.target.value
            )
          }
          className="rounded-xl bg-[#020617] border border-white/10 px-4"
        >
          <option value="all">
            All Roles
          </option>
          <option value="employee">
            Employee
          </option>
          <option value="manager">
            Manager
          </option>
          <option value="admin">
            Admin
          </option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() =>
              setSortBy(
                sortBy ===
                  "name"
                  ? "role"
                  : "name"
              )
            }
            className="flex-1 rounded-xl bg-white/5"
          >
            <ArrowUpDown
              size={16}
              className="mx-auto"
            />
          </button>

          <button
            onClick={() =>
              setView(
                view ===
                  "table"
                  ? "grid"
                  : "table"
              )
            }
            className="flex-1 rounded-xl bg-white/5"
          >
            {view ===
            "table" ? (
              <LayoutGrid
                size={16}
                className="mx-auto"
              />
            ) : (
              <Table
                size={16}
                className="mx-auto"
              />
            )}
          </button>
        </div>
      </div>

      {/* TABLE */}
      {view === "table" && (
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#020617]">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-gray-400">
              <tr>
                <th className="p-4 text-left">
                  User
                </th>
                <th className="p-4 text-left">
                  Role
                </th>
                <th className="p-4 text-left">
                  Rate
                </th>
                <th className="p-4 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (emp) => (
                  <tr
                    key={
                      emp.id
                    }
                    className="border-t border-white/5"
                  >
                    <td className="p-4">
                      <UserBlock
                        emp={
                          emp
                        }
                      />
                    </td>

                    <td className="p-4">
                      {emp.id ===
                      user?.id ? (
                        <RoleBadge
                          role={
                            emp.role
                          }
                        />
                      ) : (
                        <select
                          value={
                            emp.role
                          }
                          onChange={(
                            e
                          ) =>
                            updateRole(
                              emp.id,
                              e
                                .target
                                .value
                            )
                          }
                          className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs"
                        >
                          <option value="employee">
                            Employee
                          </option>
                          <option value="manager">
                            Manager
                          </option>
                          <option value="admin">
                            Admin
                          </option>
                        </select>
                      )}
                    </td>

                    <td className="p-4">
                      {emp.hourly_rate
                        ? `£${emp.hourly_rate}`
                        : "-"}
                    </td>

                    <td className="p-4 flex gap-3">
                      <button
                        onClick={() =>
                          openEditor(
                            emp
                          )
                        }
                        className="text-indigo-400"
                      >
                        <Pencil
                          size={
                            16
                          }
                        />
                      </button>

                      {emp.id !==
                        user?.id && (
                        <button
                          onClick={() =>
                            removeUser(
                              emp.id
                            )
                          }
                          className="text-red-400"
                        >
                          <Trash2
                            size={
                              16
                            }
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* GRID */}
      {view === "grid" && (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map(
            (emp) => (
              <motion.div
                key={emp.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="rounded-2xl border border-white/10 bg-[#020617] p-5"
              >
                <UserBlock
                  emp={emp}
                />

                <div className="mt-4">
                  <RoleBadge
                    role={
                      emp.role
                    }
                  />
                </div>

                <p className="text-sm text-gray-400 mt-3">
                  Rate:{" "}
                  {emp.hourly_rate
                    ? `£${emp.hourly_rate}`
                    : "Not set"}
                </p>

                <button
                  onClick={() =>
                    openEditor(
                      emp
                    )
                  }
                  className="mt-4 w-full py-2 rounded-xl bg-indigo-600"
                >
                  Edit
                </button>
              </motion.div>
            )
          )}
        </div>
      )}

      {/* EDIT MODAL */}
      {editor && (
        <Modal
          title={`Edit ${editor.name}`}
          close={() =>
            setEditor(
              null
            )
          }
        >
          <div className="grid md:grid-cols-2 gap-3">
            {[
              [
                "hourly_rate",
                "Hourly Rate",
              ],
              [
                "contracted_hours",
                "Contracted Hours",
              ],
              [
                "overtime_rate",
                "Overtime Rate",
              ],
              [
                "night_rate",
                "Night Rate",
              ],
              [
                "department",
                "Department",
              ],
              [
                "employment_type",
                "Employment Type",
              ],
              [
                "holiday_allowance",
                "Holiday Days",
              ],
              [
                "payroll_id",
                "Payroll ID",
              ],
              [
                "phone",
                "Phone",
              ],
              [
                "emergency_contact",
                "Emergency Contact",
              ],
            ].map(
              ([key, label]) => (
                <input
                  key={key}
                  placeholder={
                    label
                  }
                  value={
                    form[
                      key
                    ] || ""
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      [key]:
                        e
                          .target
                          .value,
                    })
                  }
                  className="px-4 py-3 rounded-xl bg-slate-900 border border-white/10"
                />
              )
            )}

            <input
              type="date"
              value={
                form.start_date
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  start_date:
                    e.target
                      .value,
                })
              }
              className="px-4 py-3 rounded-xl bg-slate-900 border border-white/10"
            />
          </div>

          <button
            onClick={
              saveEditor
            }
            className="w-full mt-4 py-3 rounded-xl bg-indigo-600 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </Modal>
      )}

      {/* INVITE */}
      {inviteOpen && (
        <Modal
          title="Invite Employee"
          close={() =>
            setInviteOpen(
              false
            )
          }
        >
          <input
            value={
              inviteEmail
            }
            onChange={(e) =>
              setInviteEmail(
                e.target
                  .value
              )
            }
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10"
          />

          <select
            value={
              inviteRole
            }
            onChange={(e) =>
              setInviteRole(
                e.target
                  .value
              )
            }
            className="w-full mt-3 px-4 py-3 rounded-xl bg-slate-900 border border-white/10"
          >
            <option value="employee">
              Employee
            </option>
            <option value="manager">
              Manager
            </option>
            <option value="admin">
              Admin
            </option>
          </select>

          <button
            onClick={
              sendInvite
            }
            className="w-full mt-4 py-3 rounded-xl bg-indigo-600"
          >
            Send Invite
          </button>
        </Modal>
      )}
    </div>
  );
}

/* COMPONENTS */

function Modal({
  title,
  close,
  children,
}) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#020617] border border-white/10 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">
            {title}
          </h2>

          <button
            onClick={
              close
            }
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function UserBlock({
  emp,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center font-semibold">
        {(
          emp.name ||
          emp.email
        )
          .charAt(0)
          .toUpperCase()}
      </div>

      <div>
        <p>
          {emp.name ||
            "Unnamed"}
        </p>

        <p className="text-xs text-gray-400">
          {emp.email}
        </p>
      </div>
    </div>
  );
}

function RoleBadge({
  role,
}) {
  const styles = {
    admin:
      "bg-red-500/20 text-red-300",
    manager:
      "bg-indigo-500/20 text-indigo-300",
    employee:
      "bg-emerald-500/20 text-emerald-300",
  };

  const icons = {
    admin: (
      <Crown size={12} />
    ),
    manager: (
      <Shield size={12} />
    ),
    employee: (
      <User size={12} />
    ),
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs capitalize ${styles[role]}`}
    >
      {icons[role]}
      {role}
    </span>
  );
}

function CardStat({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617] p-5">
      <p className="text-xs text-gray-400">
        {title}
      </p>

      <h2 className="text-2xl font-semibold mt-2">
        {value}
      </h2>
    </div>
  );
}

function Alert({
  text,
  red,
  green,
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm ${
        red
          ? "bg-red-500/10 text-red-300"
          : "bg-green-500/10 text-green-300"
      }`}
    >
      {text}
    </div>
  );
}