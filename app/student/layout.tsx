"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/app/lib/supabase";

export default function StudentLayout({
  children,
}: any) {
  const path = usePathname();

  const router = useRouter();

  const [studentName, setStudentName] =
    useState("Student");

  // =====================================================
  // ✅ FETCH LOGGED-IN USER NAME
  // =====================================================

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const name =
          user.user_metadata?.name ||
          user.user_metadata
            ?.full_name ||
          user.email
            ?.split("@")[0] ||
          "Student";

        setStudentName(name);
      }
    };

    fetchUser();
  }, []);

  const menu = [
    {
      name: "My Dashboard",
      path: "/student/dashboard",
    },
    {
      name: "Take Exam",
      path: "/student/exams",
    },
    {
      name: "My Results",
      path: "/student/results",
    },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.push("/");
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* 🔹 STATIC SIDEBAR */}
      <div className="w-64 bg-black text-white flex flex-col justify-between fixed left-0 top-0 h-screen z-50">

        {/* TOP */}
        <div>
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">
              Exam
              <span className="text-orange-500">
                Lens
              </span>
            </h1>

            <p className="text-xs text-gray-400 mt-1">
              AI Evaluation Platform
            </p>
          </div>

          {/* MENU */}
          <div className="p-4 space-y-2">
            {menu.map((item) => (
              <Link
                key={item.path}
                href={item.path}
              >
                <div
                  className={`px-4 py-3 rounded-lg cursor-pointer transition-all ${
                    path === item.path
                      ? "bg-orange-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 🔹 MAIN CONTENT */}
      <div className="flex-1 flex flex-col ml-64 h-screen overflow-y-auto">

        {/* TOP BAR */}
        <div className="sticky top-1 z-40 backdrop-blur-xl bg-black border-b border-white/30 shadow-sm border-rounded-lg mx-4 mt-4">
          <div className="px-6 py-4 flex items-center justify-between">

            {/* LEFT SECTION */}
            <div className="flex items-center gap-4">

              {/* LOGO */}
              <div className="w-14 h-14 rounded-2xl  flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white">
                  🎓
                </span>
              </div>

              {/* TITLE */}
              <div>
                <h1 className="text-2xl font-bold bg-orange-500 bg-clip-text text-transparent">
                  Student Dashboard
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  Track exams, results,
                  analytics and performance
                </p>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-4">

              {/* STATUS */}
              <div className="hidden md:flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-2 rounded-2xl">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />

                <span className="text-sm font-medium text-green-700">
                  Online
                </span>
              </div>

              {/* PROFILE */}
              <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">

                {/* AVATAR */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg uppercase">
                  {studentName.charAt(0)}
                </div>

                {/* USER INFO */}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 capitalize">
                    {studentName}
                  </p>

                  <p className="text-xs text-slate-500">
                    Welcome back 👋
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}