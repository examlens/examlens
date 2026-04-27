"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function StudentLayout({ children }: any) {
  const path = usePathname();
  const router = useRouter();

  const menu = [
    { name: "My Dashboard", path: "/student/dashboard" },
    { name: "Take Exam", path: "/student/exams" },
    { name: "My Results", path: "/student/results" },
    { name: "Upload Answer", path: "/upload" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* 🔹 SIDEBAR */}
      <div className="w-64 bg-black text-white flex flex-col justify-between">
        
        {/* TOP */}
        <div>
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">
              Exam<span className="text-orange-500">Lens</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              AI Evaluation Platform
            </p>
          </div>

          {/* MENU */}
          <div className="p-4 space-y-2">
            {menu.map((item) => (
              <Link key={item.path} href={item.path}>
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
            className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 🔹 MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Student Panel
          </h2>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}