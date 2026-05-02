"use client";

import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ Replace with logged-in user later
  const studentId = "9a66d6ad-9cfd-46f9-9e86-4c6e621d203f";

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `/api/student/results?student_id=${studentId}`
        );

        const result = await res.json();

        if (!res.ok) throw new Error(result.error);

        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  if (!data.length) {
    return <p className="p-6">No results found</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      {data.map((submission) => (
        <div key={submission.id} className="bg-white p-5 rounded-xl shadow">
          {/* HEADER */}
          <h2 className="text-xl font-bold">
            📄 {submission.exams?.title}
          </h2>

          <p className="text-sm text-gray-500">
            Status: {submission.status}
          </p>

          <p className="text-sm text-gray-700">
            Total Score: {submission.total_score ?? "Not evaluated"}
          </p>

          {/* ANSWERS */}
          <div className="mt-4 space-y-3">
            {submission.submission_answers.map((a: any, i: number) => (
              <div key={a.id} className="border p-3 rounded-lg">
                <p className="font-medium">
                  Q{i + 1}: {a.questions?.question}
                </p>

                <p className="text-gray-700">
                  📝 {a.answer}
                </p>

                <p className="mt-2 text-blue-600">
                  {a.score === null || a.score === undefined ? (
                    <span className="text-yellow-600">⏳ Pending</span>
                  ) : (
                    <>⭐ {a.score} / {a.questions?.marks}</>
                  )}
                </p>

                <p className="text-sm text-gray-500">
                  💬 {a.feedback || "No feedback"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}