"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ AUTO REDIRECT IF ALREADY LOGGED IN
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

  // ✅ AUTH HANDLER
  const handleAuth = async () => {
    try {
      setLoading(true);

      if (isSignup) {
        // 🔹 SIGNUP
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        const user = data.user;
        if (!user) throw new Error("Signup failed");

        // ✅ ALWAYS CREATE AS STUDENT (NO ROLE SELECT)
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            role: "student",
          });

        if (profileError) throw profileError;

        alert("✅ Signup successful. Please login.");
        setIsSignup(false);
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

        // ✅ FETCH ROLE
        const { data: profile, error: roleError } =
          await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (roleError) throw roleError;

        // ✅ REDIRECT BASED ON ROLE
        if (profile.role === "admin") {
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
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0d426a] to-[#00a0dc]">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
        {/* TITLE */}
        <h1 className="text-2xl font-bold text-center mb-2">
          ExamLens
        </h1>

        <p className="text-center text-gray-500 mb-6">
          {isSignup ? "Create your account" : "Welcome back"}
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
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
            className="absolute right-3 top-3 cursor-pointer text-sm text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleAuth}
          className="w-full bg-[#0d426a] hover:bg-[#0b3656] text-white py-3 rounded-lg"
        >
          {loading
            ? "Please wait..."
            : isSignup
            ? "Sign Up"
            : "Login"}
        </button>

        {/* FORGOT PASSWORD */}
        {!isSignup && (
          <p
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 mt-3 cursor-pointer text-center"
          >
            Forgot Password?
          </p>
        )}

        {/* TOGGLE */}
        <p className="text-center text-sm mt-4">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Login" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
}