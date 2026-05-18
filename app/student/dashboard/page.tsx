"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  Trophy,
  Calendar,
  Activity,
} from "lucide-react";

import { supabase } from "@/app/lib/supabase";

export default function StudentDashboard() {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard =
    async () => {
      try {
        // =========================================
        // GET CURRENT SESSION
        // =========================================

        const {
          data: { session },
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (
          sessionError ||
          !session
        ) {
          console.log(
            "Session Error:",
            sessionError
          );

          setLoading(false);
          return;
        }

        const studentId =
          session.user.id;

        console.log(
          "👤 Student ID:",
          studentId
        );

        // =========================================
        // FETCH DASHBOARD DATA
        // =========================================

        const res = await fetch(
          `/api/student/dashboard?student_id=${studentId}`
        );

        const result =
          await res.json();

        console.log(
          "📊 Dashboard Data:",
          result
        );

        if (!res.ok) {
          throw new Error(
            result.error ||
              "Failed to fetch dashboard"
          );
        }

        setData(result);
      } catch (err: any) {
        console.log(
          "Dashboard Fetch Error:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />

          <p className="text-slate-600 text-lg font-medium">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const profile =
    data?.profile || {};

  const results =
    data?.results || [];

  // Ensure exams are ordered by completion date so the first completed exam
  // appears first (Exam #1)
  const sortedResults = [...results].sort((a: any, b: any) => {
    const da = a.completed_at ? new Date(a.completed_at).getTime() : 0;
    const db = b.completed_at ? new Date(b.completed_at).getTime() : 0;
    return da - db;
  });

  // const upcomingExams =
  //   data?.upcomingExams || [];

  return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4 md:p-6">

    {/* ===================================================== */}
    {/* HEADER */}
    {/* ===================================================== */}

    <div className="relative overflow-hidden rounded-[32px] bg-white p-8 mb-8 shadow-xl">

      <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>
          <p className="uppercase tracking-[0.25em] text-orange-800 text-xs font-semibold">
            Student Dashboard
          </p>

          <h1 className="text-4xl font-black text-black mt-3">
            WELCOME BACK
          </h1>

          <p className="text-slate-500 mt-3 max-w-2xl leading-relaxed">
            Monitor your academic growth, performance insights,
            attendance progress and completed evaluations.
          </p>
        </div>

        <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl px-6 py-5 min-w-[220px]">
          <p className="text-browntext-sm uppercase tracking-wider">
            Exams Evaluated
          </p>

          <h2 className="text-5xl font-black text-orange-500 mt-2">
            {results.length}
          </h2>
        </div>
      </div>
    </div>

    {/* ===================================================== */}
    {/* STATS */}
    {/* ===================================================== */}

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">

      {/* CARD */}

      <div className="group relative overflow-hidden rounded-[30px] bg-white border border-orange-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300">

        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-wide text-orange-500 uppercase">
            Total Submissions
          </p>

          <h2 className="text-5xl font-black text-slate-900 mt-5">
            {data?.submissionCount || 0}
          </h2>

          <div className="mt-6 w-full h-2 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full w-[85%] bg-orange-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* CARD */}

      <div className="group relative overflow-hidden rounded-[30px] bg-white border border-orange-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300">

        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-wide text-orange-500 uppercase">
            Average Score
          </p>

          <h2 className="text-5xl font-black text-slate-900 mt-5">
            {profile?.avg_score || 0}%
          </h2>

          <div className="mt-6 w-full h-2 bg-orange-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-orange-500 rounded-full"
              style={{
                width: `${profile?.avg_score || 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* CARD */}

      <div className="group relative overflow-hidden rounded-[30px] bg-white border border-orange-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300">

        <div className="absolute top-10 left-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-wide text-orange-500 uppercase">
            Attendance
          </p>

          <h2 className="text-5xl font-black text-slate-900 mt-5">
            {profile?.attendance || 0}%
          </h2>

          <div className="mt-6 w-full h-2 bg-orange-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-orange-500 rounded-full"
              style={{
                width: `${profile?.attendance || 0}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>

    {/* ===================================================== */}
    {/* PERFORMANCE SECTION */}
    {/* ===================================================== */}

    <div className="rounded-[36px] bg-white border border-orange-100 shadow-xl overflow-hidden">

      {/* HEADER */}

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <h2 className="text-3xl font-black text-white">
              Performance Overview
            </h2>

            <p className="text-orange-100 mt-2">
              Detailed exam-wise performance analytics
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4">

            <p className="text-orange-100 text-xs uppercase tracking-widest">
              Total Results
            </p>

            <h3 className="text-3xl font-black text-white mt-1">
              {results.length}
            </h3>
          </div>
        </div>
      </div>

      {/* BODY */}

      <div className="p-6 md:p-8">

        {results.length === 0 ? (
          <div className="h-[350px] flex flex-col items-center justify-center">

            <div className="w-28 h-28 rounded-full bg-orange-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-orange-500" />
            </div>

            <h2 className="text-2xl font-bold text-slate-700">
              No Results Available
            </h2>

            <p className="text-slate-500 mt-3 text-center max-w-md">
              Your evaluated exams will appear here once the
              assessment is completed.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {sortedResults.map(
              (
                result: any,
                index: number
              ) => (
                <div
                  key={result.id}
                  className="relative overflow-hidden rounded-[30px] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-6 hover:shadow-xl transition-all duration-300"
                >

                  <div className="absolute top-0 right-0 w-52 h-52 bg-orange-100 rounded-full blur-3xl opacity-40" />

                  <div className="relative z-10">

                    {/* TOP */}

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">

                      <div>
                        {/* <p className="text-xs uppercase tracking-[0.2em] text-orange-500 font-bold">
                          Exam #{index + 1}
                        </p> */}

                        <h3 className="text-2xl font-black text-slate-900 mt-2">
                          {result.exam_title}
                        </h3>

                        <p className="text-slate-500 mt-3 leading-relaxed max-w-3xl">
                          {result.feedback}
                        </p>
                      </div>

                      <div className="min-w-[120px]">

                        <div className="bg-white border border-orange-100 rounded-3xl px-5 py-4 text-center shadow-sm">

                          <h2 className="text-4xl font-black text-orange-500">
                            {result.percentage}%
                          </h2>

                          <p className="text-slate-500 text-sm mt-1">
                            Performance
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SCORE */}

                    <div className="flex items-center justify-between mb-3">

                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        Score Progress
                      </p>

                      <p className="text-sm font-bold text-slate-700">
                        {result.score}/{result.total_marks}
                      </p>
                    </div>

                    {/* BAR */}

                    <div className="w-full h-4 bg-orange-100 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-700"
                        style={{
                          width: `${result.percentage}%`,
                        }}
                      />
                    </div>

                    {/* FOOTER */}

                    <div className="mt-4 flex items-center justify-between text-sm">

                      <span className="text-slate-400">
                        Needs Improvement
                      </span>

                      <span className="font-semibold text-orange-600">
                        Academic Performance
                      </span>

                      <span className="text-green-500 font-bold">
                        Excellent
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
}