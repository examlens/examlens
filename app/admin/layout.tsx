"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AdminLayout({ children }: any) {
  const path = usePathname();

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Analytics", path: "/admin/analytics" },
    { name: "Exams", path: "/admin/exams" },
    { name: "Students", path: "/admin/students" },
    { name: "Submissions", path: "/admin/submissions" },
    { name: "questions", path: "/admin/questions" }
  ];

  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-5">
        <h1 className="text-xl font-bold mb-6 text-orange-400">
          ExamLens
        </h1>

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
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 bg-gray-100 p-6">{children}</div>
    </div>
  );
}