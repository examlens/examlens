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
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
    {/* HEADER */}
    <div className="mb-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-slate-800 tracking-tight">
              Available Exams
            </h1>
            <p className="text-slate-600 mt-3 text-xl">
              Choose an exam to begin. Good luck!
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-sm text-slate-500">Total Available</div>
            <div className="text-4xl font-semibold text-orange-600">{exams.length}</div>
          </div>
        </div>
      </div>
    </div>

    {/* EMPTY STATE */}
    {exams.length === 0 ? (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-12 text-center border border-orange-100">
        <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">📋</span>
        </div>
        <h2 className="text-2xl font-semibold text-slate-700">No Exams Available</h2>
        <p className="text-slate-500 mt-3">
          Your instructor hasn’t assigned any exams yet. Please check back later.
        </p>
      </div>
    ) : (
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {exams.map((exam: any) => (
            <div
              key={exam.id}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-orange-100 hover:border-orange-200 overflow-hidden transition-all duration-300 flex flex-col"
            >
              {/* Top Accent Bar */}
              <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500" />

              <div className="p-8 flex-1 flex flex-col">
                {/* Title */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {exam.title || "Untitled Exam"}
                  </h2>
                </div>

                {/* Description */}
                <div className="flex-1 mb-8">
                  <p className="text-slate-600 leading-relaxed line-clamp-4 text-[15px]">
                    {exam.description || "No description provided for this exam."}
                  </p>
                </div>

                {/* Duration */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest font-semibold text-orange-600">Duration</p>
                      <p className="text-3xl font-bold text-orange-700 mt-1">
                        {exam.duration || 10} <span className="text-xl font-medium">mins</span>
                      </p>
                    </div>
                    <div className="text-5xl text-orange-200 group-hover:text-orange-300 transition-colors">⏱</div>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={() => handleStartExam(exam)}
                  className="mt-auto w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-200 flex items-center justify-center gap-3 group-hover:scale-[1.02]"
                >
                  Start Exam
                  <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
}