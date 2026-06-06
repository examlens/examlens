"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AdminLayout({ children }: any) {
  const path = usePathname();

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard" },
    // { name: "Analytics", path: "/admin/analytics" },
    { name: "Exams", path: "/admin/exams" },
    { name: "Students", path: "/admin/students" },
    { name: "Submissions", path: "/admin/submissions" },
    { name: "questions", path: "/admin/questions" },
    { name: "Revision Notes", path: "/admin/revision" }
  ];

  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen w-64 bg-black text-white p-5">
        <h1 className="text-xl font-bold text-white">
          Exam
          <span className="text-orange-500">
            Lens
          </span>
        </h1>

         <p className="text-xs text-gray-400 mt-1">
              AI Evaluation Platform
            </p>
            <div className="mt-6">

        {menu.map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              className={`p-2 rounded mb-2 cursor-pointer ${path === item.path
                ? "bg-orange-600"
                : "hover:bg-gray-700"
                }`}
            >
              {item.name}
            </div>
          </Link>
        ))}
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
      {/* Content */}
      <main className="flex-1 bg-gray-100 p-6 min-h-screen">{children}</main>
    </div>
  );
}