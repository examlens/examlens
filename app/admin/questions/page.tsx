"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Question {
  id: string;
  question: string;
  marks: number;
  category: string;
  difficulty: string;
  subject: string;
}

export default function QuestionsPage() {
  // =====================================================
  // STATES
  // =====================================================

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // SEARCH & FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] =
    useState("All Subjects");

  const [categoryFilter, setCategoryFilter] =
    useState("All Types");

  // =====================================================
  // MODAL
  // =====================================================

  const [showModal, setShowModal] = useState(false);

  // =====================================================
  // FORM STATES
  // =====================================================

  const [question, setQuestion] = useState("");

  const [marks, setMarks] = useState("");

  const [category, setCategory] =
    useState("Knowledge");

  const [difficulty, setDifficulty] =
    useState("Medium");

  const [subject, setSubject] =
    useState("Biology");

  // =====================================================
  // FETCH QUESTIONS
  // =====================================================

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("/api/questions");

      setQuestions(res.data || []);
      setFilteredQuestions(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // =====================================================
  // FILTER LOGIC
  // =====================================================

  useEffect(() => {
    let filtered = [...questions];

    // SEARCH

    if (search.trim()) {
      filtered = filtered.filter((q) =>
        q.question
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // CATEGORY FILTER

    if (categoryFilter !== "All Types") {
      filtered = filtered.filter(
        (q) => q.category === categoryFilter
      );
    }

    // SUBJECT FILTER

    if (subjectFilter !== "All Subjects") {
      filtered = filtered.filter(
        (q) => q.subject === subjectFilter
      );
    }

    setFilteredQuestions(filtered);
  }, [
    search,
    categoryFilter,
    subjectFilter,
    questions,
  ]);

  // =====================================================
  // ADD QUESTION
  // =====================================================

  const addQuestion = async () => {
    if (
      !question ||
      !marks ||
      !category ||
      !difficulty ||
      !subject
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/api/questions", {
        question,
        marks: Number(marks),
        category,
        difficulty,
        subject,
      });

      // RESET FORM

      setQuestion("");
      setMarks("");
      setCategory("Knowledge");
      setDifficulty("Medium");
      setSubject("Biology");

      setShowModal(false);

      fetchQuestions();
    } catch (err) {
      console.error(err);
      alert("Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE QUESTION
  // =====================================================

  const deleteQuestion = async (id: string) => {
    const confirmDelete = confirm(
      "Delete this question?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete("/api/questions", {
        data: { id },
      });

      fetchQuestions();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // =====================================================
  // DIFFICULTY COLOR
  // =====================================================

  const getDifficultyColor = (
    difficulty: string
  ) => {
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
            Question Management
          </p>

          <h1 className="text-4xl font-black text-slate-800 mt-2">
            Question Bank
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Manage and organize exam questions
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
          + Add Question
        </button>
      </div>

      {/* ===================================================== */}
      {/* FILTER BAR */}
      {/* ===================================================== */}

      <div className="bg-white border border-orange-100 rounded-[28px] p-5 shadow-lg mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* SEARCH */}

          <input
            type="text"
            placeholder="🔍 Search questions..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              border
              border-orange-200
              rounded-2xl
              px-5
              py-4
              outline-none
              focus:border-orange-500
              focus:ring-4
              focus:ring-orange-100
            "
          />

          {/* CATEGORY */}

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            className="
              border
              border-orange-200
              rounded-2xl
              px-5
              py-4
              outline-none
              focus:border-orange-500
            "
          >
            <option>
              All Types
            </option>

            <option value="Knowledge">
              Knowledge
            </option>

            <option value="Memory">
              Memory
            </option>

            <option value="Analytical">
              Analytical
            </option>
          </select>

          {/* SUBJECT */}

          <select
            value={subjectFilter}
            onChange={(e) =>
              setSubjectFilter(e.target.value)
            }
            className="
              border
              border-orange-200
              rounded-2xl
              px-5
              py-4
              outline-none
              focus:border-orange-500
            "
          >
            <option>
              All Subjects
            </option>

            <option value="Biology">
              Biology
            </option>

            <option value="Physics">
              Physics
            </option>

            <option value="Chemistry">
              Chemistry
            </option>

            <option value="Mathematics">
              Mathematics
            </option>

            <option value="History">
              History
            </option>

            <option value="Computer Science">
              Computer Science
            </option>
          </select>

          {/* COUNT */}

          <div className="flex items-center justify-center bg-orange-50 rounded-2xl border border-orange-100">
            <p className="font-bold text-orange-600 text-lg">
              {filteredQuestions.length} Questions
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* QUESTIONS */}
      {/* ===================================================== */}

      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-[30px] p-14 text-center border border-orange-100 shadow-lg">
            <h2 className="text-3xl font-black text-slate-700">
              No Questions Found
            </h2>

            <p className="text-slate-500 mt-3">
              Try adjusting filters or add a new question
            </p>
          </div>
        ) : (
          filteredQuestions.map(
            (
              q: Question,
              index: number
            ) => (
              <div
                key={q.id}
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
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                  {/* LEFT */}

                  <div className="flex gap-5 flex-1">
                    {/* NUMBER */}

                    <div
                      className="
                      min-w-[55px]
                      h-[55px]
                      rounded-2xl
                      bg-orange-500
                      flex
                      items-center
                      justify-center
                      text-white
                      font-black
                      text-lg
                      shadow-lg
                    "
                    >
                      {index + 1}
                    </div>

                    {/* CONTENT */}

                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-800 leading-relaxed">
                        {q.question}
                      </h2>

                      {/* TAGS */}

                      <div className="flex flex-wrap gap-3 mt-5">
                        <span className="px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">
                          {q.subject}
                        </span>

                        <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm">
                          {q.marks} Marks
                        </span>

                        <span
                          className={`px-4 py-2 rounded-full font-semibold text-sm ${getDifficultyColor(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty}
                        </span>

                        <span className="px-4 py-2 rounded-full bg-orange-50 text-orange-600 font-semibold text-sm">
                          {q.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex xl:flex-col gap-3">
                    <button
                      className="
                        px-5
                        py-3
                        rounded-2xl
                        bg-orange-500
                        hover:bg-orange-600
                        text-white
                        font-semibold
                        transition-all
                      "
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteQuestion(q.id)
                      }
                      className="
                        px-5
                        py-3
                        rounded-2xl
                        bg-red-500
                        hover:bg-red-600
                        text-white
                        font-semibold
                        transition-all
                      "
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          )
        )}
      </div>

      {/* ===================================================== */}
      {/* MODAL */}
      {/* ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-3xl bg-white rounded-[35px] shadow-2xl p-8 relative animate-in fade-in zoom-in-95 duration-300">
            {/* CLOSE */}

            <button
              onClick={() =>
                setShowModal(false)
              }
              className="
                absolute
                top-5
                right-5
                w-11
                h-11
                rounded-xl
                bg-slate-100
                hover:bg-red-100
                text-slate-600
                hover:text-red-600
                font-bold
                transition-all
              "
            >
              ✕
            </button>

            {/* TITLE */}

            <div className="mb-8">
              <p className="text-orange-500 font-semibold uppercase tracking-widest text-sm">
                Question Creation
              </p>

              <h2 className="text-4xl font-black text-slate-800 mt-2">
                Add New Question
              </h2>

              <p className="text-slate-500 mt-3">
                Add questions with metadata
              </p>
            </div>

            {/* FORM */}

            <div className="space-y-5">
              {/* QUESTION */}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Question Text
                </label>

                <textarea
                  value={question}
                  onChange={(e) =>
                    setQuestion(
                      e.target.value
                    )
                  }
                  rows={5}
                  placeholder="Enter the question..."
                  className="
                    w-full
                    border
                    border-orange-200
                    rounded-2xl
                    p-5
                    outline-none
                    focus:border-orange-500
                    focus:ring-4
                    focus:ring-orange-100
                  "
                />
              </div>

              {/* ROW */}

              <div className="grid md:grid-cols-2 gap-5">
                {/* CATEGORY */}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Question Type
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      border
                      border-orange-200
                      rounded-2xl
                      p-4
                      outline-none
                      focus:border-orange-500
                    "
                  >
                    <option value="Knowledge">
                      Knowledge
                    </option>

                    <option value="Memory">
                      Memory
                    </option>

                    <option value="Analytical">
                      Analytical
                    </option>
                  </select>
                </div>

                {/* SUBJECT */}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Subject
                  </label>

                  <select
                    value={subject}
                    onChange={(e) =>
                      setSubject(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      border
                      border-orange-200
                      rounded-2xl
                      p-4
                      outline-none
                      focus:border-orange-500
                    "
                  >
                    <option value="Biology">
                      Biology
                    </option>

                    <option value="Physics">
                      Physics
                    </option>

                    <option value="Chemistry">
                      Chemistry
                    </option>

                    <option value="Mathematics">
                      Mathematics
                    </option>

                    <option value="History">
                      History
                    </option>

                    <option value="Computer Science">
                      Computer Science
                    </option>
                  </select>
                </div>
              </div>

              {/* ROW */}

              <div className="grid md:grid-cols-2 gap-5">
                {/* MARKS */}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Marks
                  </label>

                  <input
                    type="number"
                    value={marks}
                    onChange={(e) =>
                      setMarks(
                        e.target.value
                      )
                    }
                    placeholder="Enter marks"
                    className="
                      w-full
                      border
                      border-orange-200
                      rounded-2xl
                      p-4
                      outline-none
                      focus:border-orange-500
                    "
                  />
                </div>

                {/* DIFFICULTY */}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Difficulty
                  </label>

                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      border
                      border-orange-200
                      rounded-2xl
                      p-4
                      outline-none
                      focus:border-orange-500
                    "
                  >
                    <option value="Easy">
                      Easy
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Hard">
                      Hard
                    </option>
                  </select>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() =>
                    setShowModal(false)
                  }
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
                  onClick={addQuestion}
                  disabled={loading}
                  className="
                    px-7
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
                  {loading
                    ? "Saving..."
                    : "Save Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}