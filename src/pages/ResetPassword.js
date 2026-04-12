import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirm, setConfirm] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* restore recovery session */
  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  const handleReset = async () => {
    try {
      if (!password || !confirm) {
        return alert(
          "Please fill all fields"
        );
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

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) throw error;

      alert(
        "Password updated successfully"
      );

      navigate("/login");

    } catch (err) {
      alert(
        err.message ||
          "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">

        <h1 className="text-3xl font-semibold text-center mb-2">
          Reset Password
        </h1>

        <p className="text-center text-gray-400 mb-6 text-sm">
          Choose a new password
        </p>

        <input
          type="password"
          placeholder="New Password"
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
          onClick={handleReset}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition"
        >
          {loading
            ? "Saving..."
            : "Update Password"}
        </button>

      </div>

    </div>
  );
}