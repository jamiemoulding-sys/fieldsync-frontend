// src/services/api.js
// FULL CHECKED + BUILD SAFE VERSION
// ✅ notificationAPI exported
// ✅ billingAPI exported
// ✅ reportAPI exported
// ✅ userAPI exported
// ✅ taskAPI exported
// ✅ shiftAPI exported
// ✅ holidayAPI exported
// ✅ getActiveAll included
// ✅ create/update/delete included
// ✅ deploy safe

import axios from "axios";
import supabase from "../lib/supabase";

/* =====================================================
AXIOS
===================================================== */

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  withCredentials: false,
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization =
      `Bearer ${session.access_token}`;
  }

  return config;
});

/* =====================================================
HELPERS
===================================================== */

async function getAuthUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user");

  return user;
}

async function getCurrentUser() {
  const authUser = await getAuthUser();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (error) throw error;

  return data;
}

async function getCompanyId() {
  const user = await getCurrentUser();

  if (!user.company_id) {
    throw new Error("No company assigned");
  }

  return user.company_id;
}

/* =====================================================
AUTH
===================================================== */

export const authAPI = {
  login: async ({ email, password }) => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;

    return {
      token: data.session?.access_token,
      user: await getCurrentUser(),
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
    return true;
  },

  me: async () => {
    try {
      return await getCurrentUser();
    } catch {
      return null;
    }
  },
};

/* =====================================================
USERS
===================================================== */

export const userAPI = {
  getAll: async () => {
    const companyId = await getCompanyId();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("company_id", companyId)
      .order("name");

    if (error) throw error;

    return data || [];
  },

  getById: async (id) => {
    const companyId = await getCompanyId();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .eq("company_id", companyId)
      .single();

    if (error) throw error;

    return data;
  },

  create: async (payload) => {
    const companyId = await getCompanyId();

    const { error } = await supabase
      .from("users")
      .insert({
        ...payload,
        company_id: companyId,
      });

    if (error) throw error;

    return true;
  },

  update: async (id, payload) => {
    const companyId = await getCompanyId();

    const { error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", id)
      .eq("company_id", companyId);

    if (error) throw error;

    return true;
  },

  delete: async (id) => {
    const companyId = await getCompanyId();

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .eq("company_id", companyId);

    if (error) throw error;

    return true;
  },
};

/* =====================================================
TASKS
===================================================== */

export const taskAPI = {
  getAll: async () => {
    const companyId = await getCompanyId();

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data || [];
  },

  create: async (payload) => {
    const companyId = await getCompanyId();

    const { error } = await supabase
      .from("tasks")
      .insert({
        ...payload,
        company_id: companyId,
      });

    if (error) throw error;

    return true;
  },

  update: async (id, payload) => {
    const companyId = await getCompanyId();

    const { error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .eq("company_id", companyId);

    if (error) throw error;

    return true;
  },

  delete: async (id) => {
    const companyId = await getCompanyId();

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("company_id", companyId);

    if (error) throw error;

    return true;
  },
};

/* =====================================================
HOLIDAYS
===================================================== */

export const holidayAPI = {
  getAll: async () => {
    const companyId = await getCompanyId();

    const { data, error } = await supabase
      .from("holidays")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data || [];
  },

  getMine: async () => {
    const user = await getCurrentUser();

    const { data, error } = await supabase
      .from("holidays")
      .select("*")
      .eq("user_id", user.id)
      .eq("company_id", user.company_id);

    if (error) throw error;

    return data || [];
  },

  create: async (payload) => {
    const user = await getCurrentUser();

    const { error } = await supabase
      .from("holidays")
      .insert({
        ...payload,
        user_id: user.id,
        company_id: user.company_id,
        status: "pending",
      });

    if (error) throw error;

    return true;
  },
};

/* =====================================================
SHIFTS
===================================================== */

export const shiftAPI = {
  getAll: async () => {
    const companyId = await getCompanyId();

    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("company_id", companyId)
      .order("clock_in_time", {
        ascending: false,
      });

    if (error) throw error;

    return data || [];
  },

  getActiveAll: async () => {
    const companyId = await getCompanyId();

    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("company_id", companyId)
      .is("clock_out_time", null);

    if (error) throw error;

    return data || [];
  },

  getMine: async () => {
    const user = await getCurrentUser();

    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("user_id", user.id)
      .eq("company_id", user.company_id);

    if (error) throw error;

    return data || [];
  },

  clockIn: async (payload = {}) => {
    const user = await getCurrentUser();

    const { error } = await supabase
      .from("shifts")
      .insert({
        ...payload,
        user_id: user.id,
        company_id: user.company_id,
        clock_in_time: new Date().toISOString(),
      });

    if (error) throw error;

    return true;
  },

  clockOut: async () => {
    const user = await getCurrentUser();

    const { error } = await supabase
      .from("shifts")
      .update({
        clock_out_time:
          new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .is("clock_out_time", null);

    if (error) throw error;

    return true;
  },
};

/* =====================================================
NOTIFICATIONS
===================================================== */

export const notificationAPI = {
  getAll: async () => {
    const user = await getCurrentUser();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("company_id", user.company_id)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data || [];
  },

  getUnread: async () => {
    const user = await getCurrentUser();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) throw error;

    return data?.length || 0;
  },

  markRead: async (id) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) throw error;

    return true;
  },

  markAllRead: async () => {
    const user = await getCurrentUser();

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) throw error;

    return true;
  },

  create: async (payload) => {
    const { error } = await supabase
      .from("notifications")
      .insert(payload);

    if (error) throw error;

    return true;
  },

  clearAll: async () => {
    const user = await getCurrentUser();

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id);

    if (error) throw error;

    return true;
  },
};

/* =====================================================
REPORTS
===================================================== */

export const reportAPI = {
  getSummary: async () => {
    const users =
      await userAPI.getAll();

    const tasks =
      await taskAPI.getAll();

    const shifts =
      await shiftAPI.getAll();

    return {
      users: users.length,
      tasks: tasks.length,
      totalShifts: shifts.length,
      activeUsers:
        shifts.filter(
          (x) => !x.clock_out_time
        ).length,

      completedTasks:
        tasks.filter(
          (x) => x.completed
        ).length,
    };
  },

  getTimesheets: async () =>
    await shiftAPI.getAll(),
};

/* =====================================================
BILLING
===================================================== */

export const billingAPI = {
  checkout: async ({ plan }) => {
    const res = await api.post(
      "/billing/create-checkout-session",
      { plan }
    );

    return res.data;
  },

  portal: async () => {
    const res = await api.post(
      "/billing/portal"
    );

    return res.data;
  },

  getStatus: async () => {
    const companyId = await getCompanyId();

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (error) throw error;

    return {
      plan: data?.current_plan,
      status:
        data?.subscription_status,
      trial_ends_at:
        data?.trial_ends_at,
      trial_end:
        data?.trial_end,
      is_pro: data?.is_pro,
    };
  },
};

export default api;