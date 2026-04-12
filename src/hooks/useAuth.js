/* =========================================================
   src/services/api.js
   FULL FIX — PURE SUPABASE VERSION
   Removes old Render backend completely
========================================================= */

import { createClient } from "@supabase/supabase-js";

/* =========================================================
   🔥 SUPABASE CLIENT
========================================================= */

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/* =========================================================
   🔐 AUTH API
========================================================= */

export const authAPI = {
  /* LOGIN */
  login: async ({
    email,
    password,
  }) => {
    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

    if (error) throw error;

    return data;
  },

  /* SIGNUP */
  register: async ({
    email,
    password,
    name,
  }) => {
    const {
      data,
      error,
    } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

    if (error) throw error;

    return data;
  },

  /* CURRENT USER */
  me: async () => {
    const {
      data,
      error,
    } =
      await supabase.auth.getUser();

    if (error) throw error;

    return data.user;
  },

  /* UPDATE PROFILE */
  updateMe: async (
    payload
  ) => {
    const {
      data: auth,
    } =
      await supabase.auth.getUser();

    const user =
      auth?.user;

    if (!user) {
      throw new Error(
        "No user found"
      );
    }

    const {
      error,
    } =
      await supabase
        .from(
          "users"
        )
        .update({
          name:
            payload.name,
          phone:
            payload.phone,
          job_title:
            payload.jobTitle,
        })
        .eq(
          "id",
          user.id
        );

    if (error) throw error;

    return {
      success: true,
    };
  },
};

/* =========================================================
   👥 USERS / EMPLOYEES
========================================================= */

export const userAPI = {
  getAll: async () => {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "users"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

    if (error) throw error;

    return data;
  },

  updateRole:
    async (
      id,
      payload
    ) => {
      const {
        error,
      } =
        await supabase
          .from(
            "users"
          )
          .update({
            role:
              payload.role,
          })
          .eq(
            "id",
            id
          );

      if (error)
        throw error;

      return true;
    },

  delete:
    async (id) => {
      const {
        error,
      } =
        await supabase
          .from(
            "users"
          )
          .delete()
          .eq(
            "id",
            id
          );

      if (error)
        throw error;

      return true;
    },
};

/* =========================================================
   📧 INVITES
========================================================= */

export const inviteAPI = {
  send: async ({
    email,
  }) => {
    const {
      error,
    } =
      await supabase.auth.signInWithOtp(
        {
          email,
          options: {
            emailRedirectTo:
              "https://app.zorviatech.co.uk/set-password",
          },
        }
      );

    if (error) throw error;

    return {
      success: true,
    };
  },
};

/* =========================================================
   📋 TASKS
========================================================= */

export const taskAPI = {
  getTasks:
    async () => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "tasks"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (error)
        throw error;

      return data;
    },

  create:
    async (task) => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "tasks"
          )
          .insert(task)
          .select();

      if (error)
        throw error;

      return data;
    },

  complete:
    async (id) => {
      const {
        error,
      } =
        await supabase
          .from(
            "tasks"
          )
          .update({
            completed: true,
          })
          .eq(
            "id",
            id
          );

      if (error)
        throw error;

      return true;
    },

  delete:
    async (id) => {
      const {
        error,
      } =
        await supabase
          .from(
            "tasks"
          )
          .delete()
          .eq(
            "id",
            id
          );

      if (error)
        throw error;

      return true;
    },
};

/* =========================================================
   📅 SCHEDULE
========================================================= */

export const scheduleAPI = {
  getAll:
    async () => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "schedules"
          )
          .select("*");

      if (error)
        throw error;

      return data;
    },

  create:
    async (row) => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "schedules"
          )
          .insert(row)
          .select();

      if (error)
        throw error;

      return data;
    },
};

/* =========================================================
   🌴 HOLIDAYS
========================================================= */

export const holidayAPI = {
  getAll:
    async () => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "holidays"
          )
          .select("*");

      if (error)
        throw error;

      return data;
    },

  create:
    async (row) => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "holidays"
          )
          .insert(row)
          .select();

      if (error)
        throw error;

      return data;
    },
};

/* =========================================================
   📢 ANNOUNCEMENTS
========================================================= */

export const announcementAPI = {
  getAll:
    async () => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "announcements"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (error)
        throw error;

      return data;
    },

  create:
    async (row) => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "announcements"
          )
          .insert(row)
          .select();

      if (error)
        throw error;

      return data;
    },
};

/* =========================================================
   📊 DASHBOARD
========================================================= */

export const managerAPI = {
  getDashboard:
    async () => {
      const {
        count:
          totalUsers,
      } =
        await supabase
          .from(
            "users"
          )
          .select(
            "*",
            {
              count:
                "exact",
              head: true,
            }
          );

      const {
        count:
          totalTasks,
      } =
        await supabase
          .from(
            "tasks"
          )
          .select(
            "*",
            {
              count:
                "exact",
              head: true,
            }
          );

      return {
        totalUsers:
          totalUsers ||
          0,
        tasks:
          totalTasks ||
          0,
        late: 0,
      };
    },
};

/* =========================================================
   ⏱ SHIFTS
========================================================= */

export const shiftAPI = {
  getAllActive:
    async () => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "shifts"
          )
          .select("*")
          .is(
            "clock_out",
            null
          );

      if (error)
        throw error;

      return data;
    },
};

/* =========================================================
   💳 BILLING PLACEHOLDER
========================================================= */

export const billingAPI = {
  checkout:
    async () => ({
      success: true,
    }),

  portal:
    async () => ({
      success: true,
    }),
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default supabase;