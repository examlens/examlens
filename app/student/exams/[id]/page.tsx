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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <p className="text-lg font-semibold text-gray-700 animate-pulse">
            Loading exam...
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Already Attempted
          </h1>

          <p className="text-gray-600">
            You have already
            submitted this exam.
          </p>

          <button
            onClick={() =>
              router.push(
                "/student/exams"
              )
            }
            className="mt-6 bg-[#0d426a] hover:bg-[#08314d] text-white px-6 py-3 rounded-xl"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // ✅ ERROR UI
  // =====================================================

  if (
    error &&
    !questions.length
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error
          </h2>

          <p className="text-gray-700">
            {error}
          </p>

          <button
            onClick={() =>
              router.push(
                "/student/exams"
              )
            }
            className="mt-5 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
    <div className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}

      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0d426a]">
            {examTitle}
          </h1>

          <p className="text-gray-500 mt-1">
            Write answers on
            paper and upload
            PDF/image
          </p>
        </div>

        {/* TIMER */}

        <div
          className={`px-5 py-3 rounded-xl text-lg font-semibold w-fit text-white ${timeLeft <= 60
              ? "bg-red-600"
              : "bg-black"
            }`}
        >
          ⏳{" "}
          {formatTime(
            timeLeft
          )}
        </div>
      </div>

      {/* TIME OVER */}

      {timeOver && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-5 py-4 rounded-xl mb-6">
          ⛔ Time is over. You
          can no longer submit
          this exam.
        </div>
      )}

      {/* QUESTIONS */}

      {questions.length ===
        0 ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center">
          <p className="text-gray-500">
            No questions
            available
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {questions.map(
              (
                q,
                index
              ) => (
                <div
                  key={q.id}
                  className="bg-white p-6 rounded-2xl shadow"
                >
                  <div className="flex justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {index + 1}.{" "}
                      {
                        q.question
                      }
                    </h2>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm h-fit whitespace-nowrap">
                      {
                        q.marks
                      }{" "}
                      Marks
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* FILE UPLOAD */}

          <div className="bg-white p-6 rounded-2xl shadow mt-6">
            <h2 className="text-xl font-semibold mb-4">
              Upload Answer
              Sheet
            </h2>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={
                timeOver
              }
              onChange={(
                e
              ) => {
                const selectedFile =
                  e.target
                    .files?.[0] ||
                  null;

                setFile(
                  selectedFile
                );
              }}
              className="w-full border border-gray-300 rounded-lg p-3 disabled:bg-gray-100"
            />

            {file && (
              <div className="mt-3 text-green-600 text-sm">
                ✅{" "}
                {file.name}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}

          <div className="mt-8 flex justify-end">
            <button
              onClick={
                handleSubmit
              }
              disabled={
                submitting ||
                timeOver
              }
              className={`px-8 py-3 rounded-xl text-white font-semibold transition-all ${submitting ||
                  timeOver
                  ? "bg-gray-400"
                  : "bg-green-600 hover:bg-green-700"
                }`}
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