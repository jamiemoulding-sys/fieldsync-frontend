import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import api from "../services/api";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function SetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  /* =====================================
     READ INVITE SESSION
  ===================================== */
  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    };

    loadSession();
  }, []);

  /* =====================================
     SUBMIT
  ===================================== */
  const submit = async () => {
    try {
      if (!password || !confirm) {
        return alert("Fill all fields");
      }

      if (password.length < 6) {
        return alert(
          "Password must be at least 6 characters"
        );
      }

      if (password !== confirm) {
        return alert(
          "Passwords do not match"
        );
      }

      setLoading(true);

      /* 1. Update Supabase password */
      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) throw error;

      /* 2. Sync local backend password */
      await api.post(
        "/auth/set-password",
        {
          email,
          password,
        }
      );

      alert("Account activated");

      navigate("/login");

    } catch (err) {
      alert(
        err?.message ||
          "Failed to activate account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">

        <h1 className="text-3xl font-semibold text-center mb-2">
          Set Password
        </h1>

        <p className="text-center text-gray-400 mb-6 text-sm">
          {email || "Activate your invited account"}
        </p>

        <input
          type="password"
          placeholder="Set Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full p-3 rounded-xl bg-white/10 mb-4 outline-none"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) =>
            setConfirm(
              e.target.value
            )
          }
          className="w-full p-3 rounded-xl bg-white/10 mb-6 outline-none"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition"
        >
          {loading
            ? "Saving..."
            : "Activate Account"}
        </button>

      </div>

    </div>
  );
}