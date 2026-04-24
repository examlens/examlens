"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // ✅ AUTO REDIRECT if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        redirectUser(user.id);
      }
    };

    checkUser();
  }, []);

  const redirectUser = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  console.log("PROFILE:", profile, error);

  // 🚨 If no profile → create one automatically
  if (!profile) {
    console.log("⚠️ Creating missing profile...");

    await supabase.from("profiles").upsert([
      {
        id: userId,
        role: "student",
      },
    ]);

    return router.push("/dashboard");
  }

  // ✅ Role-based redirect
  if (profile.role === "admin") {
    router.push("/admin/dashboard");
  } else {
    router.push("/dashboard");
  }
};

  // ✅ LOGIN
 const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  await redirectUser(data.user.id);
};

  // ✅ SIGNUP
const handleSignup = async () => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  if (!data?.user) {
    alert("Signup failed. Please try again.");
    return;
  }

  // insert profile
  await supabase.from("profiles").upsert([
    {
      id: data.user.id,
      role: "student",
    },
  ]);

    alert("Signup successful. Now login.");
    setIsLogin(true);
  };

  return (
    <div className="flex h-screen">

      {/* LEFT SIDE (Brand UI) */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-black text-white">
        <h1 className="text-4xl font-bold text-orange-500">
          ExamLens
        </h1>
        <p className="mt-2 text-gray-400">
          AI Evaluation Platform
        </p>
      </div>

      {/* RIGHT SIDE (Form) */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow w-80">

          <h2 className="text-xl font-bold mb-4 text-center">
            {isLogin ? "Login" : "Signup"}
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 mb-3"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 mb-3"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={isLogin ? handleLogin : handleSignup}
            className="w-full bg-orange-600 text-white py-2 rounded"
          >
            {isLogin ? "Login" : "Signup"}
          </button>

          <p className="text-sm mt-3 text-center">
            {isLogin ? "Don't have account?" : "Already have account?"}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 cursor-pointer ml-1"
            >
              {isLogin ? "Signup" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}