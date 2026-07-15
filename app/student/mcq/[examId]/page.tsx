"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

type Question = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

export default function MCQAttemptPage() {
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submitExam = useCallback(async () => {
    if (submitting || submitted) return;
    setSubmitting(true);

    const res = await fetch(`/api/student/mcq/${examId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || "Submission failed");
    }
    setSubmitting(false);
  }, [answers, examId, submitting, submitted]);

  useEffect(() => {
    async function init() {
      // 1. Start or resume attempt
      const startRes = await fetch(`/api/student/mcq/${examId}/start`, { method: "POST" });
      const startData = await startRes.json();

      if (!startRes.ok) {
        setError(startData.error || "Could not start exam");
        setLoading(false);
        return;
      }

      // If already submitted previously (edge case), don't allow re-entry
      if (startData.submission.status !== "in_progress") {
        setError("You have already attempted this exam.");
        setLoading(false);
        return;
      }

      // 2. Load questions
      const qRes = await fetch(`/api/student/mcq/${examId}/questions`);
      const qData = await qRes.json();

      if (!qRes.ok) {
        setError(qData.error || "Could not load questions");
        setLoading(false);
        return;
      }

      setExam(qData.exam);
      setQuestions(qData.questions);

      // Restore prior answers if resuming
      if (startData.submission.answers) {
        setAnswers(startData.submission.answers);
      }

      // 3. Compute time remaining based on started_at + duration
      const startedAt = new Date(startData.submission.started_at).getTime();
      const durationMs = qData.exam.duration_min * 60 * 1000;
      const elapsed = Date.now() - startedAt;
      const remainingSec = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
      setTimeLeft(remainingSec);

      setLoading(false);
    }

    init();
  }, [examId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || submitted) return;

    if (timeLeft <= 0) {
      submitExam(); // time-over: auto-submit
      return;
    }

    const timer = setTimeout(() => setTimeLeft((t) => (t !== null ? t - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitted, submitExam]);

  function selectAnswer(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  if (loading) return <p className="p-6">Loading exam...</p>;

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button className="text-amber-600" onClick={() => router.push("/student/mcq")}>
          Back to exam list
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-2">Exam submitted</h2>
        <p className="text-gray-600 mb-4">
          Your answers have been recorded. Your score will be visible once approved by the admin.
        </p>
        <button
          className="bg-amber-600 text-white px-6 py-2 rounded-lg"
          onClick={() => router.push("/student/mcq")}
        >
          Back to exam list
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="p-6 max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-3 border-b z-10">
        <h1 className="text-xl font-semibold">{exam.title}</h1>
        <div className="text-right">
          <p className={`text-lg font-mono ${timeLeft !== null && timeLeft < 60 ? "text-red-600" : ""}`}>
            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
          </p>
          <p className="text-xs text-gray-500">
            {answeredCount}/{questions.length} answered
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="border rounded-lg p-4">
            <p className="font-medium mb-3">
              {idx + 1}. {q.question_text}
            </p>
            <div className="space-y-2">
              {(["a", "b", "c", "d"] as const).map((opt) => {
                const optionText = q[`option_${opt}` as keyof Question] as string;
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${
                      answers[q.id] === opt ? "border-amber-500 bg-amber-50" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === opt}
                      onChange={() => selectAnswer(q.id, opt)}
                    />
                    <span>{optionText}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-center">
        <button
          onClick={submitExam}
          disabled={submitting}
          className="bg-amber-600 text-white px-8 py-3 rounded-lg disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Exam"}
        </button>
      </div>
    </div>
  );
}