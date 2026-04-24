"use client";

import { useEffect, useState } from "react";

type Exam = {
  id: string;
  title: string;
};

type Question = {
  id: string;
  text: string;
};

export default function AssignPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Fetch exams
  const fetchExams = async () => {
    const res = await fetch("/api/exams");
    const data = await res.json();
    setExams(data);
  };

  // Fetch questions
  const fetchQuestions = async () => {
    const res = await fetch("/api/get-questions");
    const data = await res.json();
    console.log("Questions:", data); // DEBUG
    setQuestions(data);
  };

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  // Toggle checkbox (FIXED + DEBUG)
  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((q) => q !== id)
        : [...prev, id];

      console.log("Selected:", updated); // DEBUG
      return updated;
    });
  };

  // Submit
  const handleAssign = async () => {
    if (!selectedExam || selectedQuestions.length === 0) {
      return alert("Select exam and questions");
    }

    const res = await fetch("/api/exam-questions", {
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
    alert(data.message || data.error);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Assign Questions to Exam</h1>

      {/* Select Exam */}
      <select
        value={selectedExam}
        onChange={(e) => setSelectedExam(e.target.value)}
      >
        <option value="">Select Exam</option>
        {exams.map((exam) => (
          <option key={exam.id} value={exam.id}>
            {exam.title}
          </option>
        ))}
      </select>

      <hr />

      {/* Questions List */}
      <h3>Select Questions</h3>

      {questions.length === 0 ? (
        <p>No questions found</p>
      ) : (
        questions.map((q) => (
          <label
            key={q.id}
            style={{
              display: "block",
              marginBottom: "8px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={selectedQuestions.includes(q.id)} // ✅ FIXED
              onChange={() => toggleQuestion(q.id)}
            />
            {" "}
            {q.text}
          </label>
        ))
      )}

      <br />

      <button onClick={handleAssign}>
        Assign Questions
      </button>
    </div>
  );
}