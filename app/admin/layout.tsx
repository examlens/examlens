"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Menu, LogOut } from "lucide-react";
export default function AdminLayout({ children }: any) {
  const path = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [path]);

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Exams", path: "/admin/exams", icon: "📋" },
    { name: "Students", path: "/admin/students", icon: "👥" },
    { name: "Submissions", path: "/admin/submissions", icon: "📥" },
    { name: "Questions", path: "/admin/questions", icon: "❓" },
    { name: "Revision Notes", path: "/admin/revision", icon: "📖" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-[100dvh] flex overflow-hidden">

      {/* ================================================
          MOBILE OVERLAY
      ================================================ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden sidebar-overlay animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================================================
          SIDEBAR
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
            <div className="mt-2 inline-flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/20 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-xs text-orange-400 font-semibold">Admin Panel</span>
            </div>
          </div>

          {/* MENU */}
          <div className="p-4 space-y-1">
            {menu.map((item) => (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    path === item.path
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-900/40"
                      : "hover:bg-gray-800 text-gray-300 hover:text-white"
                  }`}
                >
                  <span className="hidden md:inline-block text-base">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================================================
          MAIN CONTENT
      ================================================ */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-[100dvh]">

        {/* MOBILE TOPBAR */}
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

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
