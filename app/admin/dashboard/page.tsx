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
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 flex items-center justify-center">
        <div className="bg-white rounded-[30px] p-12 shadow-xl text-center">
          <div className="animate-spin w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-5" />

          <h2 className="text-2xl font-bold text-slate-700">
            Loading Dashboard...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 p-6">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-800">
          Admin Dashboard
        </h1>

        <p className="text-slate-500 mt-2 text-lg">
          Monitor students,
          submissions, evaluations
          and upcoming exams
        </p>
      </div>

      {/* ====================================================== */}
      {/* STATS */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {/* TOTAL STUDENTS */}

        <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">
                Total Students
              </p>

              <h2 className="text-4xl font-black text-slate-800 mt-2">
                {
                  dashboard.totalStudents
                }
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Users className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* AVG SCORE */}

        <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">
                Average Score
              </p>

              <h2 className="text-4xl font-black text-green-600 mt-2">
                {
                  dashboard.averageScore
                }
                %
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="text-green-600" />
            </div>
          </div>
        </div>

        {/* TOTAL SUBMISSIONS */}

        <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">
                Total Submissions
              </p>

              <h2 className="text-4xl font-black text-orange-600 mt-2">
                {
                  dashboard.totalSubmissions
                }
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
              <FileText className="text-orange-600" />
            </div>
          </div>
        </div>

        {/* EVALUATED */}

        <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">
                Evaluated
              </p>

              <h2 className="text-4xl font-black text-cyan-600 mt-2">
                {
                  dashboard.evaluatedSubmissions
                }
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center">
              <CheckCircle2 className="text-cyan-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SECOND ROW */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ====================================================== */}
        {/* TOP STUDENTS */}
        {/* ====================================================== */}

        <div className="xl:col-span-2 bg-white rounded-[35px] shadow-sm border border-slate-200 p-7">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                Student Performance
              </h2>

              <p className="text-slate-500 mt-1">
                Top performing students
              </p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Trophy className="text-indigo-600" />
            </div>
          </div>

          <div className="space-y-5">

            {dashboard.topStudents
              .length === 0 ? (
                <div className="text-center py-14">
                  <Activity
                    size={60}
                    className="mx-auto text-slate-300 mb-4"
                  />

                  <h3 className="text-xl font-bold text-slate-700">
                    No Student Data
                  </h3>
                </div>
              ) : (
                dashboard.topStudents.map(
                  (
                    student,
                    index
                  ) => (
                    <div
                      key={
                        student.id
                      }
                      className="bg-slate-50 border border-slate-200 rounded-[28px] p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">

                        {/* LEFT */}

                        <div className="flex items-center gap-5">

                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-black">
                            {(
                              student.name ||
                              "S"
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <h3 className="text-xl font-black text-slate-800">
                              {
                                student.name
                              }
                            </h3>

                            <p className="text-slate-500 text-sm mt-1">
                              {
                                student.email
                              }
                            </p>
                          </div>
                        </div>

                        {/* RIGHT */}

                        <div className="text-right">
                          <h2 className="text-3xl font-black text-green-600">
                            {
                              student.avg_score
                            }
                            %
                          </h2>

                          <p className="text-sm text-slate-500 mt-1">
                            Avg Score
                          </p>
                        </div>
                      </div>

                      {/* PROGRESS */}

                      <div className="mt-5">
                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
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
        {/* RIGHT SIDE */}
        {/* ====================================================== */}

        <div className="space-y-8">

          {/* PENDING */}

          <div className="bg-white rounded-[35px] shadow-sm border border-slate-200 p-7">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500">
                  Pending Reviews
                </p>

                <h2 className="text-5xl font-black text-yellow-500 mt-3">
                  {
                    dashboard.pendingSubmissions
                  }
                </h2>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">
                <Clock3 className="text-yellow-600" />
              </div>
            </div>
          </div>

          {/* UPCOMING EXAMS

          <div className="bg-white rounded-[35px] shadow-sm border border-slate-200 p-7">

            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="text-2xl font-black text-slate-800">
                  Upcoming Exams
                </h2>

                <p className="text-slate-500 mt-1">
                  Scheduled exams list
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center">
                <CalendarDays className="text-pink-600" />
              </div>
            </div>

            <div className="space-y-4">

              {dashboard.upcomingExams
                .length === 0 ? (
                  <div className="text-center py-10">
                    <CalendarDays
                      size={50}
                      className="mx-auto text-slate-300 mb-4"
                    />

                    <h3 className="font-bold text-slate-700">
                      No Upcoming Exams
                    </h3>
                  </div>
                ) : (
                  dashboard.upcomingExams.map(
                    (exam) => (
                      <div
                        key={exam.id}
                        className="border border-slate-200 rounded-2xl p-5 bg-slate-50"
                      >
                        <h3 className="text-lg font-black text-slate-800">
                          {exam.title}
                        </h3>

                        <p className="text-slate-500 text-sm mt-2">
                          {exam.description ||
                            "No description"}
                        </p>

                        <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                          <CalendarDays size={16} />

                          {exam.exam_date
                            ? new Date(
                                exam.exam_date
                              ).toLocaleDateString()
                            : "Date not available"}
                        </div>
                      </div>
                    )
                  )
                )}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}