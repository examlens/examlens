"use client";

import { useEffect, useState } from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

export default function ExamStudentsPage() {
  const params = useParams();

  const router = useRouter();

  const examId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [students, setStudents] =
    useState<any[]>([]);

  useEffect(() => {
    if (!examId) return;

    fetch(
      `/api/admin/submissions/exam/${examId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setStudents(data || []);
      });
  }, [examId]);

  return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
    <div className="max-w-7xl mx-auto">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="relative overflow-hidden bg-white border border-orange-100 rounded-[32px] shadow-xl p-8 mb-8">

        {/* BACKGROUND DECOR */}

        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3"></div>

        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          {/* LEFT */}

          <div>

            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-5">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Exam Submission Management
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              👨‍🎓 Student Submissions
            </h1>

            <p className="text-slate-500 mt-4 text-lg max-w-2xl leading-relaxed">
              Review, analyze, and manage all submitted student exam answer sheets with AI-powered evaluation insights.
            </p>
          </div>

          {/* STATS */}

          <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-[28px] px-8 py-6 shadow-2xl shadow-orange-200 min-w-[240px]">

            <p className="uppercase tracking-[3px] text-sm font-semibold text-orange-100">
              Total Submissions
            </p>

            <h2 className="text-5xl font-black mt-3">
              {students.length}
            </h2>

            <p className="mt-3 text-orange-100 text-sm">
              Student records available
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* EMPTY STATE */}
      {/* ===================================================== */}

      {students.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-[32px] shadow-xl p-16 text-center">

          <div className="mx-auto w-28 h-28 rounded-[30px] bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-5xl shadow-xl shadow-orange-200">
            📭
          </div>

          <h2 className="text-3xl font-black text-slate-900 mt-8">
            No Student Submissions Yet
          </h2>

          <p className="text-slate-500 mt-4 max-w-lg mx-auto text-lg leading-relaxed">
            Once students submit their exams, their answer sheets and evaluation details will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* ===================================================== */}
          {/* STUDENT GRID */}
          {/* ===================================================== */}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">

            {students.map((s: any) => (
              <div
                key={s.id}
                className="
                  group
                  relative
                  overflow-hidden
                  bg-white
                  border
                  border-orange-100
                  rounded-[32px]
                  shadow-lg
                  hover:shadow-2xl
                  hover:-translate-y-2
                  transition-all
                  duration-500
                "
              >

                {/* TOP GRADIENT */}

                <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400"></div>

                {/* DECOR */}

                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-30"></div>

                <div className="relative z-10 p-7">

                  {/* PROFILE */}

                  <div className="flex items-start gap-4">

                    <div className="
                      w-16
                      h-16
                      rounded-2xl
                      bg-gradient-to-br
                      from-orange-500
                      to-amber-500
                      text-white
                      flex
                      items-center
                      justify-center
                      text-2xl
                      font-black
                      shadow-lg
                      shadow-orange-200
                    ">
                      {(s.users?.name || "S")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">

                      <h2 className="text-2xl font-black text-slate-900 truncate">
                        {s.users?.name || "Unknown"}
                      </h2>

                      <p className="text-slate-500 mt-2 break-all text-sm">
                        {s.users?.email || "No email available"}
                      </p>
                    </div>
                  </div>

                  {/* STATUS + SCORE */}

                  <div className="grid grid-cols-2 gap-4 mt-7">

                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">

                      <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">
                        Status
                      </p>

                      <div className="mt-3">
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-3
                            py-1.5
                            rounded-full
                            text-sm
                            font-bold
                            ${
                              s.status === "evaluated"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          `}
                        >
                          {s.status || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4">

                      <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">
                        Score
                      </p>

                      <div className="mt-2 flex items-end gap-1">
                        <h3 className="text-3xl font-black text-green-600">
                          {s.total_score ?? "--"}
                        </h3>

                        <span className="text-slate-400 text-sm mb-1">
                          marks
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}

                  <div className="mt-7">

                    <button
                      onClick={() =>
                        router.push(
                          `/admin/submissions/${s.id}`
                        )
                      }
                      className="
                        group/button
                        w-full
                        bg-orange-500
                        hover:bg-orange-600
                        active:bg-orange-700
                        text-white
                        py-4
                        rounded-2xl
                        font-bold
                        text-lg
                        shadow-xl
                        shadow-orange-200
                        transition-all
                        duration-300
                        flex
                        items-center
                        justify-center
                        gap-3
                      "
                    >
                      View Submission

                      <span className="group-hover/button:translate-x-1 transition-transform">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
);
}