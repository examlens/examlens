"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState(""); // ✅ NEW
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ AUTO REDIRECT
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    };

    checkUser();
  }, []);

  // ✅ AUTH
  const handleAuth = async () => {
    try {
      setLoading(true);

      if (isSignup) {
        if (!name) {
          alert("Enter your name");
          return;
        }

        // 🔹 SIGNUP
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        const user = data.user;
        if (!user) throw new Error("Signup failed");

        // ✅ SAVE NAME IN USERS TABLE
        const { error: userError } = await supabase
          .from("users")
          .insert([
            {
              id: user.id,
              name: name,
              email: email,
            },
          ]);

        if (userError) throw userError;

        // ✅ ROLE TABLE
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            role: "student",
          });

        if (profileError) throw profileError;

        alert("✅ Signup successful. Please login.");
        setIsSignup(false);
        setName("");
      } else {
        // 🔹 LOGIN
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        const user = data.user;
        if (!user) throw new Error("Login failed");

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter email first");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      alert(error.message);
    } else {
      alert("📩 Password reset email sent");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d426a] via-[#005b8f] to-[#00a0dc]">

      {/* CARD */}
      <div className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-[380px] border border-gray-200">

        {/* LOGO */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-[#0d426a]">
            ExamLens
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isSignup
              ? "Create your student account"
              : "Welcome back 👋"}
          </p>
        </div>

        {/* NAME (ONLY SIGNUP) */}
        {isSignup && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-[#00a0dc]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email address"
          className="w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-[#00a0dc]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00a0dc]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer text-sm text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleAuth}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            loading
              ? "bg-gray-400"
              : "bg-[#0d426a] hover:bg-[#08314d]"
          }`}
        >
          {loading
            ? "Please wait..."
            : isSignup
            ? "Create Account"
            : "Login"}
        </button>

        {/* FORGOT */}
        {!isSignup && (
          <p
            onClick={handleForgotPassword}
            className="text-sm text-[#00a0dc] mt-3 cursor-pointer text-center hover:underline"
          >
            Forgot Password?
          </p>
        )}

        {/* SWITCH */}
        <p className="text-center text-sm mt-5">
          {isSignup
            ? "Already have an account?"
            : "New here?"}{" "}
          <span
            className="text-[#00a0dc] font-semibold cursor-pointer"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Login" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
}