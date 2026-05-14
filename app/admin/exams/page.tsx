"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

export default function ExamsPage() {
  const router = useRouter();

  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const [selectedExam, setSelectedExam] =
    useState("");

  const [selectedQuestions, setSelectedQuestions] =
    useState<string[]>([]);

  const [referenceFile, setReferenceFile] =
    useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [duration, setDuration] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // ✅ FETCH EXAMS
  // =====================================================

  const fetchExams = async () => {
    try {
      const res = await fetch(
        "/api/admin/exams"
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to fetch exams"
        );
      }

      setExams(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ FETCH EXAMS:", err);
      alert(err.message);
    }
  };

  // =====================================================
  // ✅ FETCH QUESTIONS
  // =====================================================

  const fetchQuestions = async () => {
    try {
      const res = await fetch(
        "/api/questions"
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to fetch questions"
        );
      }

      setQuestions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(
        "❌ FETCH QUESTIONS:",
        err
      );
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  // =====================================================
  // ✅ CREATE EXAM
  // =====================================================

  const createExam = async () => {
    if (!title.trim()) {
      alert("Enter exam title");
      return;
    }

    try {
      setLoading(true);

      let referenceUrl: string | null =
        null;

      // =========================================
      // ✅ GET AUTH USER
      // =========================================

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "You must login first"
        );
      }

      // =========================================
      // ✅ UPLOAD REFERENCE NOTES
      // =========================================

      if (referenceFile) {
        const fileName = `${Date.now()}-${
          referenceFile.name
        }`;

        const { error: uploadError } =
          await supabase.storage
            .from("exam-notes")
            .upload(fileName, referenceFile, {
              cacheControl: "3600",
              upsert: false,
            });

        if (uploadError) {
          console.error(
            "❌ STORAGE ERROR:",
            uploadError
          );

          throw new Error(
            uploadError.message
          );
        }

        const { data } = supabase.storage
          .from("exam-notes")
          .getPublicUrl(fileName);

        referenceUrl =
          data?.publicUrl || null;
      }

      // =========================================
      // ✅ CREATE EXAM API
      // =========================================

      const res = await fetch(
        "/api/admin/exams",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            title,
            description,
            duration:
              Number(duration) || 10,
            reference_file_url:
              referenceUrl,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to create exam"
        );
      }

      alert("✅ Exam created");

      // =========================================
      // ✅ RESET FORM
      // =========================================

      setTitle("");
      setDescription("");
      setDuration("");
      setReferenceFile(null);

      // reset file input manually
      const fileInput =
        document.getElementById(
          "referenceFile"
        ) as HTMLInputElement;

      if (fileInput) {
        fileInput.value = "";
      }

      fetchExams();
    } catch (err: any) {
      console.error(
        "❌ CREATE EXAM:",
        err
      );

      alert(
        err.message ||
          "Failed to create exam"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ✅ DELETE EXAM
  // =====================================================

  const handleDelete = async (
    examId: string
  ) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this exam?"
    );

    if (!confirmDelete) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Authentication required"
        );
      }

      const res = await fetch(
        `/api/admin/exams?id=${examId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to delete exam"
        );
      }

      alert("✅ Exam deleted");

      fetchExams();
    } catch (err: any) {
      console.error(
        "❌ DELETE EXAM:",
        err
      );

      alert(
        err.message ||
          "Failed to delete exam"
      );
    }
  };

  // =====================================================
  // ✅ TOGGLE QUESTION
  // =====================================================

  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id)
        ? prev.filter((q) => q !== id)
        : [...prev, id]
    );
  };

  // =====================================================
  // ✅ ASSIGN QUESTIONS
  // =====================================================

  const assignQuestions = async () => {
    if (
      !selectedExam ||
      selectedQuestions.length === 0
    ) {
      alert(
        "Select exam and questions"
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Authentication required"
        );
      }

      const res = await fetch(
        "/api/admin/exam-questions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            exam_id: selectedExam,
            question_ids:
              selectedQuestions,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to assign questions"
        );
      }

      alert(
        "✅ Questions assigned successfully"
      );

      setSelectedQuestions([]);

      fetchExams();
    } catch (err: any) {
      console.error(
        "❌ ASSIGN QUESTIONS:",
        err
      );

      alert(
        err.message ||
          "Assignment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ✅ UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0d426a]">
            Exam Management
          </h1>

          <p className="text-gray-500 mt-1">
            Create exams, assign
            questions, manage
            submissions
          </p>
        </div>
      </div>

      {/* MAIN GRID */}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT PANEL */}

        <div className="space-y-6">
          {/* CREATE EXAM */}

          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-xl font-semibold mb-4">
              📘 Create Exam
            </h2>

            <input
              type="text"
              placeholder="Exam Title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-lg mb-3"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-lg mb-3"
              rows={4}
            />

            <input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) =>
                setDuration(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-lg mb-3"
            />

            {/* FILE */}

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">
                Upload Reference Notes
              </label>

              <input
                id="referenceFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setReferenceFile(
                    e.target
                      .files?.[0] ||
                      null
                  )
                }
                className="w-full border p-2 rounded-lg mt-1"
              />

              <p className="text-xs text-gray-500 mt-1">
                AI uses these notes
                for evaluation
              </p>
            </div>

            <button
              onClick={createExam}
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0d426a] hover:bg-[#08314d]"
              }`}
            >
              {loading
                ? "Creating..."
                : "Create Exam"}
            </button>
          </div>

          {/* ASSIGN QUESTIONS */}

          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-xl font-semibold mb-4">
              📝 Assign Questions
            </h2>

            <select
              value={selectedExam}
              onChange={(e) =>
                setSelectedExam(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-lg"
            >
              <option value="">
                Select Exam
              </option>

              {exams.map((exam) => (
                <option
                  key={exam.id}
                  value={exam.id}
                >
                  {exam.title} (
                  {exam.duration || 0} mins)
                </option>
              ))}
            </select>

            <button
              onClick={
                assignQuestions
              }
              disabled={loading}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
            >
              {loading
                ? "Assigning..."
                : "Assign Questions"}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="lg:col-span-2 space-y-6">
          {/* EXAMS */}

          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-2xl font-bold mb-5 text-[#0d426a]">
              📚 Created Exams
            </h2>

            {exams.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No exams created yet
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {exams.map(
                  (exam: any) => (
                    <div
                      key={exam.id}
                      className="border rounded-2xl p-5 hover:shadow-lg transition bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-[#0d426a]">
                            {
                              exam.title
                            }
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            {
                              exam.description
                            }
                          </p>
                        </div>

                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {
                            exam.duration
                          }{" "}
                          mins
                        </div>
                      </div>

                      {/* STATS */}

                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-sm text-gray-500">
                            Questions
                          </p>

                          <p className="text-xl font-bold text-[#0d426a]">
                            {exam.question_count ||
                              0}
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-sm text-gray-500">
                            Submissions
                          </p>

                          <p className="text-xl font-bold text-green-600">
                            {exam.submission_count ||
                              0}
                          </p>
                        </div>
                      </div>

                      {/* NOTES */}

                      {exam.reference_file_url && (
                        <a
                          href={
                            exam.reference_file_url
                          }
                          target="_blank"
                          className="block mt-4 text-sm text-blue-600 hover:underline"
                        >
                          📄 View Reference
                          Notes
                        </a>
                      )}

                      {/* ACTIONS */}

                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/submissions/${exam.id}`
                            )
                          }
                          className="flex-1 bg-[#0d426a] hover:bg-[#08314d] text-white py-2 rounded-lg"
                        >
                          View
                          Submissions
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              exam.id
                            )
                          }
                          className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* QUESTION BANK */}

          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-2xl font-bold mb-5 text-[#0d426a]">
              📑 Question Bank (
              {questions.length})
            </h2>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
              {questions.map(
                (q: any) => (
                  <div
                    key={q.id}
                    onClick={() =>
                      toggleQuestion(
                        q.id
                      )
                    }
                    className={`border rounded-xl p-4 cursor-pointer transition ${
                      selectedQuestions.includes(
                        q.id
                      )
                        ? "border-orange-500 bg-orange-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-lg">
                        {
                          q.question
                        }
                      </p>

                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(
                          q.id
                        )}
                        readOnly
                      />
                    </div>

                    <p className="text-gray-500 text-sm mt-2">
                      {
                        q.model_answer
                      }
                    </p>

                    <div className="flex justify-between items-center mt-4 text-sm">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {
                          q.category
                        }
                      </span>

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        {q.marks} marks
                      </span>
                    </div>
                  </div>
                )
              )}

              {questions.length ===
                0 && (
                <div className="text-center text-gray-400 py-10">
                  No questions found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}