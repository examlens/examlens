"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    evaluated: 0,
    pending: 0,
    avgScore: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin-stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 🔳 Sidebar */}
      <div className="w-64 bg-black text-white p-5">
        <h1 className="text-xl font-bold text-orange-500 mb-6">
          ExamLens
        </h1>

        <ul className="space-y-3">
          <li className="bg-orange-600 p-2 rounded">
            Dashboard
          </li>

          <li
            className="hover:bg-gray-800 p-2 rounded cursor-pointer"
            onClick={() => (window.location.href = "/admin/submissions")}
          >
            Submissions
          </li>

          <li className="hover:bg-gray-800 p-2 rounded cursor-pointer">
            Students
          </li>

          <li className="hover:bg-gray-800 p-2 rounded cursor-pointer">
            Reports
          </li>
        </ul>
      </div>

      {/* 📊 Main Content */}
      <div className="flex-1 p-6">

        <h1 className="text-2xl font-bold mb-6">
          Admin Dashboard
        </h1>

        {/* 📊 Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500">Total Submissions</p>
            <h2 className="text-2xl font-bold">
              {stats.totalSubmissions}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500">Evaluated</p>
            <h2 className="text-2xl font-bold text-green-600">
              {stats.evaluated}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500">Pending</p>
            <h2 className="text-2xl font-bold text-yellow-500">
              {stats.pending}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500">Avg Score</p>
            <h2 className="text-2xl font-bold text-blue-600">
              {stats.avgScore}%
            </h2>
          </div>

        </div>

        {/* 📈 Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold mb-3">
              ⚡ Quick Actions
            </h2>

            <button
              onClick={() =>
                (window.location.href = "/admin/submissions")
              }
              className="w-full bg-orange-600 text-white py-2 rounded mb-2"
            >
              Evaluate Submissions
            </button>

            <button className="w-full bg-gray-800 text-white py-2 rounded">
              View Reports
            </button>
          </div>

          {/* 📊 Activity */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold mb-3">
              📊 System Status
            </h2>

            <p className="text-sm text-gray-600 mb-2">
              AI Evaluation Engine: ✅ Active
            </p>

            <p className="text-sm text-gray-600 mb-2">
              API Status: ✅ Running
            </p>

            <p className="text-sm text-gray-600">
              Last Updated: Just now
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}