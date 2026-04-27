"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/student/exams");

        if (!res.ok) {
          throw new Error("API not found");
        }

        const data = await res.json();

        console.log("📦 Exams API:", data);

        // ✅ Ensure it's always an array
        setExams(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Fetch exams error:", err);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // 🚀 Start Exam Handler (SAFE)
  const handleStartExam = (exam: any) => {
    console.log("🚀 Exam clicked:", exam);

    if (!exam?.id) {
      alert("❌ Exam ID missing");
      return;
    }

    router.push(`/student/exams/${exam.id}`);
  };

  // ⏳ Loading UI
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500 animate-pulse">Loading exams...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📝 Available Exams</h1>

      {/* ❌ Empty State */}
      {exams.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">No exams available</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam: any) => (
            <div
              key={exam.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold">
                {exam.title || "Untitled Exam"}
              </h2>

              <p className="text-gray-600 mt-2 text-sm">
                {exam.description || "No description"}
              </p>

              {/* 🔥 DEBUG INFO (optional remove later) */}
              <p className="text-xs text-gray-400 mt-2">
                ID: {exam.id}
              </p>

              <button
                onClick={() => handleStartExam(exam)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Start Exam
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}