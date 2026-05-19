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

  // TOAST NOTIFICATION


  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // SHOW TOAST
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  };

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

      console.log(result);

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
      showToast("Invalid submission", "error");
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

      showToast(
        `✅ Evaluation Completed

Marks: ${result?.result?.marks}/${result?.result?.total_marks}`,
        "success"
      );

      // 🔄 REFRESH DATA
      await fetchData(submissionId);
    } catch (err: any) {
      console.error(
        "❌ Evaluation Error:",
        err
      );

      showToast(
        err?.message ||
        "Evaluation failed",
        "error"
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
    data?.total_marks ||
    data?.exam?.total_marks ||
    data?.exams?.total_marks ||
    0;


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ================================================== */}
        {/* TOP HEADER */}
        {/* ================================================== */}

        <div className="bg-white border border-orange-100 rounded-[32px] shadow-xl overflow-hidden">

          {/* TOP BAR */}

          <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />

          <div className="p-8">

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

              {/* LEFT */}

              <div className="flex-1">

                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-5">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  AI Exam Evaluation
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                  {examTitle}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mt-6">

                  <div className="bg-orange-50 border border-orange-100 px-5 py-3 rounded-2xl">
                    <p className="text-xs uppercase text-slate-500 font-bold tracking-wide">
                      Student
                    </p>

                    <p className="font-bold text-slate-800 mt-1">
                      {studentName}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-100 px-5 py-3 rounded-2xl">
                    <p className="text-xs uppercase text-slate-500 font-bold tracking-wide">
                      Status
                    </p>

                    <p className="font-bold text-green-600 mt-1 capitalize">
                      {data?.status || "pending"}
                    </p>
                  </div>
                </div>
              </div>

              {/* SCORE CARD */}

              <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-[30px] p-8 shadow-2xl min-w-[320px]">

                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>

                <div className="relative z-10">

                  <p className="uppercase tracking-[3px] text-sm font-semibold text-orange-100">
                    Evaluation Score
                  </p>

                  <div className="flex items-end gap-2 mt-4">
                    <h2 className="text-6xl font-black leading-none">
                      {totalScore ?? 0}
                    </h2>

                    {/* <span className="text-xl mb-2 text-orange-100">
                    / {maxMarks || 0}
                  </span> */}
                  </div>

                  <div className="mt-5 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 inline-flex items-center gap-2 text-sm font-medium">
                    AI Generated Evaluation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* MAIN GRID */}
        {/* ================================================== */}

        <div className="grid xl:grid-cols-[1.4fr_420px] gap-6 mt-6">

          {/* ================================================== */}
          {/* LEFT SIDE */}
          {/* ================================================== */}

          <div className="space-y-6">

            {/* ANSWER SHEET */}

            <div className="bg-white border border-orange-100 rounded-[30px] shadow-lg overflow-hidden">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-orange-100 bg-orange-50/50">

                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Student Answer Sheet
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Uploaded answer sheet submitted by the student
                  </p>
                </div>

                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    className="
                    bg-orange-500
                    hover:bg-orange-600
                    text-white
                    px-5
                    py-3
                    rounded-2xl
                    font-semibold
                    shadow-lg
                    shadow-orange-200
                    transition-all
                  "
                  >
                    Open File ↗
                  </a>
                )}
              </div>

              <div className="p-6">

                {!fileUrl ? (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl">
                    ❌ No answer file uploaded
                  </div>
                ) : isPDF ? (
                  <iframe
                    src={fileUrl}
                    className="w-full h-[850px] rounded-2xl border border-orange-100"
                  />
                ) : (
                  <div className="w-full flex justify-center bg-orange-50 rounded-3xl border border-orange-100 p-6">
                    <img
                      src={fileUrl}
                      alt="Answer Sheet"
                      className="max-w-full max-h-[950px] object-contain rounded-2xl shadow-lg"
                      onError={(e) => {
                        (
                          e.target as HTMLImageElement
                        ).src =
                          "https://placehold.co/600x400?text=Image+Not+Found";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* FEEDBACK */}

            <div className="bg-white border border-orange-100 rounded-[30px] shadow-lg overflow-hidden">

              <div className="p-6 border-b border-orange-100 bg-orange-50/50">

                <h2 className="text-2xl font-black text-slate-900">
                  Feedback
                </h2>

                <p className="text-slate-500 mt-1">
                  Detailed feedback generated using AI evaluation
                </p>
              </div>

              <div className="p-6">

                {feedback ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 whitespace-pre-wrap text-slate-700 leading-relaxed text-[15px]">
                    {feedback}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 p-5 rounded-2xl">
                    ⚠️ No feedback generated yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* RIGHT SIDE */}
          {/* ================================================== */}

          <div className="space-y-6">

            {/* REFERENCE NOTES */}

            <div className="bg-white border border-orange-100 rounded-[30px] shadow-lg overflow-hidden">

              <div className="p-6 border-b border-orange-100 bg-orange-50/50">

                <h2 className="text-2xl font-black text-slate-900">
                  Reference Notes
                </h2>

                <p className="text-slate-500 mt-1">
                  Notes uploaded by admin for evaluation reference
                </p>
              </div>

              <div className="p-6">

                {data?.exams?.reference_file_url ? (
                  <a
                    href={data?.exams?.reference_file_url}
                    target="_blank"
                    className="
                    flex
                    items-center
                    justify-between
                    bg-orange-500
                    hover:bg-orange-600
                    text-white
                    px-5
                    py-4
                    rounded-2xl
                    font-semibold
                    transition-all
                    shadow-lg
                    shadow-orange-200
                  "
                  >
                    Open Reference Notes
                    <span className="text-lg">↗</span>
                  </a>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 p-5 rounded-2xl">
                    ⚠️ Admin did not upload reference notes for this exam.
                  </div>
                )}
              </div>
            </div>

            {/* AI EVALUATION */}

            <div className="bg-white border border-orange-100 rounded-[30px] shadow-lg overflow-hidden">

              <div className="p-6 border-b border-orange-100 bg-orange-50/50">

                <h2 className="text-2xl font-black text-slate-900">
                  AI Evaluation
                </h2>

                <p className="text-slate-500 mt-1">
                  Automatically analyze and evaluate the answer sheet
                </p>
              </div>

              <div className="p-6">

                <div className="bg-orange-50 border border-orange-100 rounded-3xl p-5">

                  <div className="flex items-start gap-4">

                    {/* <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl shadow-lg">
                    🤖
                  </div> */}

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Smart Evaluation Engine
                      </h3>

                      <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                        AI compares the uploaded answer sheet with
                        reference materials, calculates marks based on
                        total exam marks, and generates detailed
                        teacher-style feedback automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleEvaluate}
                  disabled={evaluating}
                  className={`
                  mt-6
                  w-full
                  py-4
                  rounded-2xl
                  text-white
                  font-bold
                  text-lg
                  transition-all
                  duration-300
                  shadow-xl
                  ${evaluating
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 hover:scale-[1.02] shadow-orange-200"
                    }
                `}
                >
                  {evaluating
                    ? " Evaluating Answer Sheet..."
                    : " Start AI Evaluation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* TOAST NOTIFICATION */}

      {toast.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          {/* BACKDROP */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

          {/* TOAST CARD */}
          <div className="relative bg-white border border-orange-200 shadow-2xl rounded-2xl px-6 py-5 w-[320px] text-center animate-fadeIn">

            {/* ICON */}
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${toast.type === "success"
                ? "bg-orange-100 text-orange-500"
                : "bg-red-100 text-red-500"
              }`}>
              {toast.type === "success" ? "✔" : "✖"}
            </div>

            {/* MESSAGE */}
            <p className="text-sm font-semibold text-slate-700">
              {toast.message}
            </p>

            {/* ACCENT BAR */}
            <div className="mt-3 h-1 w-full bg-orange-500 rounded-full"></div>
          </div>
        </div>
      )}

    </div>
  );
}