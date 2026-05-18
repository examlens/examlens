"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

interface Question {
  id: string;
  question: string;
  marks: number;
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();

  const examId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [examTitle, setExamTitle] =
    useState("Exam");

  const [
    alreadySubmitted,
    setAlreadySubmitted,
  ] = useState(false);

  const [timeOver, setTimeOver] =
    useState(false);

  // =====================================================
  // ✅ FETCH EXAM
  // =====================================================

  useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
      try {
        setLoading(true);

        setError("");

        // ✅ GET SESSION
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error(
            "Please login again"
          );
        }

        // ✅ FETCH EXAM API
        const res = await fetch(
          `/api/student/exam/${examId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const data = await res.json();

        console.log(
          "📦 Exam API:",
          data
        );

        // =====================================================
        // ✅ ALREADY ATTEMPTED
        // =====================================================

        if (
          data?.already_attempted ===
          true
        ) {
          setAlreadySubmitted(true);

          setError(
            "You already attempted this exam"
          );

          return;
        }

        // =====================================================
        // ✅ TIME OVER FROM API
        // =====================================================

        if (
          data?.time_over === true
        ) {
          setTimeOver(true);

          setError(
            "Exam time is already over"
          );

          return;
        }

        // =====================================================
        // ✅ API ERROR
        // =====================================================

        if (!res.ok) {
          throw new Error(
            data.error ||
            "Failed to load exam"
          );
        }

        // =====================================================
        // ✅ SET EXAM DATA
        // =====================================================

        setExamTitle(
          data.title || "Exam"
        );

        setQuestions(
          Array.isArray(
            data.questions
          )
            ? data.questions
            : []
        );

        // =====================================================
        // ✅ CALCULATE TIMER CORRECTLY
        // =====================================================

        const remainingSeconds = Number(
          data.remaining_seconds || 0
        );

        setTimeLeft(remainingSeconds);

        if (remainingSeconds <= 0) {
          setTimeOver(true);
        }

        console.log(
          "⏳ Remaining Seconds:",
          remainingSeconds
        );

        // =====================================================
        // ✅ HANDLE TIME OVER
        // =====================================================

        if (
          remainingSeconds <= 0
        ) {
          setTimeLeft(0);

          setTimeOver(true);

          return;
        }

        // ✅ START TIMER
        setTimeLeft(
          remainingSeconds
        );
      } catch (err: any) {
        console.error(
          "❌ FETCH EXAM ERROR:",
          err
        );

        setError(
          err.message ||
          "Failed to fetch exam"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  // =====================================================
  // ✅ TIMER COUNTDOWN
  // =====================================================

  useEffect(() => {
    if (
      loading ||
      timeOver ||
      timeLeft <= 0
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        setTimeLeft((prev) => {
          // ✅ STOP EXACTLY AT ZERO
          if (prev <= 1) {
            clearInterval(interval);

            setTimeOver(true);

            return 0;
          }

          return prev - 1;
        });
      }, 1000);

    return () =>
      clearInterval(interval);
  }, [
    loading,
    timeOver,
    timeLeft,
  ]);

  // =====================================================
  // ✅ FORMAT TIME
  // =====================================================

  const formatTime = (
    seconds: number
  ) => {
    const mins = Math.floor(
      seconds / 60
    );

    const secs = seconds % 60;

    return `${mins}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // =====================================================
  // ✅ SUBMIT EXAM
  // =====================================================

  const handleSubmit =
    async () => {
      try {
        // ✅ BLOCK AFTER TIME OVER
        if (timeOver) {
          alert(
            "⛔ Time is over. Submission closed."
          );

          return;
        }

        // ✅ FILE REQUIRED
        if (!file) {
          alert(
            "❌ Please upload your answer file"
          );

          return;
        }

        setSubmitting(true);

        // ✅ GET SESSION
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (
          !session?.access_token
        ) {
          throw new Error(
            "User not authenticated"
          );
        }

        // =====================================================
        // ✅ FILE NAME
        // =====================================================

        const fileName = `${Date.now()}-${file.name
          }`;

        // =====================================================
        // ✅ UPLOAD FILE
        // =====================================================

        const {
          error: uploadError,
        } =
          await supabase.storage
            .from(
              "exam-answers"
            )
            .upload(
              fileName,
              file,
              {
                upsert: true,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        // =====================================================
        // ✅ GET PUBLIC URL
        // =====================================================

        const {
          data: urlData,
        } = supabase.storage
          .from(
            "exam-answers"
          )
          .getPublicUrl(
            fileName
          );

        const fileUrl =
          urlData.publicUrl;

        console.log(
          "📂 Uploaded File:",
          fileUrl
        );

        // =====================================================
        // ✅ SUBMIT TO API
        // =====================================================

        const res = await fetch(
          "/api/student/submit",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${session.access_token}`,
            },

            body: JSON.stringify(
              {
                exam_id: examId,

                answer_file_url:
                  fileUrl,
              }
            ),
          }
        );

        const data =
          await res.json();

        console.log(
          "📦 Submit Response:",
          data
        );

        if (!res.ok) {
          throw new Error(
            data.error ||
            "Submission failed"
          );
        }

        alert(
          "✅ Exam submitted successfully"
        );

        router.push(
          "/student/results"
        );
      } catch (err: any) {
        console.error(
          "❌ SUBMIT ERROR:",
          err
        );

        alert(
          err.message ||
          "Submission failed"
        );
      } finally {
        setSubmitting(false);
      }
    };

  // =====================================================
// ✅ LOADING UI
// =====================================================

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 p-6">

      <div className="bg-white/90 backdrop-blur-xl border border-orange-100 rounded-[32px] shadow-2xl px-12 py-10 text-center">

        <div className="w-16 h-16 mx-auto rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mb-6" />

        <h2 className="text-2xl font-black text-slate-800">
          Loading Exam
        </h2>

        <p className="text-slate-500 mt-3">
          Preparing your exam environment...
        </p>
      </div>
    </div>
  );
}

// =====================================================
// ✅ ALREADY ATTEMPTED UI
// =====================================================

if (alreadySubmitted) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 p-6">

      <div className="relative overflow-hidden bg-white border border-orange-100 rounded-[36px] shadow-2xl p-10 max-w-lg w-full text-center">

        <div className="absolute top-0 right-0 w-56 h-56 bg-orange-200/30 rounded-full blur-3xl" />

        <div className="relative z-10">

          <div className="w-24 h-24 mx-auto rounded-[28px] bg-orange-100 flex items-center justify-center text-5xl mb-6">
            ⚠️
          </div>

          <h1 className="text-4xl font-black text-slate-800">
            Already Attempted
          </h1>

          <p className="text-slate-500 mt-4 leading-relaxed">
            You have already submitted this exam.
            Multiple attempts are not allowed.
          </p>

          <button
            onClick={() =>
              router.push("/student/exams")
            }
            className="
              mt-8
              px-8
              py-4
              rounded-2xl
              bg-orange-500
              hover:bg-orange-600
              text-white
              font-bold
              shadow-lg
              hover:shadow-orange-300/50
              transition-all
              duration-300
            "
          >
            Back to Exams
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// ✅ ERROR UI
// =====================================================

if (error && !questions.length) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 p-6">

      <div className="bg-white border border-red-100 rounded-[32px] shadow-2xl p-10 max-w-lg w-full text-center">

        <div className="w-24 h-24 mx-auto rounded-[28px] bg-red-100 flex items-center justify-center text-5xl mb-6">
          ❌
        </div>

        <h2 className="text-3xl font-black text-red-600">
          Something Went Wrong
        </h2>

        <p className="text-slate-600 mt-4 leading-relaxed">
          {error}
        </p>

        <button
          onClick={() =>
            router.push("/student/exams")
          }
          className="
            mt-8
            px-8
            py-4
            rounded-2xl
            bg-orange-500
            hover:bg-orange-600
            text-white
            font-bold
            transition-all
            duration-300
          "
        >
          Back to Exams
        </button>
      </div>
    </div>
  );
}

// =====================================================
// ✅ MAIN UI
// =====================================================

return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-5 lg:p-8">

    {/* ===================================================== */}
    {/* HEADER */}
    {/* ===================================================== */}

    <div className="relative overflow-hidden bg-black rounded-[36px] shadow-2xl mb-8">

      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />

      <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl" />

      <div className="relative z-10 p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>
          <p className="text-orange-300 text-sm font-semibold uppercase tracking-[0.25em]">
            Student Examination Portal
          </p>

          <h1 className="text-4xl font-black text-white mt-3">
            {examTitle}
          </h1>

          <p className="text-zinc-400 mt-3 text-base leading-relaxed max-w-2xl">
            Write your answers clearly on paper and upload your answer sheet
            in PDF or image format before the timer ends.
          </p>
        </div>

        {/* TIMER */}

        <div
          className={`
            px-8
            py-5
            rounded-[28px]
            text-white
            shadow-2xl
            backdrop-blur-xl
            border
            ${
              timeLeft <= 60
                ? "bg-red-600 border-red-400"
                : "bg-orange-500 border-orange-300"
            }
          `}
        >

          <p className="text-sm uppercase tracking-widest opacity-80">
            Remaining Time
          </p>

          <h2 className="text-4xl font-black mt-2">
            {formatTime(timeLeft)}
          </h2>
        </div>
      </div>
    </div>

    {/* ===================================================== */}
    {/* TIME OVER */}
    {/* ===================================================== */}

    {timeOver && (
      <div className="bg-red-100 border border-red-200 text-red-700 px-6 py-5 rounded-[24px] mb-8 shadow-sm">
        <h2 className="font-bold text-lg">
          ⛔ Time is Over
        </h2>

        <p className="mt-2 text-sm">
          Submission is now closed for this exam.
        </p>
      </div>
    )}

    {/* ===================================================== */}
    {/* QUESTIONS */}
    {/* ===================================================== */}

    {questions.length === 0 ? (
      <div className="bg-white border border-orange-100 rounded-[32px] shadow-xl p-16 text-center">

        <div className="w-24 h-24 mx-auto rounded-[28px] bg-orange-100 flex items-center justify-center text-5xl mb-6">
          📄
        </div>

        <h2 className="text-3xl font-black text-slate-800">
          No Questions Available
        </h2>

        <p className="text-slate-500 mt-4">
          No questions have been added to this exam yet.
        </p>
      </div>
    ) : (
      <>
        <div className="space-y-6">

          {questions.map((q, index) => (
            <div
              key={q.id}
              className="
                bg-white/90
                backdrop-blur-xl
                border
                border-orange-100
                rounded-[32px]
                p-7
                shadow-lg
                hover:shadow-2xl
                transition-all
                duration-300
              "
            >

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                <div className="flex-1">

                  <div className="flex items-center gap-3 mb-4">

                    <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-lg shadow-lg">
                      {index + 1}
                    </div>

                    <div>
                      <p className="text-sm text-orange-500 font-semibold uppercase tracking-wider">
                        Question
                      </p>

                      <h2 className="text-xl font-bold text-slate-800 mt-1 leading-relaxed">
                        {q.question}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-100 text-orange-700 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap h-fit">
                  {q.marks} Marks
                </div>
              </div>
            </div>
          ))}
        </div>

       {/* ===================================================== */}
{/* FILE UPLOAD */}
{/* ===================================================== */}

<div className="bg-white border border-orange-100 rounded-[36px] shadow-xl mt-8 p-8">

  {/* HEADER */}

  <div className="mb-8">
    <p className="text-sm text-orange-500 font-bold uppercase tracking-[0.25em]">
      Upload Section
    </p>

    <h2 className="text-3xl font-black text-slate-800 mt-3">
      Upload Answer Sheet
    </h2>

    <p className="text-slate-500 mt-3 text-base leading-relaxed">
      Upload your handwritten answer sheet in PDF, JPG or PNG format.
      Make sure the file is clear and readable before submitting.
    </p>
  </div>

  {/* UPLOAD BOX */}

  <label
    htmlFor="answer-upload"
    className={`
      relative
      flex
      flex-col
      items-center
      justify-center
      w-full
      min-h-[320px]
      rounded-[36px]
      border-[3px]
      border-dashed
      transition-all
      duration-300
      cursor-pointer
      overflow-hidden
      ${
        timeOver
          ? "border-slate-300 bg-slate-100 cursor-not-allowed"
          : "border-orange-300 bg-gradient-to-br from-orange-50 to-white hover:border-orange-500 hover:bg-orange-100/40"
      }
    `}
  >

    {/* GLOW */}

    <div className="absolute top-0 right-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />

    {/* CONTENT */}

    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">

      {/* ICON */}

      <div className="w-28 h-28 rounded-full bg-orange-500 text-white flex items-center justify-center text-5xl shadow-2xl mb-6">
        📄
      </div>

      <h3 className="text-2xl font-black text-slate-800">
        Click to Upload File
      </h3>

      <p className="text-slate-500 mt-3 max-w-md leading-relaxed">
        Drag & drop your answer sheet here or click anywhere inside this box
        to browse files from your device.
      </p>

      <div className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg">
        Choose File
      </div>

      <p className="text-xs text-slate-400 mt-5">
        Supported formats: PDF, JPG, JPEG, PNG
      </p>
    </div>

    {/* HIDDEN INPUT */}

    <input
      id="answer-upload"
      type="file"
      accept=".pdf,.jpg,.jpeg,.png"
      disabled={timeOver}
      onChange={(e) => {
        const selectedFile =
          e.target.files?.[0] || null;

        setFile(selectedFile);
      }}
      className="hidden"
    />
  </label>

  {/* FILE PREVIEW */}

  {file && (
    <div className="mt-6 bg-green-50 border border-green-200 rounded-[28px] p-5 flex items-center justify-between gap-4">

      <div className="flex items-center gap-4">

        <div className="w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center text-2xl shadow-lg">
          ✅
        </div>

        <div>
          <h3 className="font-bold text-green-700 text-lg">
            File Selected Successfully
          </h3>

          <p className="text-green-600 text-sm mt-1 break-all">
            {file.name}
          </p>
        </div>
      </div>

      <button
        onClick={() => setFile(null)}
        className="
          px-5
          py-2.5
          rounded-xl
          bg-red-100
          text-red-600
          font-semibold
          hover:bg-red-200
          transition-all
          duration-300
        "
      >
        Remove
      </button>
    </div>
  )}
</div>

        {/* ===================================================== */}
        {/* SUBMIT BUTTON */}
        {/* ===================================================== */}

        <div className="mt-10 flex justify-end">

          <button
            onClick={handleSubmit}
            disabled={submitting || timeOver}
            className={`
              px-10
              py-4
              rounded-[22px]
              text-lg
              font-bold
              text-white
              shadow-2xl
              transition-all
              duration-300
              ${
                submitting || timeOver
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 hover:scale-105"
              }
            `}
          >
            {timeOver
              ? "Time Over"
              : submitting
              ? "Submitting..."
              : "Submit Exam"}
          </button>
        </div>
      </>
    )}
  </div>
);
}