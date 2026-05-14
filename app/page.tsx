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

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle(); // ✅ FIXED

        if (!profile) {
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

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) alert(error.message);
    else alert("📩 Reset email sent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d426a] via-[#005b8f] to-[#00a0dc] px-4">

      <div className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-[#0d426a] mb-2">
          ExamLens
        </h1>

        <p className="text-center text-gray-500 mb-6">
          {isSignup ? "Create your account" : "Welcome back"}
        </p>

        {isSignup && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full mb-3 p-3 border rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full py-3 bg-[#0d426a] text-white rounded-lg"
        >
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>

        {!isSignup && (
          <p
            onClick={handleForgotPassword}
            className="text-sm text-[#00a0dc] mt-3 text-center cursor-pointer"
          >
            Forgot Password?
          </p>
        )}

        <p className="text-center text-sm mt-5">
          {isSignup ? "Already have account?" : "New here?"}{" "}
          <span
            className="text-[#00a0dc] cursor-pointer"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Login" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
}