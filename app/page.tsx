"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================
  // AUTO LOGIN CHECK
  // =========================
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      const session = data.session;
      if (!session) return;

      const user = session.user;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          role: "student",
          name: user.email,
        });

        router.push("/student/dashboard");
        return;
      }

      router.push(
        profile.role === "admin"
          ? "/admin/dashboard"
          : "/student/dashboard"
      );
    };

    checkUser();
  }, []);

  // =========================
  // AUTH HANDLER
  // =========================
  const handleAuth = async () => {
    if (!email || !password) {
      alert("Email & password required");
      return;
    }

    try {
      setLoading(true);

      // =========================
      // SIGNUP
      // =========================
      if (isSignup) {
        if (!name.trim()) {
          alert("Enter your name");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) throw error;

        // IMPORTANT: user may be null until email verified
        const user = data.user;

        if (user) {
          await supabase.from("profiles").upsert({
            id: user.id,
            role: "student",
            name: name.trim(),
            email: email.trim(),
          });
        }

        alert(
          "✅ Signup successful! Please check your email to verify your account."
        );

        setIsSignup(false);
        setName("");
        setEmail("");
        setPassword("");
      }

      // =========================
      // LOGIN
      // =========================
      else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) throw error;

        const user = data.user;
        if (!user) throw new Error("Login failed");

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile) {
          await supabase.from("profiles").insert({
            id: user.id,
            role: "student",
            name: user.email,
          });

          router.push("/student/dashboard");
          return;
        }

        router.push(
          profile.role === "admin"
            ? "/admin/dashboard"
            : "/student/dashboard"
        );
      }
    } catch (err: any) {
      console.error("❌ AUTH ERROR:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORGOT PASSWORD (FIXED)
  // =========================
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter email first");
      return;
    }

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });

      if (error) throw error;

      alert("📩 Password reset email sent!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-amber-400 to-orange-300 px-4 relative overflow-hidden">

      {/* BACKGROUND BLUR EFFECTS */}
      <div className="absolute top-[-120px] left-[-120px] w-96 h-96 bg-white/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[450px] h-[450px] bg-orange-200/30 rounded-full blur-3xl" />

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-lg mx-10">
        <div className="bg-white/92 backdrop-blur-2xl border border-white/40 shadow-[0_15px_50px_rgba(0,0,0,0.12)] rounded-[28px] overflow-hidden">

          {/* TOP HEADER */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 px-6 py-6 text-center">
            <div className="w-16 h-16 rounded-[20px] bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-lg border border-white/20">
              <span className="text-3xl">🎓</span>
            </div>

            <h1 className="text-3xl font-black text-white mt-4 tracking-tight">
              ExamLens
            </h1>

            <p className="text-orange-100 mt-1 text-xs">
              AI Powered Exam Evaluation Platform
            </p>
          </div>

          {/* FORM */}
          <div className="p-6">

            <div className="mb-5 text-center">
              <h2 className="text-xl font-bold text-slate-800">
                {isSignup ? "Create Account" : "Welcome Back"}
              </h2>

              <p className="text-slate-500 mt-1 text-xs">
                {isSignup
                  ? "Start managing exams smarter with AI"
                  : "Login to continue to your dashboard"}
              </p>
            </div>

            {/* NAME */}
            {isSignup && (
              <div className="mb-3">
                <label className="text-xs font-semibold text-slate-700 mb-2 block">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            {/* EMAIL */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-700 mb-2 block">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your Email"
                className="w-full bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 mb-2 block">
                Password
              </label>

              <div className="relative">
                <input
                  placeholder="Enter your Password"
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3 pr-20 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500"
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
            </button>

            {/* FORGOT PASSWORD */}
            {!isSignup && (
              <p
                onClick={handleForgotPassword}
                className="text-xs text-orange-500 mt-4 text-center cursor-pointer font-semibold"
              >
                Forgot Password?
              </p>
            )}

            {/* TOGGLE */}
            <div className="mt-5 text-center text-xs text-slate-500">
              {isSignup ? "Already have an account?" : "New to ExamLens?"}

              <span
                className="ml-1 text-orange-500 font-bold cursor-pointer"
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Login" : "Create Account"}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}