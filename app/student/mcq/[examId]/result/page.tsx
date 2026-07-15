"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StudentMCQResultPage() {
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/student/mcq/${examId}/result`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) return <p className="p-6">Loading result...</p>;

  if (!data) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <p className="text-red-600 mb-4">Could not load this result.</p>
        <button className="text-amber-600" onClick={() => router.push("/student/mcq")}>
          Back to exam list
        </button>
      </div>
    );
  }

  // Not yet approved (or not attempted / in progress)
  if (data.status !== "approved") {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-2">{data.exam_title}</h2>
        <p className="text-gray-600 mb-6">{data.message}</p>
        <button
          className="bg-amber-600 text-white px-6 py-2 rounded-lg"
          onClick={() => router.push("/student/mcq")}
        >
          Back to exam list
        </button>
      </div>
    );
  }

  const percentage = data.total_marks > 0 ? Math.round((data.score / data.total_marks) * 100) : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-1">{data.exam_title}</h1>
      <p className="text-gray-500 mb-6">
        Submitted {new Date(data.submitted_at).toLocaleString()}
      </p>

      <div className="border rounded-lg p-6 mb-8 text-center bg-amber-50">
        <p className="text-3xl font-bold text-amber-700">
          {data.score} / {data.total_marks}
        </p>
        <p className="text-gray-600 mt-1">{percentage}%</p>
      </div>

      <h2 className="text-lg font-semibold mb-3">Answer Review</h2>
      <div className="space-y-4">
        {data.breakdown.map((b: any, idx: number) => (
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
                {opt === b.correct_option && " ✓ correct answer"}
                {opt === b.student_answer && opt !== b.correct_option && " — your answer"}
              </p>
            ))}
            {b.is_correct && b.student_answer && (
              <p className="text-xs text-green-600 mt-1">Your answer was correct</p>
            )}
          </div>
        ))}
      </div>

      <button
        className="mt-8 text-amber-600"
        onClick={() => router.push("/student/mcq")}
      >
        Back to exam list
      </button>
    </div>
  );
}