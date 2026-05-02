"use client";

import { useEffect, useState } from "react";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [form, setForm] = useState({
    question: "",
    marks: "",
    category: "Knowledge",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // ✅ SAFE FETCH (fixes "<!DOCTYPE" crash)
  const safeFetch = async (url: string, options?: any) => {
    const res = await fetch(url, options);

    const text = await res.text(); // always read as text first

    try {
      const data = JSON.parse(text);

      if (!res.ok) {
        throw new Error(data.error || "API Error");
      }

      return data;
    } catch (err) {
      console.error("❌ NON-JSON RESPONSE:", text);
      throw new Error("Server returned invalid response (check API path)");
    }
  };

  // 🔹 Fetch questions
  const fetchQuestions = async () => {
    try {
      setFetchLoading(true);

      const data = await safeFetch("/api/questions");

      setQuestions(data);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
      alert(err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // 🔹 Add question
  const handleAdd = async () => {
    if (!form.question  || !form.marks) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      await safeFetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          marks: Number(form.marks),
        }),
      });

      // Reset form
      setForm({
        question: "",
        marks: "",
        category: "Knowledge",
      });

      await fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete question
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;

    try {
      await safeFetch("/api/questions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getScoreColor = () => "bg-blue-600";

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📘 Question Bank</h1>

      {/* FORM */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Question</h2>

        <textarea
          placeholder="Enter Question"
          className="w-full border p-3 mb-3 rounded-lg"
          value={form.question}
          onChange={(e) =>
            setForm({ ...form, question: e.target.value })
          }
        />

        {/* <textarea
          placeholder="Model Answer"
          className="w-full border p-3 mb-3 rounded-lg"
          value={form.model_answer}
          onChange={(e) =>
            setForm({ ...form, model_answer: e.target.value })
          }
        /> */}

        <div className="grid md:grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Marks"
            className="border p-3 rounded-lg"
            value={form.marks}
            onChange={(e) =>
              setForm({ ...form, marks: e.target.value })
            }
          />

          <select
            className="border p-3 rounded-lg"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          >
            <option>Knowledge</option>
            <option>Understanding</option>
            <option>Application</option>
            <option>Analysis</option>
          </select>
        </div>

        <button
          onClick={handleAdd}
          disabled={loading}
          className={`mt-4 px-6 py-2 rounded-lg text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Adding..." : "Add Question"}
        </button>
      </div>

      {/* LIST */}
      {fetchLoading ? (
        <p>Loading questions...</p>
      ) : questions.length === 0 ? (
        <p className="text-gray-500">No questions added yet</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white p-5 rounded-2xl shadow"
            >
              <p className="font-semibold text-lg">{q.question}</p>

              {/* <p className="text-sm text-gray-600 mt-2">
                {q.model_answer}
              </p> */}

              <div className="flex justify-between mt-4">
                <span className="text-blue-600 text-sm">
                  {q.category}
                </span>

                <span className="text-green-600 text-sm">
                  {q.marks} marks
                </span>
              </div>

              <button
                onClick={() => handleDelete(q.id)}
                className="mt-4 text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}