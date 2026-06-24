"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { Menu, X, LogOut } from "lucide-react";
export default function StudentLayout({ children }: any) {
  const path = usePathname();
  const router = useRouter();

  const [studentName, setStudentName] = useState("Student");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =====================================================
  // FETCH LOGGED-IN USER NAME
  // =====================================================
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name =
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Student";
        setStudentName(name);
      }
    };
    fetchUser();
  }, []);

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setSidebarOpen(false);
  }, [path]);

  const menu = [
    { name: "My Dashboard", path: "/student/dashboard", icon: "🏠" },
    { name: "Revision Notes", path: "/student/revision", icon: "📖" },
    { name: "AI Learning", path: "/student/ai-learning", icon: "🤖" },
    { name: "Take Exam", path: "/student/exams", icon: "📝" },
    { name: "My Results", path: "/student/results", icon: "🏆" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex h-[100dvh] bg-gray-100 overflow-x-hidden w-full">

      {/* ================================================
          MOBILE OVERLAY — click to close sidebar
      ================================================ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden sidebar-overlay animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================================================
          SIDEBAR
          - Mobile: fixed drawer, slides in/out
          - Desktop: fixed, always visible
      ================================================ */}
      <aside
        className={[
          "fixed left-0 top-0 z-50 h-[100dvh] w-64 bg-black text-white flex flex-col justify-between",
          "transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        ].join(" ")}
      >
        {/* TOP */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">
              Exam<span className="text-orange-500">Lens</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">AI Evaluation Platform</p>
          </div>

          {/* MENU */}
          <div className="p-4 space-y-1">
            {menu.map((item) => (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    path === item.path
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-900/40"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span className="hidden md:inline-block text-lg">{item.icon}</span>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* BOTTOM — only show on desktop; mobile uses topbar logout */}
        <div className="hidden md:block p-4 border-t border-gray-800 space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm uppercase">
              {studentName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate capitalize">{studentName}</p>
              <p className="text-xs text-zinc-400">Student</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================================================
          MAIN CONTENT AREA
      ================================================ */}
      <div className="flex-1 flex flex-col md:ml-64 h-[100dvh] overflow-y-auto overflow-x-hidden min-w-0">

        {/* ================================================
            MOBILE TOPBAR — visible only on < md
        ================================================ */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-black border-b border-gray-800 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-lg font-bold text-white">
            Exam<span className="text-orange-500">Lens</span>
          </h1>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* ================================================
            DESKTOP TOPBAR — visible on md+
        ================================================ */}
        <div className="hidden md:block sticky top-3 z-20 mx-4 mt-3">
          <div className="relative overflow-hidden rounded-[30px] border border-orange-500/20 bg-gradient-to-r from-black via-zinc-950 to-black shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">

            {/* GLOW EFFECTS */}
            <div className="absolute -top-16 -left-16 w-52 h-52 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl" />

            {/* CONTENT */}
            <div className="relative z-10 px-6 lg:px-8 py-5 flex items-center justify-between">

              {/* LEFT */}
              <div className="flex items-center gap-5">
                <div className="relative w-14 h-14 rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-[0_8px_25px_rgba(249,115,22,0.45)]">
                  <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-xl" />
                  <span className="relative text-2xl">🎓</span>
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                    Student Dashboard
                  </h1>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    Monitor exams, results & academic analytics
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-4">
                {/* ACTIVE SESSION BADGE */}
                <div className="hidden lg:flex items-center gap-3 px-5 py-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 backdrop-blur-xl">
                  <div className="relative flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
                    <div className="absolute w-3 h-3 rounded-full bg-orange-400 animate-ping opacity-50" />
                  </div>
                  <span className="text-sm font-semibold text-orange-300">Active Session</span>
                </div>

                {/* PROFILE */}
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 px-4 py-3 cursor-pointer backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg">
                    {studentName.charAt(0)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-white capitalize">{studentName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Welcome back 👋</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-6 flex-1 page-enter overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}