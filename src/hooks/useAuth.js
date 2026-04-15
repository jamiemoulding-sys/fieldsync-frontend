// src/hooks/useAuth.js
// FULL LOCK FIX VERSION
// Fixes:
// ✅ Supabase auth lock timeout
// ✅ blank page after idle
// ✅ duplicate refresh calls
// ✅ React strict mode safe
// ✅ stable session restore

import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import supabase from "../lib/supabase";

/* =======================================================
GLOBAL STORE
======================================================= */

let globalUser = null;
let globalLoading = true;
let listeners = [];
let started = false;
let refreshing = false;
let lastRefresh = 0;

/* =======================================================
HELPERS
======================================================= */

function emit() {
  listeners.forEach((fn) =>
    fn({
      user: globalUser,
      loading: globalLoading,
    })
  );
}

function setUser(user) {
  globalUser = user;
  emit();
}

function setLoading(v) {
  globalLoading = v;
  emit();
}

/* =======================================================
LOAD PROFILE
======================================================= */

async function loadProfile() {
  try {
    const {
      data: { session },
    } =
      await supabase.auth.getSession();

    if (!session?.user) {
      setUser(null);
      return null;
    }

    const authUser =
      session.user;

    const {
      data: row,
      error,
    } = await supabase
      .from("users")
      .select(`
        id,
        name,
        role,
        company_id,
        phone,
        job_title
      `)
      .eq("id", authUser.id)
      .single();

    if (error) throw error;

    let company = null;

    if (row.company_id) {
      const {
        data,
      } = await supabase
        .from("companies")
        .select(`
          id,
          name,
          is_pro,
          current_plan,
          subscription_status
        `)
        .eq(
          "id",
          row.company_id
        )
        .single();

      company = data;
    }

    const profile = {
      id: authUser.id,
      email: authUser.email,
      name:
        row.name || "",
      role:
        row.role ||
        "employee",
      phone:
        row.phone || "",
      jobTitle:
        row.job_title || "",
      companyId:
        row.company_id,
      companyName:
        company?.name || "",
      isPro:
        company?.is_pro ||
        false,
      current_plan:
        company?.current_plan ||
        "free",
      subscription_status:
        company?.subscription_status ||
        "free",
    };

    setUser(profile);
    return profile;
  } catch (err) {
    console.error(
      "Auth profile error:",
      err
    );

    setUser(null);
    return null;
  }
}

/* =======================================================
SAFE REFRESH
======================================================= */

async function refreshAuth() {
  const now = Date.now();

  if (refreshing) return;
  if (
    now - lastRefresh <
    15000
  )
    return;

  refreshing = true;
  lastRefresh = now;

  try {
    await supabase.auth.getSession();
    await loadProfile();
  } catch (err) {
    console.error(
      "Refresh failed:",
      err
    );
  } finally {
    refreshing = false;
  }
}

/* =======================================================
INIT
======================================================= */

async function init() {
  if (started) return;
  started = true;

  try {
    setLoading(true);
    await loadProfile();
  } finally {
    setLoading(false);
  }

  supabase.auth.onAuthStateChange(
    async (event) => {
      if (
        event ===
        "SIGNED_OUT"
      ) {
        setUser(null);
        return;
      }

      if (
        event ===
          "SIGNED_IN" ||
        event ===
          "TOKEN_REFRESHED" ||
        event ===
          "USER_UPDATED"
      ) {
        await refreshAuth();
      }
    }
  );

  document.addEventListener(
    "visibilitychange",
    async () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        await refreshAuth();
      }
    }
  );

  window.addEventListener(
    "focus",
    async () => {
      await refreshAuth();
    }
  );
}

/* =======================================================
HOOK
======================================================= */

export function useAuth() {
  const navigate =
    useNavigate();

  const [user, setLocalUser] =
    useState(globalUser);

  const [
    loading,
    setLocalLoading,
  ] = useState(
    globalLoading
  );

  useEffect(() => {
    const sub = (
      state
    ) => {
      setLocalUser(
        state.user
      );

      setLocalLoading(
        state.loading
      );
    };

    listeners.push(sub);

    init();

    return () => {
      listeners =
        listeners.filter(
          (x) =>
            x !== sub
        );
    };
  }, []);

  const login =
    useCallback(
      async (
        email,
        password
      ) => {
        const {
          error,
        } =
          await supabase.auth.signInWithPassword(
            {
              email,
              password,
            }
          );

        if (error)
          throw error;

        await refreshAuth();

        navigate(
          "/dashboard"
        );
      },
      [navigate]
    );

  const logout =
    useCallback(
      async () => {
        await supabase.auth.signOut();

        setUser(null);

        navigate(
          "/login"
        );
      },
      [navigate]
    );

  const reloadUser =
    useCallback(
      async () => {
        await refreshAuth();
      },
      []
    );

  return {
    user,
    loading,
    login,
    logout,
    reloadUser,

    isAdmin:
      user?.role ===
      "admin",

    isManager:
      user?.role ===
        "manager" ||
      user?.role ===
        "admin",

    isPaid:
      user?.isPro,
  };
}