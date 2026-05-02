"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();

  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : null;

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // ✅ FETCH EXAM
  useEffect(() => {
    if (!id) return;

    const fetchExam = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/student/exam/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setQuestions(Array.isArray(data.questions) ? data.questions : []);

        const duration = data.duration || 10;
        setTimeLeft(duration * 60);
      } catch (err: any) {
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
      if (file) handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 📤 SUBMIT
  const handleSubmit = async () => {
    if (!file) {
      alert("❌ Please upload your answer file");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ 1. GET SESSION TOKEN (CRITICAL FIX)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token) {
        throw new Error("User not authenticated");
      }

      // ✅ 2. UPLOAD FILE
      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("exam-answers")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("exam-answers")
        .getPublicUrl(fileName);

      const fileUrl = urlData.publicUrl;

      console.log("📂 File URL:", fileUrl);

      // ✅ 3. SEND TOKEN TO BACKEND (CRITICAL FIX)
      const res = await fetch("/api/student/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`, // 🔥 IMPORTANT
        },
        body: JSON.stringify({
          exam_id: id,
          answer_file_url: fileUrl,
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

  // ❌ ERROR
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
            Write answers on paper & upload below
          </p>
        </div>

        {/* TIMER */}
        <div className="bg-black text-white px-4 py-2 rounded-lg">
          ⏳ {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {/* QUESTIONS */}
      {questions.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">
            No questions found for this exam
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {questions.map((q: any, i: number) => (
              <div
                key={q.id}
                className="bg-white p-5 rounded-xl shadow"
              >
                <div className="flex justify-between">
                  <p className="font-semibold text-lg">
                    {i + 1}. {q.question}
                  </p>

                  <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {q.marks} marks
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* FILE UPLOAD */}
          <div className="mt-6 bg-white p-5 rounded-xl shadow">
            <h2 className="font-semibold mb-3">
              📤 Upload Answer Sheet
            </h2>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
              className="w-full border p-2 rounded"
            />

            {file && (
              <p className="text-sm text-green-600 mt-2">
                ✅ {file.name}
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-6 py-3 rounded-lg text-white ${submitting
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