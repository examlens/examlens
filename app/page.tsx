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

  // ✅ AUTO REDIRECT
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
        .maybeSingle(); // ✅ FIXED

      if (!profile) {
        // ✅ auto create profile
        await supabase.from("profiles").insert({
          id: user.id,
          role: "student",
        });

        router.push("/student/dashboard");
        return;
      }

      if (profile.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    };

    checkUser();
  }, []);

  // ✅ AUTH HANDLER
  const handleAuth = async () => {
    if (!email || !password) {
      alert("Email & password required");
      return;
    }

    try {
      setLoading(true);

      // =====================
      // 🔹 SIGNUP
      // =====================
      if (isSignup) {
        if (!name.trim()) {
          alert("Enter your name");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            alert("⚠️ Email already exists. Please login.");
            return;
          }
          throw error;
        }

        const user = data.user;
        if (!user) throw new Error("Signup failed");

        // ✅ insert users table
        await supabase.from("users").insert({
          id: user.id,
          name: name.trim(),
          email: email.trim(),
        });

        // ✅ profile
        await supabase.from("profiles").upsert({
          id: user.id,
          role: "student",
          name,
          email,
        });

        alert("✅ Signup successful. Please login");

        setIsSignup(false);
        setName("");
        setEmail("");
        setPassword("");
      }

      // =====================
      // 🔹 LOGIN
      // =====================
      else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) throw error;

        const user = data.user;
        if (!user) throw new Error("Login failed");

        // alert("✅ Login successful");

        const { data: profiles } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id);

        const profile = profiles?.[0] ?? null;

        // alert(`User role: ${profile?.role || "not found"}`);

        if (!profile) {
          await supabase.from("profiles").upsert({
            id: user.id,
            role: "student",
          });

          router.push("/student/dashboard");
          return;
        }

        if (profile.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          // alert("✅ Login successful2");
          router.push("/student/dashboard");
        }
      }
    } catch (err: any) {
      console.error("❌ AUTH ERROR:", err);
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

    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;

    if (user) {
      await supabase.from("students").insert([
  {
    auth_user_id: user.id,
    student_name: name,
    student_code: "CS2024-01",
    email: email,
    attendance: 90,
  },
]);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) alert(error.message);
    else alert("📩 Reset email sent");
    
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
          {isSignup
            ? "Create Account"
            : "Welcome Back"}
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
            className="
              w-full
              bg-orange-50/60
              border
              border-orange-100
              rounded-xl
              px-4
              py-3
              outline-none
              focus:ring-4
              focus:ring-orange-100
              focus:border-orange-400
              transition-all
              text-sm
              text-slate-700
            "
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
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
          placeholder="Enter your email"
          className="
            w-full
            bg-orange-50/60
            border
            border-orange-100
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-4
            focus:ring-orange-100
            focus:border-orange-400
            transition-all
            text-sm
            text-slate-700
          "
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />
      </div>

      {/* PASSWORD */}

      <div className="mb-4">

        <label className="text-xs font-semibold text-slate-700 mb-2 block">
          Password
        </label>

        <div className="relative">

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Enter your password"
            className="
              w-full
              bg-orange-50/60
              border
              border-orange-100
              rounded-xl
              px-4
              py-3
              pr-20
              outline-none
              focus:ring-4
              focus:ring-orange-100
              focus:border-orange-400
              transition-all
              text-sm
              text-slate-700
            "
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-xs
              font-semibold
              text-orange-500
              hover:text-orange-600
              transition-all
            "
          >
            {showPassword
              ? "Hide"
              : "Show"}
          </button>
        </div>
      </div>

      {/* LOGIN BUTTON */}

      <button
        onClick={handleAuth}
        disabled={loading}
        className={`
          w-full
          py-3
          rounded-xl
          font-bold
          text-sm
          text-white
          transition-all
          duration-300
          shadow-lg
          ${
            loading
              ? "bg-orange-300 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          }
        `}
      >
        {loading
          ? "Please wait..."
          : isSignup
          ? "Create Account"
          : "Login"}
      </button>

      {/* FORGOT PASSWORD */}

      {!isSignup && (
        <p
          onClick={
            handleForgotPassword
          }
          className="
            text-xs
            text-orange-500
            hover:text-orange-600
            mt-4
            text-center
            cursor-pointer
            font-semibold
            transition-all
          "
        >
          Forgot Password?
        </p>
      )}

      {/* TOGGLE */}

      <div className="mt-5 text-center text-xs text-slate-500">

        {isSignup
          ? "Already have an account?"
          : "New to ExamLens?"}

        <span
          className="
            ml-1
            text-orange-500
            hover:text-orange-600
            font-bold
            cursor-pointer
            transition-all
          "
          onClick={() =>
            setIsSignup(!isSignup)
          }
        >
          {isSignup
            ? "Login"
            : "Create Account"}
        </span>
      </div>
    </div>
  </div>
</div>
  </div>
);
}