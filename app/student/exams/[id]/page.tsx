"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();

  // ✅ SAFELY extract ID
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : null;

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ⏱️ Timer
  const [timeLeft, setTimeLeft] = useState(600);

  // ✅ FETCH EXAM
  useEffect(() => {
    if (!id) return;

    const fetchExam = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("🚀 Fetching exam with ID:", id);

        const res = await fetch(`/api/student/exam/${id}`);
        const data = await res.json();

        console.log("📦 API DATA:", data);

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch exam");
        }

        setQuestions(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("❌ Fetch error:", err);
        setError(err.message);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  // ⏱️ TIMER
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(); // auto submit
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 📝 ANSWER
  const handleAnswerChange = (qid: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: value,
    }));
  };

  // ✅ SUBMIT
  const handleSubmit = async () => {
    if (questions.length === 0) return;

    const unanswered = questions.filter((q) => !answers[q.id]);

    if (unanswered.length > 0) {
      alert(`⚠️ ${unanswered.length} questions unanswered`);
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/student/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_id: id,
          answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert("✅ Exam submitted successfully!");
      router.push("/student/results");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500 animate-pulse">Loading exam...</p>
      </div>
    );
  }

  // ❌ ERROR UI
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📄 Exam</h1>
          <p className="text-gray-500 text-sm">
            Answer all questions carefully
          </p>
        </div>

        {/* TIMER */}
        <div className="bg-black text-white px-4 py-2 rounded-lg">
          ⏳ {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {/* EMPTY */}
      {questions.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">
            No questions found for this exam
          </p>
        </div>
      ) : (
        <>
          {/* QUESTIONS */}
          <div className="space-y-5">
            {questions.map((q: any, i: number) => (
              <div
                key={q.id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
              >
                <div className="flex justify-between">
                  <p className="font-semibold text-lg">
                    {i + 1}. {q.question}
                  </p>

                  <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {q.marks} marks
                  </span>
                </div>

                <textarea
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(q.id, e.target.value)
                  }
                  placeholder="Write your answer..."
                  className="w-full mt-4 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="mt-8 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Answered: {Object.keys(answers).length} /{" "}
              {questions.length}
            </p>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-6 py-3 rounded-lg text-white ${
                submitting
                  ? "bg-gray-400"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Exam"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}