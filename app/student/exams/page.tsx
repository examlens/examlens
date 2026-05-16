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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* HEADER */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📝</span>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Available Exams
            </h1>

            <p className="text-slate-500 mt-1 text-lg">
              Attend your assigned exams and track your performance.
            </p>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {exams.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-12 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-5xl mb-6">
            📄
          </div>

          <h2 className="text-2xl font-bold text-slate-700">
            No Exams Available
          </h2>

          <p className="text-slate-500 mt-3 max-w-md mx-auto">
            Your teacher hasn’t assigned any exams yet.
            Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
          {exams.map((exam: any) => (
            <div
              key={exam.id}
              className="
              group
              relative
              overflow-hidden
              rounded-3xl
              bg-white/70
              backdrop-blur-xl
              border border-white/40
              shadow-xl
              hover:shadow-2xl
              hover:-translate-y-2
              transition-all
              duration-300
            "
            >
              {/* TOP GLOW */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition duration-500" />

              {/* CONTENT */}
              <div className="relative p-6">
                {/* HEADER */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg text-white text-2xl">
                      📘
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 line-clamp-1">
                        {exam.title || "Untitled Exam"}
                      </h2>

                      <p className="text-slate-400 text-sm mt-1">
                        Exam Portal
                      </p>
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${exam.is_completed
                        ? "bg-gray-200 text-gray-700"
                        : "bg-green-100 text-green-700"
                      }`}
                  >
                    {exam.is_completed ? "Completed" : "Active"}
                  </div>
                </div>

                  {/* DESCRIPTION */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5">
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                      {exam.description ||
                        "No description available for this exam."}
                    </p>
                  </div>

                  {/* EXAM INFO */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <p className="text-xs text-blue-500 font-medium mb-1">
                        Duration
                      </p>

                      <h3 className="text-lg font-bold text-blue-700">
                        {exam.duration || 10} mins
                      </h3>
                    </div>

                    {/* <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                  <p className="text-xs text-indigo-500 font-medium mb-1">
                    Questions
                  </p>

                  <h3 className="text-lg font-bold text-indigo-700">
                    {exam.question_count || 0}
                  </h3>
                </div> */}
                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-400 truncate max-w-[120px]">
                      ID: {exam.id}
                    </div>

                    <button
                      onClick={() => handleStartExam(exam)}
                      className="
                    relative
                    overflow-hidden
                    px-5
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    text-white
                    font-semibold
                    shadow-lg
                    hover:shadow-blue-300/50
                    hover:scale-105
                    active:scale-95
                    transition-all
                    duration-300
                  "
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Start Exam
                        <span>🚀</span>
                      </span>

                      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition" />
                    </button>
                  </div>
                </div>
              </div>
        ))}
            </div>
          )}
        </div>
      );
}