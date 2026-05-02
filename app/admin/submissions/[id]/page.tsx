"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EvaluatePage() {
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const submissionId = typeof id === "string" ? id : null;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  // 🔄 Fetch submission
  const fetchData = async (sid: string) => {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/submission/${sid}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to fetch submission");
      }

      setData(result);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!submissionId) {
      setLoading(false);
      return;
    }

    fetchData(submissionId);
  }, [submissionId]);

  // 🤖 NEW EVALUATE (FILE BASED)
  const handleEvaluate = async () => {
    if (!submissionId) {
      alert("Invalid submission");
      return;
    }

    try {
      setEvaluating(true);

      console.log("🚀 Calling evaluate API with:", submissionId);

      const res = await fetch("/api/admin/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_id: submissionId,
        }),
      });

      const data = await res.json();

      console.log("✅ API RESPONSE:", data);

      if (!res.ok) throw new Error(data.error);

      alert("✅ Evaluation completed");

      fetchData(submissionId);
    } catch (err: any) {
      console.error("❌ EVALUATE ERROR:", err);
      alert(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  // ⏳ Loading
  if (loading) return <p className="p-6">Loading...</p>;

  if (!submissionId) {
    return (
      <p className="p-6 text-red-500">
        ❌ Submission ID missing in URL
      </p>
    );
  }

  if (!data) {
    return (
      <p className="p-6 text-red-500">
        No submission found or API error
      </p>
    );
  }

  // 👤 Student name
  const studentName = (() => {
    const u = data?.users;

    if (!u) return "Unknown";
    if (Array.isArray(u)) return u[0]?.name || "Unknown";
    if (typeof u === "object") return (u as any)?.name || "Unknown";

    return data?.student_name || "Unknown";
  })();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h1 className="text-2xl font-bold">
          📄 {data?.exams?.title || "Exam"}
        </h1>

        <p className="text-gray-600 mt-1">
          👤 Student: {studentName}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Status: {data?.status || "pending"}
        </p>

        <p className="text-sm text-gray-500">
          Total Score: {data?.total_score ?? "Not evaluated"}
        </p>

        {/* 📂 VIEW SUBMITTED FILE */}
        {data?.answer_file_url && (
          <div className="mt-4 bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-2">📄 Student Answer File</h2>

            {data.answer_file_url.endsWith(".pdf") ? (
              <iframe
                src={data.answer_file_url}
                className="w-full h-[500px] border rounded"
              />
            ) : (
              <img
                src={data.answer_file_url}
                alt="Answer"
                className="w-full max-h-[500px] object-contain rounded"
              />
            )}
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          This submission uses handwritten answers. Click "Auto Evaluate"
          to extract text and score automatically.
        </p>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleEvaluate}
        disabled={evaluating}
        className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg"
      >
        {evaluating ? "⏳ Evaluating..." : "🤖 Auto Evaluate"}
      </button>
    </div>
  );
}