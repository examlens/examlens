"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Admin Submissions:", data);

        if (Array.isArray(data)) {
          setSubmissions(data);
        } else {
          setSubmissions([]);
        }
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📥 Submissions</h1>

      {submissions.length === 0 ? (
        <p>No submissions yet</p>
      ) : (
        submissions.map((s) => (
          <div
            key={s.id}
            className="border p-4 mb-3 rounded cursor-pointer hover:bg-gray-50"
            onClick={() =>
              router.push(`/admin/submissions/${s.id}`)
            }
          >
            <p><b>Exam:</b> {s.exams?.title || "Unknown"}</p>
            <p><b>Student:</b> {s.users?.name || "Unknown"}</p>
            <p><b>Status:</b> {s.status}</p>
            <p>
              <b>Score:</b>{" "}
              {s.total_score ?? "Not evaluated"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}