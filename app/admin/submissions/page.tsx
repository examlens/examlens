"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSubmissions() {
  const [subjects, setSubjects] =
    useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then((res) => res.json())
      .then((data) => {
        setSubjects(data || []);
      });
  }, []);

  return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
    <div className="max-w-7xl mx-auto">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">

        <div>
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Admin Dashboard
          </div>

          <h1 className="text-5xl font-black text-slate-900 leading-tight">
            Subject Submissions
          </h1>

          <p className="text-slate-500 mt-4 text-lg max-w-2xl leading-relaxed">
            Review student performance, monitor exam activity,
            and manage all submissions from a single dashboard.
          </p>
        </div>

        <div className="bg-white border border-orange-100 shadow-lg rounded-3xl px-6 py-5 min-w-[220px]">
          <p className="text-slate-500 text-sm font-medium">
            Total Exams
          </p>

          <div className="flex items-end gap-2 mt-2">
            <h2 className="text-4xl font-black text-orange-500">
              {subjects.length}
            </h2>

            <span className="text-slate-400 text-sm mb-1">
              Active Records
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* EMPTY STATE */}
      {/* ===================================================== */}

      {subjects.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-[32px] shadow-xl p-14 text-center">

          <div className="mx-auto w-24 h-24 rounded-[28px] bg-orange-100 flex items-center justify-center text-5xl shadow-inner">
            📭
          </div>

          <h2 className="text-3xl font-black text-slate-800 mt-8">
            No Submissions Yet
          </h2>

          <p className="text-slate-500 mt-4 text-lg max-w-md mx-auto leading-relaxed">
            Once students begin submitting their exams,
            all submission records will appear here.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 px-5 py-3 rounded-2xl font-semibold">
            Waiting for student activity...
          </div>
        </div>
      ) : (

        /* ===================================================== */
        /* GRID */
        /* ===================================================== */

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">

          {subjects.map((s: any) => (
            <div
              key={s.exam_id}
              onClick={() =>
                router.push(
                  `/admin/submissions/exam/${s.exam_id}`
                )
              }
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
                duration-300
                cursor-pointer
              "
            >

              {/* TOP GLOW */}

              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400"></div>

              {/* CONTENT */}

              <div className="p-7">

                {/* TITLE */}

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold mb-4">
                      EXAM
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">
                      {s.exam_title}
                    </h2>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl shadow-inner">
                    📝
                  </div>
                </div>

                {/* DESCRIPTION */}

                <p className="text-slate-500 mt-5 leading-relaxed line-clamp-3 text-[15px] min-h-[72px]">
                  {s.description}
                </p>

                {/* STATS */}

                <div className="grid grid-cols-2 gap-4 mt-8">

                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">

                    <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">
                      Duration
                    </p>

                    <div className="flex items-end gap-1 mt-2">
                      <h3 className="text-3xl font-black text-slate-900">
                        {s.duration}
                      </h3>

                      <span className="text-slate-500 text-sm mb-1">
                        mins
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-100 rounded-2xl p-4">

                    <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">
                      Submissions
                    </p>

                    <div className="flex items-end gap-1 mt-2">
                      <h3 className="text-3xl font-black text-green-600">
                        {s.submission_count}
                      </h3>

                      <span className="text-slate-500 text-sm mb-1">
                        students
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="mt-8 flex items-center justify-between">

                  <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Active
                  </div>

                  <button
                    className="
                      bg-orange-500
                      hover:bg-orange-600
                      text-white
                      px-5
                      py-3
                      rounded-2xl
                      font-bold
                      shadow-lg
                      shadow-orange-200
                      transition-all
                      duration-300
                      group-hover:scale-105
                    "
                  >
                    View Students →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
}