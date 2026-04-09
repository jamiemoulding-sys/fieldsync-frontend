import axios from "axios";

// =========================
// 🌍 BASE CONFIG
// =========================
const api = axios.create({
  baseURL: "https://fieldsync-backend-clean-t7vn.onrender.com/api",
  timeout: 10000,
});

// =========================
// 🔐 AUTH TOKEN HANDLER
// =========================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =========================
// ❌ GLOBAL ERROR HANDLER
// =========================
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("🚨 API ERROR:", err?.response?.data || err.message);

    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

// =========================
// 🧠 HELPER
// =========================
const unwrap = async (promise) => {
  const res = await promise;
  return res?.data;
};

// =========================
// 🔐 AUTH
// =========================
export const authAPI = {
  login: (data) => unwrap(api.post("/auth/login", data)),
  register: (data) => unwrap(api.post("/auth/register", data)),
};

// =========================
// ⏱ SHIFTS
// =========================
export const shiftAPI = {
  getActive: () => unwrap(api.get("/shifts/active")),
  getAllActive: () => unwrap(api.get("/shifts/active-all")),
  clockIn: (data) => unwrap(api.post("/shifts/clock-in", data)),
  clockOut: () => unwrap(api.post("/shifts/clock-out")),
  getHistory: () => unwrap(api.get("/shifts/history")),
};

// =========================
// 👥 USERS
// =========================
export const userAPI = {
  getAll: () => unwrap(api.get("/users")),
};

// =========================
// 📅 SCHEDULES
// =========================
export const scheduleAPI = {
  getAll: () => unwrap(api.get("/schedules")),
  getMine: () => unwrap(api.get("/schedules/my-schedule")),
  create: (data) => unwrap(api.post("/schedules", data)),
  update: (id, data) => unwrap(api.put(`/schedules/${id}`, data)),
  delete: (id) => unwrap(api.delete(`/schedules/${id}`)),
  getLate: () => unwrap(api.get("/schedules/late-arrivals")),
};

// =========================
// 🌴 HOLIDAYS
// =========================
export const holidayAPI = {
  getAll: () => unwrap(api.get("/schedules/holiday-requests")),

  create: (data) =>
    unwrap(api.post("/schedules/holiday-requests", data)),

  update: (id, data) =>
    unwrap(api.put(`/schedules/holiday-requests/${id}`, data)),

  delete: (id) =>
    unwrap(api.delete(`/schedules/holiday-requests/${id}`)),

  getPending: async () => {
    const data = await unwrap(api.get("/schedules/holiday-requests"));
    return data.filter((h) => h.status === "pending");
  },

  getByStatus: async (status) => {
    const data = await unwrap(api.get("/schedules/holiday-requests"));
    return data.filter((h) => h.status === status);
  },
};

// =========================
// 📈 PERFORMANCE
// =========================
export const performanceAPI = {
  getAll: () => unwrap(api.get("/performance")),
};

// =========================
// 📍 LOCATIONS
// =========================
export const locationAPI = {
  getLocations: () => unwrap(api.get("/locations")),
  create: (data) => unwrap(api.post("/locations", data)),
  update: (id, data) => unwrap(api.put(`/locations/${id}`, data)),
  delete: (id) => unwrap(api.delete(`/locations/${id}`)),
};

// =========================
// 📋 TASKS
// =========================
export const taskAPI = {
  getTasks: () => unwrap(api.get("/tasks/all")),
  create: (data) => unwrap(api.post("/tasks", data)),
  complete: (task_id) =>
    unwrap(api.post("/tasks/complete", { task_id })),
};

// =========================
// 📊 REPORTS
// =========================
export const reportAPI = {
  getTimesheets: () => unwrap(api.get("/reports/timesheets")),
};

// =========================
// 📈 ANALYTICS
// =========================
export const analyticsAPI = {
  getShifts: () => unwrap(api.get("/shifts/analytics")),
};

// =========================
// 🧠 DASHBOARD
// =========================
export const managerAPI = {
  getDashboard: () => unwrap(api.get("/dashboard")),
  getActiveShifts: () => unwrap(api.get("/shifts/active-all")),
};

// =========================
// 📤 UPLOADS
// =========================
export const uploadAPI = {
  upload: (formData) =>
    unwrap(
      api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),
};

export default api;