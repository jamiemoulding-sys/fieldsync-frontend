import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Lock, CheckCircle2 } from "lucide-react";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function SetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async () => {
    try {
      if (!password || !confirmPassword) {
        return alert(
          "Please fill all fields"
        );
      }

      if (password.length < 6) {
        return alert(
          "Password must be at least 6 characters"
        );
      }

      if (
        password !==
        confirmPassword
      ) {
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
        "Account activated successfully"
      );

      navigate("/login");

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md rounded-3xl p-[1px] bg-gradient-to-b from-indigo-500/40 to-transparent">

        <div className="bg-[#020617] border border-white/10 rounded-3xl p-8">

          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-6">
            <Lock size={28} />
          </div>

          <h1 className="text-3xl font-semibold text-center">
            Set Password
          </h1>

          <p className="text-gray-400 text-center mt-2 mb-8">
            Finish activating your account
          </p>

          <div className="space-y-4">

            <input
              type="password"
              placeholder="Set Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none"
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />

              {loading
                ? "Saving..."
                : "Activate Account"}
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}