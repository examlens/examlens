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

  // TOAST STATE

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // =========================
  // TOAST FUNCTION
  // =========================


  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

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
      showToast("Email & password required", "error");
      return;
    }

    try {
      setLoading(true);

      // =========================
      // SIGNUP
      // =========================
      if (isSignup) {
        if (!name.trim()) {
          showToast("Enter your name", "error");
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

        showToast(
          "Check your email to verify your account.",
          "success"
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
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORGOT PASSWORD (FIXED)
  // =========================
  const handleForgotPassword = async () => {
    if (!email) {
      showToast("Enter email first", "error");
      return;
    }

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });

      if (error) throw error;

      showToast("📩 Password reset email sent!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-amber-400 to-orange-300 px-4 relative overflow-hidden">

      {/* BACKGROUND BLUR EFFECTS */}
      <div className="absolute top-[-120px] left-[-120px] w-96 h-96 bg-white/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[450px] h-[450px] bg-orange-200/30 rounded-full blur-3xl" />

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-white/92 backdrop-blur-2xl border border-white/40 shadow-[0_15px_50px_rgba(0,0,0,0.12)] rounded-[28px] overflow-hidden modal-enter">

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

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all duration-200 shadow-lg shadow-orange-500/30"
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



      {/* TOAST */}
      {toast.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">

          <div className="bg-white border border-orange-200 shadow-2xl rounded-2xl px-6 py-5 w-[90%] max-w-md text-center animate-fadeIn">

            {/* ICON */}
            <div className="w-14 h-14 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-3">
              {toast.type === "success" ? (
                <span className="text-2xl">✅</span>
              ) : (
                <span className="text-2xl">⚠️</span>
              )}
            </div>

            {/* TITLE */}
            <h2 className="text-lg font-bold text-orange-600">
              {toast.type === "success" ? "Success" : "Error"}
            </h2>

            {/* MESSAGE */}
            <p className="text-sm text-slate-600 mt-2">
              {toast.message}
            </p>

            {/* BUTTON */}
            <button
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
              className="mt-4 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition"
            >
              OK
            </button>

          </div>
        </div>
      )}


    </div>
  );
}