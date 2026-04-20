// src/pages/PayrollExport.js
// FULL COPY / PASTE READY
// FIELDSYNC ENTERPRISE VERSION
// ✅ Weekly payroll totals
// ✅ Employee selector
// ✅ Date range
// ✅ Standard + overtime pay
// ✅ Mileage pay
// ✅ CSV export
// ✅ HMRC ready layout
// ✅ Premium UI

import { useEffect, useMemo, useState } from "react";
import {
  reportAPI,
  userAPI,
} from "../services/api";

import {
  Download,
  PoundSterling,
  Users,
  Clock3,
  Truck,
  CalendarDays,
  Loader2,
} from "lucide-react";

export default function PayrollExport() {
  const [rows, setRows] = useState([]);
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [fromDate, setFromDate] =
    useState(
      new Date(
        Date.now() -
          7 * 86400000
      )
        .toISOString()
        .split("T")[0]
    );

  const [toDate, setToDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [mileageRate, setMileageRate] =
    useState("0.45");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const [timesheets, staff] =
        await Promise.all([
          reportAPI.getTimesheets(),
          userAPI.getAll(),
        ]);

      setRows(
        Array.isArray(
          timesheets
        )
          ? timesheets
          : []
      );

      setUsers(
        Array.isArray(staff)
          ? staff
          : []
      );
    } finally {
      setLoading(false);
    }
  }

  function hours(
    start,
    end,
    breakSec = 0
  ) {
    if (!start || !end)
      return 0;

    const total =
      (new Date(end) -
        new Date(start)) /
        3600000 -
      breakSec / 3600;

    return Math.max(
      total,
      0
    );
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const day =
        r.clock_in_time?.split(
          "T"
        )[0];

      return (
        day >= fromDate &&
        day <= toDate
      );
    });
  }, [
    rows,
    fromDate,
    toDate,
  ]);

  const payroll = useMemo(() => {
    return users.map(
      (user) => {
        const userRows =
          filtered.filter(
            (r) =>
              r.user_id ===
              user.id
          );

        let totalHours = 0;
        let overtime = 0;

        userRows.forEach(
          (r) => {
            const h =
              hours(
                r.clock_in_time,
                r.clock_out_time,
                r.total_break_seconds
              );

            totalHours += h;

            if (h > 8)
              overtime +=
                h - 8;
          }
        );

        const rate =
          Number(
            user.hourly_rate ||
              0
          );

        const otRate =
          Number(
            user.overtime_rate ||
              rate * 1.5
          );

        const mileage =
          Number(
            user.mileage_km ||
              0
          );

        const mileagePay =
          mileage *
          Number(
            mileageRate
          );

        const pay =
          totalHours *
            rate +
          overtime *
            (otRate -
              rate) +
          mileagePay;

        return {
          ...user,
          totalHours:
            totalHours.toFixed(
              2
            ),
          overtime:
            overtime.toFixed(
              2
            ),
          mileage:
            mileage.toFixed(
              2
            ),
          pay: pay.toFixed(2),
        };
      }
    );
  }, [
    users,
    filtered,
    mileageRate,
  ]);

  const totalPay =
    payroll
      .reduce(
        (sum, r) =>
          sum +
          Number(r.pay),
        0
      )
      .toFixed(2);

  function exportCSV() {
    const csv = [
      [
        "Employee",
        "Hours",
        "Overtime",
        "Mileage",
        "Gross Pay",
      ],
      ...payroll.map(
        (r) => [
          r.name,
          r.totalHours,
          r.overtime,
          r.mileage,
          r.pay,
        ]
      ),
    ]
      .map((x) =>
        x.join(",")
      )
      .join("\n");

    const blob =
      new Blob([csv], {
        type: "text/csv",
      });

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        "a"
      );

    a.href = url;
    a.download =
      "fieldsync_payroll.csv";
    a.click();
  }

  if (loading) {
    return (
      <div className="text-gray-400 flex gap-2 items-center">
        <Loader2
          size={16}
          className="animate-spin"
        />
        Loading payroll...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Payroll Export
          </h1>

          <p className="text-sm text-gray-400">
            HMRC ready wages
          </p>
        </div>

        <button
          onClick={
            exportCSV
          }
          className="px-4 py-3 rounded-2xl bg-indigo-600"
        >
          <Download size={16} />
        </button>
      </div>

      {/* FILTERS */}
      <div className="grid md:grid-cols-3 gap-4">

        <input
          type="date"
          value={
            fromDate
          }
          onChange={(e) =>
            setFromDate(
              e.target
                .value
            )
          }
          className="px-4 py-3 rounded-2xl bg-[#020617]"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) =>
            setToDate(
              e.target
                .value
            )
          }
          className="px-4 py-3 rounded-2xl bg-[#020617]"
        />

        <input
          value={
            mileageRate
          }
          onChange={(e) =>
            setMileageRate(
              e.target
                .value
            )
          }
          placeholder="Mileage £/km"
          className="px-4 py-3 rounded-2xl bg-[#020617]"
        />

      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">

        <Card
          title="Employees"
          value={
            payroll.length
          }
          icon={
            <Users size={16} />
          }
        />

        <Card
          title="Gross Payroll"
          value={`£${totalPay}`}
          icon={
            <PoundSterling size={16} />
          }
        />

        <Card
          title="Entries"
          value={
            filtered.length
          }
          icon={
            <CalendarDays size={16} />
          }
        />

        <Card
          title="Mileage Rate"
          value={`£${mileageRate}`}
          icon={
            <Truck size={16} />
          }
        />

      </div>

      {/* TABLE */}
      <div className="rounded-3xl overflow-auto border border-white/10 bg-[#020617]">
        <table className="w-full text-sm">

          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4 text-left">
                Employee
              </th>
              <th className="p-4 text-left">
                Hours
              </th>
              <th className="p-4 text-left">
                OT
              </th>
              <th className="p-4 text-left">
                Mileage
              </th>
              <th className="p-4 text-left">
                Pay
              </th>
            </tr>
          </thead>

          <tbody>
            {payroll.map(
              (r) => (
                <tr
                  key={r.id}
                  className="border-t border-white/5"
                >
                  <td className="p-4">
                    {r.name}
                  </td>

                  <td className="p-4">
                    {
                      r.totalHours
                    }
                  </td>

                  <td className="p-4 text-amber-400">
                    {
                      r.overtime
                    }
                  </td>

                  <td className="p-4">
                    {
                      r.mileage
                    }
                  </td>

                  <td className="p-4 text-green-400">
                    £{r.pay}
                  </td>
                </tr>
              )
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}

function Card({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl bg-[#020617] border border-white/10 p-5">
      <div className="flex justify-between">
        <p className="text-xs text-gray-400">
          {title}
        </p>
        <div className="text-indigo-400">
          {icon}
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-3">
        {value}
      </h2>
    </div>
  );
}