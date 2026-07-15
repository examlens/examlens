"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MCQResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/mcq/results/${id}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  async function approve() {
    await fetch(`/api/admin/mcq/results/${id}/approve`, { method: "PATCH" });
    router.push("/admin/mcq/results");
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (!data?.submission) return <p className="p-6">Result not found.</p>;

  const { submission, breakdown } = data;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-1">{submission.exam_title}</h1>
      <p className="text-gray-500 mb-4">{submission.student_email}</p>
      <p className="mb-6 font-medium">
        Score: {submission.score} / {submission.total_marks}
      </p>

      <div className="space-y-4 mb-6">
        {breakdown.map((b: any, idx: number) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${b.is_correct ? "border-green-300" : "border-red-300"}`}
          >
            <p className="font-medium mb-2">
              {idx + 1}. {b.question_text}
            </p>
            {(["a", "b", "c", "d"] as const).map((opt) => (
              <p
                key={opt}
                className={`text-sm ${
                  opt === b.correct_option
                    ? "text-green-600 font-medium"
                    : opt === b.student_answer
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {opt.toUpperCase()}) {b.options[opt]}
                {opt === b.correct_option && " ✓ correct"}
                {opt === b.student_answer && opt !== b.correct_option && " ✗ student's answer"}
              </p>
            ))}
          </div>
        ))}
      </div>

      {submission.status === "evaluated" && (
        <button className="bg-amber-600 text-white px-6 py-2 rounded-lg" onClick={approve}>
          Approve this result
        </button>
      )}
    </div>
  );
}