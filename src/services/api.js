import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/* ======================================================
HELPERS
====================================================== */

const todayDate = () =>
  new Date().toISOString().split("T")[0];

const safeArray = (data) =>
  Array.isArray(data) ? data : [];

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

  logout: async () => {
    await supabase.auth.signOut();
    return true;
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

    return safeArray(data);
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

    return safeArray(data);
  },

  create: async (payload) => {
    const { error } =
      await supabase
        .from("announcements")
        .insert(payload);

    if (error) throw error;

    return true;
  },

  delete: async (id) => {
    const { error } =
      await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

    if (error) throw error;

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

    return safeArray(data);
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

    return safeArray(data);
  },

  create: async (payload) => {
    const { error } =
      await supabase
        .from("tasks")
        .insert(payload);

    if (error) throw error;

    return true;
  },

  update: async (id, payload) => {
    const { error } =
      await supabase
        .from("tasks")
        .update(payload)
        .eq("id", id);

    if (error) throw error;

    return true;
  },

  delete: async (id) => {
    const { error } =
      await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

    if (error) throw error;

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

    return safeArray(data);
  },

  create: async (payload) => {
    const { error } =
      await supabase
        .from("locations")
        .insert(payload);

    if (error) throw error;

    return true;
  },

  update: async (id, payload) => {
    const { error } =
      await supabase
        .from("locations")
        .update(payload)
        .eq("id", id);

    if (error) throw error;

    return true;
  },

  delete: async (id) => {
    const { error } =
      await supabase
        .from("locations")
        .delete()
        .eq("id", id);

    if (error) throw error;

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
        .select("*, users(name)")
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
        .select("*, users(name)")
        .eq("user_id", user.id)
        .order("clock_in_time", {
          ascending: false,
        });

    return safeArray(data);
  },

  clockIn: async ({
    location_id,
    latitude,
    longitude,
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const active =
      await shiftAPI.getActive();

    if (active) return true;

    const { error } =
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

    if (error) throw error;

    return true;
  },

  clockOut: async () => {
    const active =
      await shiftAPI.getActive();

    if (!active) return true;

    const { error } =
      await supabase
        .from("shifts")
        .update({
          clock_out_time:
            new Date().toISOString(),
          break_started_at: null,
        })
        .eq("id", active.id);

    if (error) throw error;

    return true;
  },

  startBreak: async () => {
    const active =
      await shiftAPI.getActive();

    if (!active) return true;

    const { error } =
      await supabase
        .from("shifts")
        .update({
          break_started_at:
            new Date().toISOString(),
        })
        .eq("id", active.id);

    if (error) throw error;

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

    const { error } =
      await supabase
        .from("shifts")
        .update({
          break_started_at: null,
          total_break_seconds: total,
        })
        .eq("id", active.id);

    if (error) throw error;

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

    return safeArray(data);
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
    const { error } =
      await supabase
        .from("schedules")
        .insert(payload);

    if (error) throw error;

    return true;
  },

  update: async (id, payload) => {
    const { error } =
      await supabase
        .from("schedules")
        .update(payload)
        .eq("id", id);

    if (error) throw error;

    return true;
  },

  delete: async (id) => {
    const { error } =
      await supabase
        .from("schedules")
        .delete()
        .eq("id", id);

    if (error) throw error;

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

    return safeArray(data);
  },

  create: async (payload) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } =
      await supabase
        .from("holiday_requests")
        .insert({
          ...payload,
          user_id: user.id,
          status: "pending",
        });

    if (error) throw error;

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
    const { error } =
      await supabase
        .from("holiday_requests")
        .update(payload)
        .eq("id", id);

    if (error) throw error;

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

    const { data: shifts } =
      await supabase
        .from("shifts")
        .select("*");

    const active =
      safeArray(shifts).filter(
        (x) => !x.clock_out_time
      );

    return {
      users: users.length,
      tasks: tasks.length,
      activeUsers: active.length,
      completedShifts:
        safeArray(shifts).filter(
          (x) => x.clock_out_time
        ).length,
    };
  },

  getTimesheets: async ({
    from,
    to,
    user_id,
  } = {}) => {
    let query = supabase
      .from("shifts")
      .select(
        "*, users(name,email)"
      )
      .order("clock_in_time", {
        ascending: false,
      });

    if (from) {
      query = query.gte(
        "clock_in_time",
        `${from}T00:00:00`
      );
    }

    if (to) {
      query = query.lte(
        "clock_in_time",
        `${to}T23:59:59`
      );
    }

    if (user_id) {
      query = query.eq(
        "user_id",
        user_id
      );
    }

    const { data } = await query;

    return safeArray(data);
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
  getStatus: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } =
      await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    return data;
  },

  checkout: async ({
    plan,
  }) => {
    const plans = {
      starter: {
        url: "/billing/starter",
      },
      pro: {
        url: "/billing/pro",
      },
      business: {
        url: "/billing/business",
      },
    };

    return (
      plans[plan] || {
        url: "/billing",
      }
    );
  },

  portal: async () => {
    return {
      url: "/billing/manage",
    };
  },
};

export default supabase;