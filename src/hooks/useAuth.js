import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import supabase from "../lib/supabase";

export function useAuth() {
  const navigate =
    useNavigate();

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const loadUser =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const {
            data: {
              session,
            },
          } =
            await supabase.auth.getSession();

          if (!session?.user) {
            setUser(null);
            return;
          }

          const authUser =
            session.user;

          const {
            data,
            error,
          } =
            await supabase
              .from("users")
              .select(`
                *,
                companies (
                  id,
                  name,
                  is_pro,
                  current_plan,
                  subscription_status
                )
              `)
              .eq(
                "id",
                authUser.id
              )
              .single();

          if (error)
            throw error;

          setUser({
            id: authUser.id,
            email:
              authUser.email,

            name:
              data.name || "",

            phone:
              data.phone || "",

            role:
              data.role ||
              "employee",

            companyId:
              data.company_id,

            companyName:
              data.companies
                ?.name || "",

            jobTitle:
              data.job_title ||
              "",

            isPro:
              data.companies
                ?.is_pro ||
              false,

            current_plan:
              data.companies
                ?.current_plan ||
              "free",

            subscription_status:
              data.companies
                ?.subscription_status ||
              "free",
          });

        } catch (err) {
          console.error(err);
          setUser(null);
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadUser();

    const {
      data:
        listener,
    } =
      supabase.auth.onAuthStateChange(
        () => {
          loadUser();
        }
      );

    return () =>
      listener.subscription.unsubscribe();
  }, [loadUser]);

  const login =
    async (
      email,
      password
    ) => {
      const { error } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          }
        );

      if (error)
        throw error;

      await loadUser();

      navigate(
        "/dashboard"
      );
    };

  const logout =
    async () => {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/login");
    };

  return {
    user,
    loading,
    login,
    logout,
    reloadUser:
      loadUser,

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