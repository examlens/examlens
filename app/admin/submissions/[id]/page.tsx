"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EvaluatePage() {
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const submissionId =
    typeof id === "string" ? id : null;

  const [data, setData] = useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [evaluating, setEvaluating] =
    useState(false);

  // ==================================================
  // ✅ FETCH SUBMISSION
  // ==================================================

  const fetchData = async (sid: string) => {
    try {
      setLoading(true);

      console.log(
        "📦 Fetching submission:",
        sid
      );

      const res = await fetch(
        `/api/admin/submission/${sid}`
      );

      const result = await res.json();

      console.log(
        "📦 Submission Data:",
        result
      );

      if (!res.ok) {
        throw new Error(
          result?.error ||
            "Failed to fetch submission"
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "❌ Fetch error:",
        err
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // ✅ INITIAL LOAD
  // ==================================================

  useEffect(() => {
    if (!submissionId) {
      setLoading(false);
      return;
    }

    fetchData(submissionId);
  }, [submissionId]);

  // ==================================================
  // ✅ AUTO EVALUATE
  // ==================================================

  const handleEvaluate = async () => {
    if (!submissionId) {
      alert("Invalid submission");
      return;
    }

    try {
      setEvaluating(true);

      console.log(
        "🚀 Evaluating:",
        submissionId
      );

      const res = await fetch(
        "/api/admin/evaluate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            submission_id: submissionId,
          }),
        }
      );

      const result = await res.json();

      console.log(
        "🤖 Evaluation Result:",
        result
      );

      if (!res.ok) {
        throw new Error(
          result?.error ||
            "Evaluation failed"
        );
      }

      alert(
        `✅ Evaluation Completed

Marks: ${result?.result?.marks}/${result?.result?.total_marks}`
      );

      // 🔄 REFRESH DATA
      await fetchData(submissionId);
    } catch (err: any) {
      console.error(
        "❌ Evaluation Error:",
        err
      );

      alert(
        err?.message ||
          "Evaluation failed"
      );
    } finally {
      setEvaluating(false);
    }
  };

  // ==================================================
  // ⏳ LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white px-6 py-4 rounded-xl shadow">
          <p className="text-gray-600 animate-pulse">
            Loading submission...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // ❌ INVALID ID
  // ==================================================

  if (!submissionId) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-600 p-4 rounded-xl">
          ❌ Submission ID missing in URL
        </div>
      </div>
    );
  }

  // ==================================================
  // ❌ NO DATA
  // ==================================================

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-600 p-4 rounded-xl">
          ❌ No submission found
        </div>
      </div>
    );
  }

  // ==================================================
  // ✅ STUDENT NAME
  // ==================================================

  const studentName = (() => {
    const u = data?.users;

    if (!u) return "Unknown";

    if (Array.isArray(u)) {
      return u[0]?.name || "Unknown";
    }

    if (typeof u === "object") {
      return (
        (u as any)?.name || "Unknown"
      );
    }

    return (
      data?.student_name || "Unknown"
    );
  })();

  // ==================================================
  // ✅ FILE URL FIX
  // ==================================================

  let fileUrl =
    data?.answer_file_url || "";

  // 🔥 HANDLE STORAGE PATH ONLY
  if (
    fileUrl &&
    !fileUrl.startsWith("http")
  ) {
    fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/exam-answers/${fileUrl}`;
  }

  // 🔥 REMOVE CACHE
  if (fileUrl) {
    fileUrl = `${fileUrl}?t=${Date.now()}`;
  }

  // ==================================================
  // ✅ FILE TYPE
  // ==================================================

  const isPDF =
    fileUrl
      .toLowerCase()
      .includes(".pdf");

  const feedback =
    data?.feedback || "";

  const totalScore =
    data?.total_score;

  const examTitle =
    data?.exams?.title || "Exam";

  const maxMarks =
    data?.max_marks ||
    data?.exams?.total_marks ||
    100;

  // ==================================================
  // ✅ UI
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0d426a]">
              📄 {examTitle}
            </h1>

            <p className="text-gray-600 mt-2">
              👤 Student:{" "}
              <span className="font-semibold">
                {studentName}
              </span>
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Submission Status:{" "}
              <span className="font-medium capitalize">
                {data?.status ||
                  "pending"}
              </span>
            </p>
          </div>

          {/* SCORE CARD */}

          <div className="bg-gradient-to-r from-[#0d426a] to-[#00a0dc] text-white px-6 py-4 rounded-2xl shadow min-w-[220px]">
            <p className="text-sm opacity-90">
              Evaluation Score
            </p>

            <h2 className="text-4xl font-bold mt-1">
              {totalScore ??
                "Not Evaluated"}
            </h2>

            <p className="text-sm mt-1">
              {/* Out of {maxMarks} */}
            </p>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* ANSWER FILE */}
      {/* ================================================== */}

      <div className="mt-6 bg-white rounded-2xl shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#0d426a]">
            📂 Student Answer Sheet
          </h2>

          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              className="bg-[#0d426a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#08314d]"
            >
              Open File
            </a>
          )}
        </div>

        {!fileUrl ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl">
            ❌ No answer file uploaded
          </div>
        ) : isPDF ? (
          <iframe
            src={fileUrl}
            className="w-full h-[700px] border rounded-xl"
          />
        ) : (
          <div className="w-full flex justify-center bg-gray-50 rounded-xl border p-4">
            <img
              src={fileUrl}
              alt="Answer Sheet"
              className="max-w-full max-h-[900px] object-contain rounded-xl"
              onError={(e) => {
                console.error(
                  "❌ Image load failed:",
                  fileUrl
                );

                (
                  e.target as HTMLImageElement
                ).src =
                  "https://placehold.co/600x400?text=Image+Not+Found";
              }}
            />
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* REFERENCE NOTES */}
      {/* ================================================== */}

      <div className="mt-6 bg-white rounded-2xl shadow p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-[#0d426a] mb-4">
          📘 Reference Notes
        </h2>

        {data?.exams
          ?.reference_file_url ? (
          <a
            href={
              data?.exams
                ?.reference_file_url
            }
            target="_blank"
            className="text-blue-600 underline"
          >
            Open Reference Notes
          </a>
        ) : (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl">
            ⚠️ Admin did not upload
            reference notes for this
            exam.
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* FEEDBACK */}
      {/* ================================================== */}

      <div className="mt-6 bg-white rounded-2xl shadow p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-[#0d426a] mb-4">
          📝 AI Feedback
        </h2>

        {feedback ? (
          <div className="bg-gray-50 border rounded-xl p-4 whitespace-pre-wrap text-gray-700 leading-relaxed">
            {feedback}
          </div>
        ) : (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl">
            No feedback generated yet.
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* ACTION PANEL */}
      {/* ================================================== */}

      <div className="mt-6 bg-white rounded-2xl shadow p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-[#0d426a] mb-3">
          🤖 AI Evaluation
        </h2>

        <p className="text-gray-600 text-sm leading-relaxed">
          Click the button below to
          evaluate the uploaded answer
          sheet using AI. The system
          will analyze the answers,
          compare them with the
          reference notes uploaded by
          the admin, assign marks based
          on the total exam marks, and
          generate teacher feedback
          automatically.
        </p>

        <button
          onClick={handleEvaluate}
          disabled={evaluating}
          className={`mt-5 px-6 py-3 rounded-xl text-white font-semibold transition-all ${
            evaluating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {evaluating
            ? "⏳ Evaluating..."
            : "🤖 Auto Evaluate"}
        </button>
      </div>
    </div>
  );
}