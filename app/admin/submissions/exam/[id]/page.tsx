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
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-[#0d426a] mb-6">
        👨‍🎓 Student Submissions
      </h1>

      {students.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow">
          No students submitted yet
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {students.map((s: any) => (
            <div
              key={s.id}
              className="bg-white p-5 rounded-2xl shadow border"
            >
              <h2 className="text-xl font-bold">
                {s.users?.name ||
                  "Unknown"}
              </h2>

              <p className="text-gray-500 mt-1">
                {s.users?.email}
              </p>

              <div className="mt-4 flex justify-between">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {s.status}
                </span>

                <span className="font-bold text-green-600">
                  {s.total_score ??
                    "Pending"}
                </span>
              </div>

              <button
                onClick={() =>
                  router.push(
                    `/admin/submissions/${s.id}`
                  )
                }
                className="mt-5 w-full bg-[#0d426a] text-white py-2 rounded-xl"
              >
                View Submission
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}