import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/* ======================================================
AUTH
====================================================== */

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

    const { data } =
      await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    return {
      ...data,
      email: user.email,
    };
  },
};

/* ======================================================
USERS
====================================================== */

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

  updateRole: async (id, payload) => {
    const { error } =
      await supabase
        .from("users")
        .update(payload)
        .eq("id", id);

    if (error) throw error;

    return true;
  },

  delete: async (id) => {
    const { error } =
      await supabase
        .from("users")
        .delete()
        .eq("id", id);

    if (error) throw error;

    return true;
  },
};

/* ======================================================
INVITES
====================================================== */

export const inviteAPI = {
  send: async ({ email, role }) => {
    const { error } =
      await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            role: role || "employee",
          },
        },
      });

    if (error) throw error;

    return true;
  },
};

/* ======================================================
ANNOUNCEMENTS
====================================================== */

export const announcementAPI = {
  getAll: async () => {
    const { data } =
      await supabase
        .from("announcements")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    return data || [];
  },

  create: async (payload) => {
    await supabase
      .from("announcements")
      .insert(payload);

    return true;
  },

  delete: async (id) => {
    await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    return true;
  },
};

/* ======================================================
TASKS
====================================================== */

export const taskAPI = {
  getAll: async () => {
    const { data } =
      await supabase
        .from("tasks")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    return data || [];
  },

  getMine: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } =
      await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

    return data || [];
  },

  create: async (payload) => {
    await supabase
      .from("tasks")
      .insert(payload);

    return true;
  },

  update: async (id, payload) => {
    await supabase
      .from("tasks")
      .update(payload)
      .eq("id", id);

    return true;
  },

  delete: async (id) => {
    await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    return true;
  },
};

/* ======================================================
LOCATIONS
====================================================== */

export const locationAPI = {
  getLocations: async () => {
    const { data } =
      await supabase
        .from("locations")
        .select("*")
        .order("name");

    return data || [];
  },

  create: async (payload) => {
    await supabase
      .from("locations")
      .insert(payload);

    return true;
  },

  update: async (id, payload) => {
    await supabase
      .from("locations")
      .update(payload)
      .eq("id", id);

    return true;
  },

  delete: async (id) => {
    await supabase
      .from("locations")
      .delete()
      .eq("id", id);

    return true;
  },
};

/* ======================================================
SHIFTS
====================================================== */

export const shiftAPI = {
  getActive: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } =
      await supabase
        .from("shifts")
        .select("*")
        .eq("user_id", user.id)
        .is("clock_out_time", null)
        .maybeSingle();

    return data;
  },

  getHistory: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } =
      await supabase
        .from("shifts")
        .select("*")
        .eq("user_id", user.id)
        .order("clock_in_time", {
          ascending: false,
        });

    return data || [];
  },

  clockIn: async ({
    location_id,
    latitude,
    longitude,
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("shifts")
      .insert({
        user_id: user.id,
        location_id,
        latitude,
        longitude,
        clock_in_time:
          new Date().toISOString(),
        total_break_seconds: 0,
      });

    return true;
  },

  clockOut: async () => {
    const active =
      await shiftAPI.getActive();

    if (!active) return true;

    await supabase
      .from("shifts")
      .update({
        clock_out_time:
          new Date().toISOString(),
        break_started_at: null,
      })
      .eq("id", active.id);

    return true;
  },

  startBreak: async () => {
    const active =
      await shiftAPI.getActive();

    if (!active) return true;

    await supabase
      .from("shifts")
      .update({
        break_started_at:
          new Date().toISOString(),
      })
      .eq("id", active.id);

    return true;
  },

  endBreak: async () => {
    const active =
      await shiftAPI.getActive();

    if (!active) return true;

    const started =
      new Date(
        active.break_started_at
      ).getTime();

    const seconds = Math.floor(
      (Date.now() - started) / 1000
    );

    const total =
      (active.total_break_seconds || 0) +
      seconds;

    await supabase
      .from("shifts")
      .update({
        break_started_at: null,
        total_break_seconds: total,
      })
      .eq("id", active.id);

    return true;
  },
};

/* ======================================================
SCHEDULE
====================================================== */

export const scheduleAPI = {
  getMine: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } =
      await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .order("date");

    return data || [];
  },

  getAll: async () => {
    const { data } =
      await supabase
        .from("schedules")
        .select("*, users(name)")
        .order("date");

    return (
      data?.map((x) => ({
        ...x,
        name: x.users?.name,
      })) || []
    );
  },

  create: async (payload) => {
    await supabase
      .from("schedules")
      .insert(payload);

    return true;
  },

  delete: async (id) => {
    await supabase
      .from("schedules")
      .delete()
      .eq("id", id);

    return true;
  },
};

/* ======================================================
HOLIDAYS
====================================================== */

export const holidayAPI = {
  getMine: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } =
      await supabase
        .from("holiday_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

    return data || [];
  },

  create: async (payload) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("holiday_requests")
      .insert({
        ...payload,
        user_id: user.id,
        status: "pending",
      });

    return true;
  },

  getAll: async () => {
    const { data } =
      await supabase
        .from("holiday_requests")
        .select("*, users(name)")
        .order("created_at", {
          ascending: false,
        });

    return (
      data?.map((x) => ({
        ...x,
        name: x.users?.name,
      })) || []
    );
  },

  update: async (id, payload) => {
    await supabase
      .from("holiday_requests")
      .update(payload)
      .eq("id", id);

    return true;
  },
};

/* ======================================================
REPORTS / DASHBOARD
====================================================== */

export const reportAPI = {
  getSummary: async () => {
    const users =
      await userAPI.getAll();

    const tasks =
      await taskAPI.getAll();

    const shifts =
      await supabase
        .from("shifts")
        .select("*");

    const active =
      shifts.data?.filter(
        (x) => !x.clock_out_time
      ) || [];

    return {
      users: users.length,
      tasks: tasks.length,
      activeUsers: active.length,
    };
  },

  getTimesheets: async () => {
    const { data } =
      await supabase
        .from("shifts")
        .select("*, users(name)")
        .order("clock_in_time", {
          ascending: false,
        });

    return data || [];
  },
};

export const managerAPI = {
  getDashboard:
    reportAPI.getSummary,
};

export const performanceAPI = {
  getAll: async () => [],
};

/* ======================================================
BILLING
====================================================== */

export const billingAPI = {
  checkout: async () => true,
  portal: async () => true,
};

export default supabase;