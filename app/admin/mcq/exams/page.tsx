"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
};

type Exam = {
  id: string;
  title: string;
  duration_min: number;
  marks_per_q: number;
  status: string;
  question_count: number;
  created_at: string;
};

export default function MCQExamsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [durationMin, setDurationMin] = useState(30);
  const [marksPerQ, setMarksPerQ] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
    fetchExams();
  }, []);

  async function fetchQuestions() {
    const res = await fetch("/api/admin/mcq/questions");
    const data = await res.json();
    setQuestions(data.questions || []);
  }

  async function fetchExams() {
    const res = await fetch("/api/admin/mcq/exams");
    const data = await res.json();
    setExams(data.exams || []);
  }

  function toggleQuestion(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selectAllFiltered() {
    const filteredIds = filteredQuestions.map((q) => q.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  const filteredQuestions = questions.filter((q) =>
    q.question_text.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreateExam() {
    if (!title.trim()) {
      setMessage("Exam title is required");
      return;
    }
    if (selectedIds.length === 0) {
      setMessage("Select at least one question");
      return;
    }

    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/mcq/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        duration_min: durationMin,
        marks_per_q: marksPerQ,
        question_ids: selectedIds,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to create exam");
      return;
    }

    setMessage(`Exam created with ${data.question_count} question(s).`);
    setTitle("");
    setDurationMin(30);
    setMarksPerQ(1);
    setSelectedIds([]);
    fetchExams();
  }

  async function togglePublish(exam: Exam) {
    const nextStatus = exam.status === "published" ? "draft" : "published";
    await fetch(`/api/admin/mcq/exams/${exam.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchExams();
  }

  async function closeExam(exam: Exam) {
    if (!confirm(`Close "${exam.title}"? Students will no longer be able to attempt it.`)) return;
    await fetch(`/api/admin/mcq/exams/${exam.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "closed" }),
    });
    fetchExams();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Create MCQ Exam</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Exam Title</label>
          <input
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Physics Unit Test 1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded p-2"
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Marks per Question</label>
          <input
            type="number"
            min={1}
            step="0.5"
            className="w-full border rounded p-2"
            value={marksPerQ}
            onChange={(e) => setMarksPerQ(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">
          Select Questions ({selectedIds.length} selected
          {durationMin && marksPerQ ? ` · ${selectedIds.length * marksPerQ} total marks` : ""})
        </h2>
        <div className="flex gap-2">
          <input
            className="border rounded p-2 text-sm"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={selectAllFiltered} className="text-sm text-amber-600">
            Select all shown
          </button>
          <button onClick={clearSelection} className="text-sm text-gray-500">
            Clear
          </button>
        </div>
      </div>

      <div className="border rounded-lg max-h-96 overflow-y-auto mb-6">
        {filteredQuestions.map((q) => (
          <label
            key={q.id}
            className="flex items-start gap-3 p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(q.id)}
              onChange={() => toggleQuestion(q.id)}
              className="mt-1"
            />
            <div>
              <p className="font-medium">{q.question_text}</p>
              <p className="text-sm text-gray-500">
                A) {q.option_a} &nbsp; B) {q.option_b} &nbsp; C) {q.option_c} &nbsp; D) {q.option_d}
                &nbsp;·&nbsp;
                <span className="text-green-600 font-medium">
                  Correct: {q.correct_option.toUpperCase()}
                </span>
              </p>
            </div>
          </label>
        ))}
        {filteredQuestions.length === 0 && (
          <p className="p-4 text-gray-400 text-sm">No questions found. Add some in the question bank first.</p>
        )}
      </div>

      {message && <p className="mb-4 text-amber-700">{message}</p>}

      <button
        onClick={handleCreateExam}
        disabled={loading}
        className="bg-amber-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Exam"}
      </button>

      <hr className="my-8" />

      <h2 className="text-xl font-semibold mb-3">Existing Exams</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left border">Title</th>
              <th className="p-2 text-left border">Duration</th>
              <th className="p-2 text-left border">Marks/Q</th>
              <th className="p-2 text-left border">Questions</th>
              <th className="p-2 text-left border">Status</th>
              <th className="p-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.id}>
                <td className="p-2 border">{e.title}</td>
                <td className="p-2 border">{e.duration_min} min</td>
                <td className="p-2 border">{e.marks_per_q}</td>
                <td className="p-2 border">{e.question_count}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      e.status === "published"
                        ? "bg-green-100 text-green-700"
                        : e.status === "closed"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="p-2 border space-x-2">
                  {e.status !== "closed" && (
                    <button className="text-amber-600" onClick={() => togglePublish(e)}>
                      {e.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                  )}
                  {e.status !== "closed" && (
                    <button className="text-red-500" onClick={() => closeExam(e)}>
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}