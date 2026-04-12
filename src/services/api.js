import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/* =========================================================
AUTH
========================================================= */

export const authAPI = {
  login: async ({ email, password }) => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;

    const { data: profile } =
      await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

    return {
      token: data.session.access_token,
      user: {
        ...profile,
        email: data.user.email,
      },
    };
  },

  me: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } =
      await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    return {
      ...profile,
      email: user.email,
    };
  },
};

/* =========================================================
USERS
========================================================= */

export const userAPI = {
  getAll: async () => {
    const { data, error } =
      await supabase
        .from("users")
        .select("*")
        .order("name");

    if (error) throw error;

    return data || [];
  },
};

/* =========================================================
INVITES
========================================================= */

export const inviteAPI = {
  send: async ({ email, role }) => {
    const { error } =
      await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            role:
              role || "employee",
          },
        },
      });

    if (error) throw error;

    return true;
  },
};

/* =========================================================
ANNOUNCEMENTS
========================================================= */

export const announcementAPI = {
  getAll: async () => [],
  create: async () => true,
  delete: async () => true,
};

/* =========================================================
TASKS
========================================================= */

export const taskAPI = {
  getAll: async () => [],
  getMine: async () => [],
  create: async () => true,
  update: async () => true,
  delete: async () => true,
};

/* =========================================================
LOCATIONS
========================================================= */

export const locationAPI = {
  getLocations: async () => {
    const { data, error } =
      await supabase
        .from("locations")
        .select("*")
        .order("name");

    if (error) throw error;

    return data || [];
  },

  create: async () => true,
  update: async () => true,
  delete: async () => true,
};

/* =========================================================
SHIFTS
========================================================= */

export const shiftAPI = {
  getActive: async () => null,
  getHistory: async () => [],
  clockIn: async () => true,
  clockOut: async () => true,
  startBreak: async () => true,
  endBreak: async () => true,
  updateLocation: async () => true,
};

/* =========================================================
SCHEDULE
========================================================= */

export const scheduleAPI = {
  getMine: async () => [],
  getAll: async () => [],
  create: async () => true,
  delete: async () => true,
};

/* =========================================================
HOLIDAYS
========================================================= */

export const holidayAPI = {
  getMine: async () => [],
  create: async () => true,
  getAll: async () => [],
  update: async () => true,
};

/* =========================================================
REPORTS / PERFORMANCE / BILLING
========================================================= */

export const performanceAPI = {
  getAll: async () => [],
};

export const managerAPI = {
  getDashboard: async () => ({}),
};

export const reportAPI = {
  getSummary: async () => ({}),
  getTimesheets: async () => [],
};

export const billingAPI = {
  checkout: async () => true,
  portal: async () => true,
};

export default supabase;