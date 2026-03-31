import axios from 'axios';

const api = axios.create({
  baseURL: 'https://zorvia-api.onrender.com/api',
});

// ✅ Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =========================
// ✅ AUTH
// =========================
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// =========================
// ✅ SHIFTS
// =========================
export const shiftAPI = {
  getActive: () => api.get('/shifts/active'),
  clockIn: (data) => api.post('/shifts/clock-in', data),
  clockOut: () => api.post('/shifts/clock-out'), // ✅ MUST be this
};

// =========================
// ✅ LOCATIONS
// =========================
export const locationAPI = {
  getLocations: () => api.get('/locations'),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
};


// =========================
// ✅ TASKS
// =========================
export const taskAPI = {
  getTasks: () => api.get('/tasks/all'),
  create: (data) => api.post('/tasks', data),
  complete: (task_id) => api.post('/tasks/complete', { task_id }), // ✅ STEP 4
};
// =========================
// ✅ MANAGER
// =========================
export const managerAPI = {
  getDashboard: () => api.get('/dashboard'),
  getActiveShifts: () => api.get('/shifts'),
};

// =========================
// ✅ UPLOADS
// =========================
export const uploadAPI = {
  upload: (formData) =>
    api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// =========================
// ✅ REPORTS
// =========================
export const reportAPI = {
  getTimesheets: () => api.get('/reports/timesheets'),
};

// =========================
// DEFAULT EXPORT (keep this)
// =========================
export default api;