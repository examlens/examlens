"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: any) {
  const path = usePathname();

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Analytics", path: "/admin/analytics" },
    { name: "Question Bank", path: "/admin/question-bank" },
    { name: "Exams", path: "/admin/exams" },
    { name: "Students", path: "/admin/students" },
    { name: "Submissions", path: "/admin/submissions" },
  ];

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
              className={`p-2 rounded mb-2 cursor-pointer ${
                path === item.path
                  ? "bg-orange-600"
                  : "hover:bg-gray-700"
              }`}
            >
              {item.name}
            </div>
          </Link>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-100 p-6">{children}</div>
    </div>
  );
}