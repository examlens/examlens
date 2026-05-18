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
                  className={`px-4 py-3 rounded-lg cursor-pointer transition-all ${path === item.path
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
        <div className="sticky top-3 z-50 mx-4">
          <div
            className="
      relative
      overflow-hidden
      rounded-[30px]
      border
      border-orange-500/20
      bg-gradient-to-r
      from-black
      via-zinc-950
      to-black
      shadow-[0_10px_40px_rgba(0,0,0,0.35)]
      backdrop-blur-2xl
    "
          >

            {/* GLOW EFFECTS */}

            <div className="absolute -top-16 -left-16 w-52 h-52 bg-orange-500/20 rounded-full blur-3xl" />

            <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl" />

            {/* CONTENT */}

            <div className="relative z-10 px-6 lg:px-8 py-5 flex items-center justify-between">

              {/* ===================================================== */}
              {/* LEFT */}
              {/* ===================================================== */}

              <div className="flex items-center gap-5">

                {/* LOGO */}

                <div
                  className="
            relative
            w-16
            h-16
            rounded-3xl
            bg-gradient-to-br
            from-orange-400
            via-orange-500
            to-orange-600
            flex
            items-center
            justify-center
            shadow-[0_8px_25px_rgba(249,115,22,0.45)]
          "
                >

                  <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-xl" />

                  <span className="relative text-3xl">
                    🎓
                  </span>
                </div>

                {/* TITLE */}

                <div>
                  <h1
                    className="
              text-3xl
              font-black
              tracking-tight
              bg-gradient-to-r
              from-orange-300
              via-orange-400
              to-orange-500
              bg-clip-text
              text-transparent
            "
                  >
                    Student Dashboard
                  </h1>

                  <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                    Monitor exams, results, attendance and academic analytics
                  </p>
                </div>
              </div>

              {/* ===================================================== */}
              {/* RIGHT */}
              {/* ===================================================== */}

              <div className="flex items-center gap-4">

                {/* STATUS */}

                <div
                  className="
            hidden
            md:flex
            items-center
            gap-3
            px-5
            py-3
            rounded-2xl
            border
            border-orange-500/20
            bg-orange-500/10
            backdrop-blur-xl
          "
                >

                  <div className="relative flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />

                    <div className="absolute w-3 h-3 rounded-full bg-orange-400 animate-ping opacity-50" />
                  </div>

                  <span className="text-sm font-semibold text-orange-300">
                    Active Session
                  </span>
                </div>

                {/* PROFILE */}

                <div
                  className="
            flex
            items-center
            gap-4
            rounded-2xl
            border
            border-white/10
            bg-white/5
            hover:bg-white/10
            transition-all
            duration-300
            px-4
            py-3
            cursor-pointer
            backdrop-blur-xl
          "
                >

                  {/* AVATAR */}

                  <div
                    className="
              w-12
              h-12
              rounded-2xl
              bg-gradient-to-br
              from-orange-400
              to-orange-600
              flex
              items-center
              justify-center
              text-white
              font-black
              text-lg
              uppercase
              shadow-lg
            "
                  >
                    {studentName.charAt(0)}
                  </div>

                  {/* INFO */}

                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-white capitalize">
                      {studentName}
                    </p>

                    <p className="text-xs text-zinc-400 mt-1">
                      Welcome back 👋
                    </p>
                  </div>
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