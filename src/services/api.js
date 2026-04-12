import { createClient } from "@supabase/supabase-js";

/* ==================================
   🔥 SUPABASE CLIENT
================================== */

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/* ==================================
   🔐 AUTH
================================== */

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
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;

    const authUser =
      data.user;

    /* pull profile row */
    const {
      data: profile,
    } =
      await supabase
        .from("users")
        .select("*")
        .eq(
          "id",
          authUser.id
        )
        .maybeSingle();

    const token =
      data.session
        ?.access_token;

    localStorage.setItem(
      "token",
      token
    );

    return {
      token,
      user: {
        id: authUser.id,
        email:
          authUser.email,
        name:
          profile?.name ||
          "",
        phone:
          profile?.phone ||
          "",
        role:
          profile?.role ||
          "employee",
        companyId:
          profile?.company_id ||
          null,
        companyName:
          profile?.company_name ||
          "",
        jobTitle:
          profile?.job_title ||
          "",
        isPro:
          profile?.is_pro ||
          false,
        is_pro:
          profile?.is_pro ||
          false,
        current_plan:
          profile?.current_plan ||
          "free",
        subscription_status:
          profile?.subscription_status ||
          "free",
      },
    };
  },

  /* REGISTER */
  register: async ({
    email,
    password,
    name,
    companyName,
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

    const authUser =
      data.user;

    if (authUser) {
      await supabase
        .from("users")
        .insert({
          id: authUser.id,
          email,
          name:
            name || "",
          company_name:
            companyName ||
            "",
          role: "admin",
          is_pro: false,
          current_plan:
            "free",
          subscription_status:
            "free",
        });
    }

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

    const authUser =
      data.user;

    if (!authUser)
      return null;

    const {
      data: profile,
    } =
      await supabase
        .from("users")
        .select("*")
        .eq(
          "id",
          authUser.id
        )
        .maybeSingle();

    return {
      id: authUser.id,
      email:
        authUser.email,
      ...profile,
    };
  },

  /* UPDATE PROFILE */
  updateMe: async (
    payload
  ) => {
    const {
      data,
    } =
      await supabase.auth.getUser();

    const user =
      data.user;

    if (!user) {
      throw new Error(
        "No user found"
      );
    }

    const {
      error,
    } =
      await supabase
        .from("users")
        .update({
          name:
            payload.name,
          phone:
            payload.phone,
          job_title:
            payload.jobTitle,
          company_name:
            payload.companyName,
          updated_at:
            new Date(),
        })
        .eq(
          "id",
          user.id
        );

    if (error) throw error;

    return payload;
  },
};

/* ==================================
   👥 USERS
================================== */

export const userAPI = {
  getAll: async () => {
    const {
      data,
      error,
    } =
      await supabase
        .from("users")
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
          .from("users")
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

  delete: async (
    id
  ) => {
    const {
      error,
    } =
      await supabase
        .from("users")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) throw error;

    return true;
  },
};

/* ==================================
   📧 INVITES
================================== */

export const inviteAPI = {
  send: async ({
    email,
    role,
  }) => {
    const {
      error,
    } =
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            "https://app.zorviatech.co.uk/set-password",
          data: {
            role:
              role ||
              "employee",
          },
        },
      });

    if (error) throw error;

    return {
      success: true,
    };
  },
};

/* ==================================
   📍 LOCATIONS
================================== */

export const locationAPI = {
  getLocations:
    async () => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "locations"
          )
          .select("*");

      if (error)
        throw error;

      return data;
    },
};

/* ==================================
   📋 TASKS
================================== */

export const taskAPI = {
  getTasks:
    async () => {
      const {
        data,
        error,
      } =
        await supabase
          .from("tasks")
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
          .from("tasks")
          .insert(task)
          .select();

      if (error)
        throw error;

      return data;
    },

  delete:
    async (id) => {
      const {
        error,
      } =
        await supabase
          .from("tasks")
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

/* ==================================
   📅 SCHEDULE
================================== */

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
};

/* ==================================
   📊 REPORTS
================================== */

export const reportAPI = {
  getSummary:
    async () => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "reports"
          )
          .select("*");

      if (error)
        throw error;

      return data;
    },
};

/* ==================================
   💳 BILLING
================================== */

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

/* ==================================
   🚪 LOGOUT
================================== */

export const logoutAPI =
  async () => {
    await supabase.auth.signOut();

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );
  };

export default supabase;