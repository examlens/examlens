"use client";

import { useEffect, useState } from "react";

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔹 Fetch exams
  const fetchExams = async () => {
    const res = await fetch("/api/admin/exams");
    const data = await res.json();
    setExams(data || []);
  };

  // 🔹 Fetch questions
  const fetchQuestions = async () => {
    const res = await fetch("/api/questions");
    const data = await res.json();
    setQuestions(data || []);
  };

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  // 🔹 Create exam
  const createExam = async () => {
    if (!title) return alert("Enter exam title");

    setLoading(true);

    const res = await fetch("/api/admin/exams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      setLoading(false);
      return;
    }

    setTitle("");
    setDescription("");
    fetchExams();
    setLoading(false);
  };

  // 🔹 Toggle question
  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id)
        ? prev.filter((q) => q !== id)
        : [...prev, id]
    );
  };

  // 🔹 Assign
  const assignQuestions = async () => {
    if (!selectedExam || selectedQuestions.length === 0) {
      alert("Select exam & questions");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/exam-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exam_id: selectedExam,
        question_ids: selectedQuestions,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      setLoading(false);
      return;
    }

    alert("✅ Questions assigned");
    setSelectedQuestions([]);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exams</h1>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg">
          + Create Exam
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* 🔹 LEFT PANEL */}
        <div className="md:col-span-1 space-y-6">

          {/* CREATE EXAM */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Create Exam</h2>

            <input
              placeholder="Exam Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />

            <button
              onClick={createExam}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              {loading ? "Creating..." : "Create Exam"}
            </button>
          </div>

          {/* SELECT EXAM */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Select Exam</h2>

            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Choose Exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* ASSIGN BUTTON */}
          <button
            onClick={assignQuestions}
            className="bg-green-600 text-white py-3 rounded-xl w-full"
          >
            {loading ? "Assigning..." : "Assign Questions"}
          </button>
        </div>

        {/* 🔹 RIGHT PANEL (QUESTIONS) */}
        <div className="md:col-span-2 bg-white p-5 rounded-xl shadow">

          <h2 className="font-semibold mb-4">
            Question Bank ({questions.length})
          </h2>

          <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">

            {questions.map((q) => (
              <div
                key={q.id}
                onClick={() => toggleQuestion(q.id)}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  selectedQuestions.includes(q.id)
                    ? "border-orange-500 bg-orange-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="font-semibold">{q.question}</p>

                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(q.id)}
                    readOnly
                  />
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  {q.model_answer}
                </p>

                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-blue-600">
                    {q.category}
                  </span>
                  <span className="text-green-600">
                    {q.marks} marks
                  </span>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <p className="text-gray-400 text-center">
                No questions found
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}