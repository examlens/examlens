"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  Trophy,
  CalendarDays,
  TrendingUp,
  Clock3,
  CheckCircle2,
  Activity,
} from "lucide-react";

type DashboardData = {
  totalStudents: number;
  averageScore: number;
  totalSubmissions: number;
  evaluatedSubmissions: number;
  pendingSubmissions: number;
  upcomingExams: any[];
  topStudents: any[];
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardData>({
      totalStudents: 0,
      averageScore: 0,
      totalSubmissions: 0,
      evaluatedSubmissions: 0,
      pendingSubmissions: 0,
      upcomingExams: [],
      topStudents: [],
    });

  const [loading, setLoading] =
    useState(true);

  // ======================================================
  // FETCH DASHBOARD DATA
  // ======================================================

  const fetchDashboard =
    async () => {
      try {
        const res = await fetch(
          "/api/admin/dashboard"
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ||
              "Failed to fetch dashboard"
          );
        }

        setDashboard(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-xl border border-orange-100 rounded-[36px] px-12 py-10 shadow-2xl text-center">

        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-orange-200" />

          <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        </div>

        <h2 className="text-3xl font-black text-slate-800">
          Loading Dashboard
        </h2>

        <p className="text-slate-500 mt-3">
          Preparing analytics and performance insights...
        </p>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-6">

    {/* ====================================================== */}
    {/* TOP HEADER */}
    {/* ====================================================== */}

    <div className="relative overflow-hidden rounded-[38px] bg-black p-8 mb-10 shadow-2xl">

      {/* GLOW EFFECTS */}

      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />

      <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-300/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

        {/* LEFT */}

        <div>
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/20 px-4 py-2 rounded-full text-orange-400 text-sm font-semibold mb-5">
            ADMIN PANEL
          </div>

          <h1 className="text-5xl font-black text-white leading-tight">
            Smart Exam
            <span className="block text-orange-500">
              Analytics Dashboard
            </span>
          </h1>

          <p className="text-slate-400 text-lg mt-5 max-w-2xl leading-relaxed">
            Track student performance, monitor evaluations,
            manage submissions and gain real-time academic insights.
          </p>
        </div>

        {/* RIGHT */}

        <div className="grid grid-cols-2 gap-5 min-w-[320px]">

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
            <p className="text-slate-400 text-sm">
              Students
            </p>

            <h2 className="text-4xl font-black text-white mt-2">
              {dashboard.totalStudents}
            </h2>
          </div>

          <div className="bg-orange-500 rounded-3xl p-5 shadow-lg shadow-orange-500/30">
            <p className="text-orange-100 text-sm">
              Avg Score
            </p>

            <h2 className="text-4xl font-black text-white mt-2">
              {dashboard.averageScore}%
            </h2>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
            <p className="text-slate-400 text-sm">
              Submissions
            </p>

            <h2 className="text-4xl font-black text-white mt-2">
              {dashboard.totalSubmissions}
            </h2>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
            <p className="text-slate-400 text-sm">
              Evaluated
            </p>

            <h2 className="text-4xl font-black text-orange-400 mt-2">
              {dashboard.evaluatedSubmissions}
            </h2>
          </div>
        </div>
      </div>
    </div>

    {/* ====================================================== */}
    {/* MAIN GRID */}
    {/* ====================================================== */}

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

      {/* ====================================================== */}
      {/* PERFORMANCE SECTION */}
      {/* ====================================================== */}

      <div className="xl:col-span-2 bg-white rounded-[36px] border border-orange-100 shadow-xl overflow-hidden">

        {/* TOP */}

        <div className="px-8 py-7 border-b border-orange-100 bg-gradient-to-r from-orange-500 to-orange-600">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-3xl font-black text-white">
                Student Performance
              </h2>

              <p className="text-orange-100 mt-2">
                Top performing students overview
              </p>
            </div>

            <div className="bg-white/15 border border-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl">
              <p className="text-sm text-orange-100">
                Active Students
              </p>

              <h3 className="text-2xl font-black text-white mt-1">
                {dashboard.topStudents.length}
              </h3>
            </div>
          </div>
        </div>

        {/* STUDENTS */}

        <div className="p-7 space-y-5">

          {dashboard.topStudents.length === 0 ? (
            <div className="py-24 text-center">

              <div className="w-24 h-24 rounded-full bg-orange-100 mx-auto flex items-center justify-center mb-6">
                <span className="text-4xl">
                  📊
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-700">
                No Student Data
              </h3>

              <p className="text-slate-500 mt-3">
                Performance analytics will appear here
              </p>
            </div>
          ) : (
            dashboard.topStudents.map(
              (student, index) => (
                <div
                  key={student.id}
                  className="group border border-orange-100 hover:border-orange-300 rounded-[30px] p-6 transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-white to-orange-50/40"
                >

                  <div className="flex items-center justify-between gap-5">

                    {/* LEFT */}

                    <div className="flex items-center gap-5">

                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-200">
                        {(
                          student.name || "S"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-2xl font-black text-slate-800">
                          {student.name}
                        </h3>

                        <p className="text-slate-500 mt-1">
                          {student.email}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT */}

                    <div className="text-right min-w-[140px]">

                      <div
                        className={`inline-flex px-4 py-2 rounded-2xl text-sm font-bold mb-3 ${
                          student.avg_score >= 80
                            ? "bg-green-100 text-green-700"
                            : student.avg_score >= 50
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.avg_score >= 80
                          ? "Excellent"
                          : student.avg_score >= 50
                          ? "Good"
                          : "Needs Improvement"}
                      </div>

                      <h2 className="text-4xl font-black text-orange-600">
                        {student.avg_score}%
                      </h2>
                    </div>
                  </div>

                  {/* PROGRESS */}

                  <div className="mt-6">
                    <div className="w-full h-4 bg-orange-100 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-700"
                        style={{
                          width: `${student.avg_score}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* RIGHT PANEL */}
      {/* ====================================================== */}

      <div className="space-y-8">

        {/* PENDING CARD */}

        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-orange-500 to-orange-600 p-8 shadow-2xl shadow-orange-200">

          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">

            <p className="text-orange-100 text-sm uppercase tracking-widest">
              Pending Reviews
            </p>

            <h2 className="text-7xl font-black text-white mt-5">
              {dashboard.pendingSubmissions}
            </h2>

            <p className="text-orange-100 mt-5 leading-relaxed">
              Submissions waiting for AI evaluation and admin review.
            </p>
          </div>
        </div>

        {/* QUICK STATS */}

        <div className="bg-white rounded-[36px] border border-orange-100 shadow-xl p-7">

          <h2 className="text-2xl font-black text-slate-800 mb-7">
            Quick Insights
          </h2>

          <div className="space-y-5">

            <div className="bg-orange-50 rounded-3xl p-5 border border-orange-100">

              <p className="text-sm text-orange-500 font-semibold">
                Evaluation Rate
              </p>

              <h3 className="text-4xl font-black text-slate-800 mt-2">
                {dashboard.totalSubmissions > 0
                  ? Math.round(
                      (dashboard.evaluatedSubmissions /
                        dashboard.totalSubmissions) *
                        100
                    )
                  : 0}
                %
              </h3>
            </div>

            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200">

              <p className="text-sm text-slate-500 font-semibold">
                Active Performance
              </p>

              <h3 className="text-4xl font-black text-orange-600 mt-2">
                {dashboard.averageScore}%
              </h3>
            </div>

            <div className="bg-black rounded-3xl p-5">

              <p className="text-sm text-orange-300 font-semibold">
                Platform Status
              </p>

              <h3 className="text-3xl font-black text-white mt-2">
                Running Smoothly
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}