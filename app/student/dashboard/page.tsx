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

  const upcomingExams =
    data?.upcomingExams || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 p-6">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800">
          Welcome Back 👋
        </h1>

        <p className="text-slate-500 mt-2 text-lg">
          Track your exams,
          attendance and
          performance analytics
        </p>
      </div>

      {/* ===================================================== */}
      {/* STATS */}
      {/* ===================================================== */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        <StatCard
          icon={<BookOpen />}
          title="Submissions"
          value={
            data?.submissionCount ||
            0
          }
        />

        <StatCard
          icon={<Trophy />}
          title="Average Score"
          value={`${profile?.avg_score || 0}%`}
        />

        <StatCard
          icon={<Activity />}
          title="Attendance"
          value={`${profile?.attendance || 0}%`}
        />

        <StatCard
          icon={<Calendar />}
          title="Upcoming Exams"
          value={
            upcomingExams.length
          }
        />
      </div>

      {/* ===================================================== */}
      {/* PERFORMANCE OVERVIEW */}
      {/* ===================================================== */}

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200 mb-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              Performance Overview
            </h2>

            <p className="text-slate-500 mt-1">
              Exam-wise score analysis
            </p>
          </div>

          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-2xl font-bold">
            {
              results.length
            }{" "}
            Exams
          </div>
        </div>

        {results.length ===
        0 ? (
          <div className="h-[250px] flex items-center justify-center text-slate-400 text-lg font-medium">
            No Results Available
          </div>
        ) : (
          <div className="space-y-6">

            {results.map(
              (
                result: any,
                index: number
              ) => (
                <div
                  key={result.id}
                  className="bg-slate-50 border border-slate-200 rounded-[28px] p-5"
                >

                  {/* TOP */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">

                    <div>
                      <h3 className="text-xl font-black text-slate-800">
                        {
                          result.exam_title
                        }
                      </h3>

                      <p className="text-slate-500 mt-1">
                        Exam #{index + 1}
                      </p>
                    </div>

                    <div className="text-right">
                      <h2 className="text-3xl font-black text-blue-600">
                        {
                          result.percentage
                        }
                        %
                      </h2>

                      <p className="text-slate-500 text-sm">
                        Performance
                      </p>
                    </div>
                  </div>

                  {/* POLL BAR */}

                  <div className="w-full h-5 bg-slate-200 rounded-full overflow-hidden">

                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        result.percentage >=
                        80
                          ? "bg-green-500"
                          : result.percentage >=
                            50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${result.percentage}%`,
                      }}
                    />
                  </div>

                  {/* LABELS */}

                  <div className="flex items-center justify-between mt-3 text-sm">

                    <span className="text-slate-500">
                      Poor
                    </span>

                    <span className="font-bold text-slate-700">
                      {
                        result.score
                      }
                      /
                      {
                        result.total_marks
                      }
                    </span>

                    <span className="text-slate-500">
                      Excellent
                    </span>
                  </div>

                  {/* FEEDBACK */}

                  <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-4">
                    <p className="text-slate-600 leading-relaxed">
                      {
                        result.feedback
                      }
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* UPCOMING EXAMS */}
      {/* ===================================================== */}

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200 mb-8">

        <h2 className="text-2xl font-black text-slate-800 mb-6">
          Upcoming Exams
        </h2>

        {upcomingExams.length ===
        0 ? (
          <div className="text-center py-12 text-slate-400 text-lg font-medium">
            No Upcoming Exams
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {upcomingExams.map(
              (exam: any) => (
                <div
                  key={exam.id}
                  className="border border-slate-200 rounded-[28px] p-5 hover:shadow-lg transition-all duration-300 bg-slate-50"
                >

                  <h3 className="text-xl font-black text-slate-800">
                    {exam.title}
                  </h3>

                  <p className="text-slate-500 mt-3 line-clamp-3">
                    {exam.description ||
                      "No description available"}
                  </p>

                  <button className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all duration-300">
                    View Exam
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* RECENT RESULTS */}
      {/* ===================================================== */}

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200">

        <h2 className="text-2xl font-black text-slate-800 mb-6">
          Recent Results
        </h2>

        {results.length ===
        0 ? (
          <div className="text-center py-12 text-slate-400 text-lg font-medium">
            No Results Available
          </div>
        ) : (
          <div className="space-y-4">

            {results.map(
              (result: any) => (
                <div
                  key={result.id}
                  className="border border-slate-200 rounded-[24px] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition-all duration-300"
                >

                  <div>
                    <h3 className="font-black text-xl text-slate-800">
                      {
                        result.exam_title
                      }
                    </h3>

                    <p className="text-slate-500 mt-2 max-w-2xl">
                      {
                        result.feedback
                      }
                    </p>
                  </div>

                  <div className="text-right">
                    <h2 className="text-4xl font-black text-blue-600">
                      {
                        result.percentage
                      }
                      %
                    </h2>

                    <p className="text-slate-500 text-sm mt-1">
                      Score
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  title,
  value,
}: any) {
  return (
    <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-slate-500 font-medium">
            {title}
          </p>

          <h2 className="text-4xl font-black text-slate-800 mt-2">
            {value}
          </h2>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}