"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ExamListItem = {
  id: string;
  title: string;
  duration_min: number;
  marks_per_q: number;
  attempt_status: "not_attempted" | "in_progress" | "submitted" | "evaluated" | "approved";
  score: number | null;
  total_marks: number | null;
};

export default function StudentMCQListPage() {
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/student/mcq/exams")
      .then((res) => res.json())
      .then((data) => setExams(data.exams || []))
      .finally(() => setLoading(false));
  }, []);

  function statusLabel(status: string) {
    switch (status) {
      case "not_attempted":
        return { text: "Not attempted", color: "bg-gray-100 text-gray-600" };
      case "in_progress":
        return { text: "Resume attempt", color: "bg-amber-100 text-amber-700" };
      case "submitted":
      case "evaluated":
        return { text: "Pending approval", color: "bg-yellow-100 text-yellow-700" };
      case "approved":
        return { text: "Result available", color: "bg-green-100 text-green-700" };
      default:
        return { text: status, color: "bg-gray-100 text-gray-600" };
    }
  }

  function handleClick(exam: ExamListItem) {
    if (exam.attempt_status === "not_attempted" || exam.attempt_status === "in_progress") {
      router.push(`/student/mcq/${exam.id}`);
    } else if (exam.attempt_status === "approved") {
      router.push(`/student/mcq/${exam.id}/result`);
    }
    // submitted/evaluated: no navigation, just shows pending status
  }

  if (loading) return <p className="p-6">Loading exams...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">MCQ Tests</h1>

      {exams.length === 0 && (
        <p className="text-gray-500">No MCQ exams are available right now.</p>
      )}

      <div className="grid gap-4">
        {exams.map((exam) => {
          const label = statusLabel(exam.attempt_status);
          const clickable = ["not_attempted", "in_progress", "approved"].includes(exam.attempt_status);

          return (
            <div
              key={exam.id}
              className={`border rounded-lg p-4 flex items-center justify-between ${
                clickable ? "cursor-pointer hover:shadow-md" : ""
              }`}
              onClick={() => clickable && handleClick(exam)}
            >
              <div>
                <h2 className="font-medium text-lg">{exam.title}</h2>
                <p className="text-sm text-gray-500">
                  {exam.duration_min} min · {exam.marks_per_q} marks/question
                </p>
                {exam.attempt_status === "approved" && (
                  <p className="text-sm text-green-700 mt-1">
                    Score: {exam.score} / {exam.total_marks}
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${label.color}`}>
                {label.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}