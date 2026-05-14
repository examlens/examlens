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
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-[#0d426a] mb-6">
        📥 Subject Submissions
      </h1>

      {subjects.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow">
          No submissions found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((s: any) => (
            <div
              key={s.exam_id}
              className="bg-white rounded-2xl shadow border p-5 hover:shadow-lg transition cursor-pointer"
              onClick={() =>
                router.push(
                  `/admin/submissions/exam/${s.exam_id}`
                )
              }
            >
              <h2 className="text-2xl font-bold text-[#0d426a]">
                {s.exam_title}
              </h2>

              <p className="text-gray-500 mt-2 line-clamp-2">
                {s.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-gray-50 border rounded-xl p-3">
                  <p className="text-sm text-gray-500">
                    Duration
                  </p>

                  <p className="font-bold">
                    {s.duration} mins
                  </p>
                </div>

                <div className="bg-gray-50 border rounded-xl p-3">
                  <p className="text-sm text-gray-500">
                    Submissions
                  </p>

                  <p className="font-bold text-green-600">
                    {
                      s.submission_count
                    }
                  </p>
                </div>
              </div>

              <button className="mt-5 w-full bg-[#0d426a] text-white py-2 rounded-xl">
                View Students
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}