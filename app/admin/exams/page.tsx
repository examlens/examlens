"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { storage } from "@/app/lib/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  total_marks: number;
  subject: string;
  exam_date: string;
  reference_file_url?: string;
  question_count?: number;
}

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  subject: string;
  marks: number;
}

export default function ExamsPage() {
  const router = useRouter();

  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const [referenceFile, setReferenceFile] = useState<File | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [duration, setDuration] = useState("");

  const [totalMarks, setTotalMarks] = useState("");

  // ✅ SUBJECT DEFAULT EMPTY
  const [subject, setSubject] = useState("");

  const [examDate, setExamDate] = useState("");

  const [loading, setLoading] = useState(false);

  // =====================================================
  // TOAST NOTIFICATION
  // =====================================================

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

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  };

  // =====================================================
  // FETCH EXAMS
  // =====================================================

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/admin/exams");

      const data = await res.json();

      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
    }
  };

  // =====================================================
  // FETCH QUESTIONS
  // =====================================================

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions");

      const data = await res.json();

      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  // =====================================================
  // ✅ UNIQUE SUBJECTS
  // =====================================================

  const uniqueSubjects = useMemo(() => {
    const subjects = questions.map((q) => q.subject?.trim()).filter(Boolean);

    return [...new Set(subjects)];
  }, [questions]);

  // =====================================================
  // FILTER SUBJECT QUESTIONS
  // =====================================================

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => q.subject === subject);
  }, [questions, subject]);

  // =====================================================
  // TOGGLE QUESTIONS
  // =====================================================

  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id],
    );
  };

  // =====================================================
  // CREATE EXAM
  // =====================================================

  const createExam = async () => {
    if (!title || !duration || !totalMarks || !subject || !examDate) {
      showToast("Fill all required fields", "error");
      return;
    }

    if (selectedQuestions.length === 0) {
      showToast("Select at least one question", "error");
      return;
    }

    try {
      setLoading(true);

      let referenceUrl: string | null = null;

      // =========================================
      // GET SESSION
      // =========================================

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Please login again");
      }

      // =========================================
      // UPLOAD NOTES
      // =========================================

      if (referenceFile) {
        const fileName = `${Date.now()}-${referenceFile.name}`;

        const fileRef = ref(storage, `exam-notes/${fileName}`);

        await uploadBytes(fileRef, referenceFile);

        referenceUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(
          `exam-notes/${fileName}`,
        )}?alt=media`;
      }

      // =========================================
      // CREATE EXAM
      // =========================================

      const examRes = await fetch("/api/admin/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          title,
          description,
          duration: Number(duration),
          total_marks: Number(totalMarks),
          subject,
          exam_date: examDate,
          reference_file_url: referenceUrl,
        }),
      });

      const examData = await examRes.json();

      if (!examRes.ok) {
        throw new Error(examData.error || "Failed to create exam");
      }

      const examId = examData?.exam?.id;

      // =========================================
      // ASSIGN QUESTIONS
      // =========================================

      const assignRes = await fetch("/api/admin/exam-questions", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          exam_id: examId,
          question_ids: selectedQuestions,
        }),
      });

      const assignData = await assignRes.json();

      if (!assignRes.ok) {
        throw new Error(assignData.error || "Failed to assign questions");
      }

      showToast("✅ Exam created", "success");

      // RESET

      setTitle("");
      setDescription("");
      setDuration("");
      setTotalMarks("");

      // ✅ RESET SUBJECT EMPTY
      setSubject("");

      setExamDate("");
      setSelectedQuestions([]);
      setReferenceFile(null);
      setShowModal(false);

      fetchExams();
    } catch (err: any) {

      showToast(err.message || "Failed to create exam", "error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE EXAM
  // =====================================================

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this exam?");

    if (!confirmDelete) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`/api/admin/exams?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      showToast("Exam deleted successfully", "success");
      fetchExams();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // =====================================================
  // BADGE COLORS
  // =====================================================

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700";

      case "Medium":
        return "bg-yellow-100 text-yellow-700";

      case "Hard":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-6">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <p className="text-orange-500 font-semibold uppercase tracking-widest text-sm">
            Exam Management
          </p>

          <h1 className="text-4xl font-black text-slate-800 mt-2">Exams</h1>

          <p className="text-slate-500 mt-2 text-lg">
            Create and manage exams with subject-based question filtering
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
          px-7
          py-4
          rounded-2xl
          bg-orange-500
          hover:bg-orange-600
          text-white
          font-bold
          shadow-lg
          shadow-orange-200
          transition-all
          duration-300
          hover:scale-105
        "
        >
          + Create Exam
        </button>
      </div>

      {/* ===================================================== */}
      {/* EXAM CARDS */}
      {/* ===================================================== */}

      {exams.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-[30px] p-14 text-center shadow-lg">
          <h2 className="text-3xl font-black text-slate-700">
            No Exams Created
          </h2>

          <p className="text-slate-500 mt-3">Create your first exam</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="
              bg-white
              border
              border-orange-100
              rounded-[30px]
              p-6
              shadow-md
              hover:shadow-2xl
              hover:-translate-y-1
              transition-all
              duration-300
            "
            >
              {/* TOP */}

              <div className="flex justify-between items-start gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">
                    {exam.title}
                  </h2>

                  <p className="text-slate-500 mt-2 text-sm">
                    {exam.description}
                  </p>
                </div>

                <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold">
                  {exam.duration} mins
                </div>
              </div>

              {/* TAGS */}

              <div className="flex flex-wrap gap-3 mt-5">
                <span className="px-4 py-2 rounded-full bg-orange-50 text-orange-600 font-semibold text-sm">
                  {exam.subject}
                </span>

                <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                  {exam.total_marks} Marks
                </span>

                <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                  {exam.question_count || 0} Questions
                </span>
              </div>

              {/* DATE */}

              <div className="mt-5 bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <p className="text-sm text-orange-600 font-semibold">
                  Exam Date
                </p>

                <p className="text-slate-700 font-bold mt-1">
                  {exam.exam_date}
                </p>
              </div>

              {/* ACTIONS */}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => router.push(`/admin/submissions`)}
                  className="
                  flex-1
                  bg-orange-500
                  hover:bg-orange-600
                  text-white
                  py-3
                  rounded-2xl
                  font-bold
                  transition-all
                "
                >
                  View Submissions
                </button>

                <button
                  onClick={() => handleDelete(exam.id)}
                  className="
                  px-5
                  py-3
                  rounded-2xl
                  bg-red-500
                  hover:bg-red-600
                  text-white
                  font-bold
                  transition-all
                "
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL */}
      {/* ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 md:p-8">
            <div
              className="
        relative
        w-full
        max-w-7xl
        bg-white
        rounded-[32px]
        shadow-2xl
        border
        border-orange-100
        my-10
        overflow-hidden
      "
            >
              {/* ===================================================== */}
              {/* HEADER */}
              {/* ===================================================== */}

              <div className="sticky top-0 z-20 bg-white border-b border-orange-100 px-6 md:px-8 py-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="
            absolute
            top-6
            right-6
            w-10
            h-10
            rounded-xl
            bg-slate-100
            hover:bg-red-100
            text-slate-600
            hover:text-red-600
            font-bold
            transition-all
            flex
            items-center
            justify-center
          "
                >
                  ✕
                </button>

                <p className="text-orange-500 font-bold uppercase tracking-[3px] text-xs">
                  Create New Exam
                </p>

                <h2 className="text-3xl md:text-4xl font-black text-slate-800 mt-2">
                  Configure Exam
                </h2>

                <p className="text-slate-500 mt-2">
                  Configure exam settings and select questions
                </p>
              </div>

              {/* ===================================================== */}
              {/* CONTENT */}
              {/* ===================================================== */}

              <div className="grid lg:grid-cols-[420px_1fr]">
                {/* ===================================================== */}
                {/* LEFT PANEL */}
                {/* ===================================================== */}

                <div className="border-r border-orange-100 bg-orange-50/40 p-6 md:p-8 space-y-6">
                  {/* EXAM NAME */}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Exam Name
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g Mid-Term Exam"
                      className="
                w-full
                bg-white
                border
                border-orange-200
                rounded-2xl
                px-5
                py-4
                outline-none
                transition-all
                focus:border-orange-500
                focus:ring-4
                focus:ring-orange-100
              "
                    />
                  </div>

                  {/* SUBJECT */}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Subject
                    </label>

                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="
                w-full
                bg-white
                border
                border-orange-200
                rounded-2xl
                px-5
                py-4
                outline-none
                transition-all
                focus:border-orange-500
                focus:ring-4
                focus:ring-orange-100
              "
                    >
                      {/* Placeholder */}
                      <option value="" disabled>
                        Select Subject
                      </option>

                      {[
                        ...new Set(
                          questions
                            .map((q) => q.subject?.trim())
                            .filter(Boolean),
                        ),
                      ].map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DATE */}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Exam Date
                    </label>

                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="
                w-full
                bg-white
                border
                border-orange-200
                rounded-2xl
                px-5
                py-4
                outline-none
                transition-all
                focus:border-orange-500
                focus:ring-4
                focus:ring-orange-100
              "
                    />
                  </div>

                  {/* DURATION + MARKS */}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">
                        Duration
                      </label>

                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="120"
                        className="
                  w-full
                  bg-white
                  border
                  border-orange-200
                  rounded-2xl
                  px-5
                  py-4
                  outline-none
                  transition-all
                  focus:border-orange-500
                  focus:ring-4
                  focus:ring-orange-100
                "
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">
                        Total Marks
                      </label>

                      <input
                        type="number"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}
                        placeholder="100"
                        className="
                  w-full
                  bg-white
                  border
                  border-orange-200
                  rounded-2xl
                  px-5
                  py-4
                  outline-none
                  transition-all
                  focus:border-orange-500
                  focus:ring-4
                  focus:ring-orange-100
                "
                      />
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Description
                    </label>

                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="
                w-full
                bg-white
                border
                border-orange-200
                rounded-2xl
                px-5
                py-4
                outline-none
                resize-none
                transition-all
                focus:border-orange-500
                focus:ring-4
                focus:ring-orange-100
              "
                    />
                  </div>

                  {/* FILE */}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Upload Reference Notes
                    </label>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.png,.jpeg"
                      onChange={(e) =>
                        setReferenceFile(e.target.files?.[0] || null)
                      }
                      className="
                w-full
                bg-white
                border
                border-orange-200
                rounded-2xl
                p-4
              "
                    />
                  </div>
                </div>

                {/* ===================================================== */}
                {/* RIGHT PANEL */}
                {/* ===================================================== */}

                <div className="p-6 md:p-8 flex flex-col">
                  {/* HEADER */}

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-black text-slate-800">
                        Question Selection
                      </h3>

                      <p className="text-slate-500 mt-1">
                        Select questions for this exam
                      </p>
                    </div>

                    <div className="bg-orange-100 text-orange-700 px-5 py-3 rounded-2xl font-bold">
                      {filteredQuestions.length} Questions
                    </div>
                  </div>

                  {/* QUESTIONS */}

                  <div className="space-y-4 overflow-y-auto max-h-[650px] pr-2">
                    {filteredQuestions.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => toggleQuestion(q.id)}
                        className={`
                  rounded-3xl
                  border
                  p-5
                  cursor-pointer
                  transition-all
                  duration-300
                  ${
                    selectedQuestions.includes(q.id)
                      ? "border-orange-500 bg-orange-50 shadow-lg"
                      : "border-slate-200 hover:border-orange-300 hover:shadow-md bg-white"
                  }
                `}
                      >
                        <div className="flex gap-4">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(q.id)}
                            readOnly
                            className="mt-1 w-5 h-5 accent-orange-500"
                          />

                          <div className="flex-1">
                            <h2 className="text-lg font-bold text-slate-800 leading-relaxed">
                              {q.question}
                            </h2>

                            <div className="flex flex-wrap gap-2 mt-4">
                              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                                {q.category}
                              </span>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(
                                  q.difficulty,
                                )}`}
                              >
                                {q.difficulty}
                              </span>

                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                {q.marks} Marks
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredQuestions.length === 0 && (
                      <div className="bg-orange-50 border border-orange-100 rounded-3xl p-10 text-center">
                        <p className="text-xl font-bold text-slate-700">
                          No Questions Found
                        </p>

                        <p className="text-slate-500 mt-2">
                          No questions available for selected subject
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ===================================================== */}
              {/* FOOTER */}
              {/* ===================================================== */}

              <div className="border-t border-orange-100 bg-white px-6 md:px-8 py-5 flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="
            px-6
            py-3
            rounded-2xl
            border
            border-slate-300
            font-semibold
            hover:bg-slate-100
            transition-all
          "
                >
                  Cancel
                </button>

                <button
                  onClick={createExam}
                  disabled={loading}
                  className="
            px-8
            py-3
            rounded-2xl
            bg-orange-500
            hover:bg-orange-600
            text-white
            font-bold
            shadow-lg
            shadow-orange-200
            transition-all
          "
                >
                  {loading ? "Creating..." : "Create Exam"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* TOAST NOTIFICATION */}
      {/* ===================================================== */}

      {toast.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* BACKDROP */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

          {/* TOAST CARD */}
          <div className="relative bg-white border border-orange-200 shadow-2xl rounded-2xl px-6 py-5 w-[320px] text-center animate-fadeIn">
            {/* ICON */}
            <div
              className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                toast.type === "success"
                  ? "bg-orange-100 text-orange-500"
                  : "bg-red-100 text-red-500"
              }`}
            >
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
