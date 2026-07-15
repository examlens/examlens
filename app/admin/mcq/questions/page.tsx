"use client";

import { useEffect, useState } from "react";

type DraftQuestion = {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
};

const emptyDraft = (): DraftQuestion => ({
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "a",
});

export default function MCQQuestionBankPage() {
  const [mode, setMode] = useState<"manual" | "bulk">("manual");
  const [drafts, setDrafts] = useState<DraftQuestion[]>([emptyDraft()]);
  const [bulkText, setBulkText] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    const res = await fetch("/api/admin/mcq/questions");
    const data = await res.json();
    setQuestions(data.questions || []);
  }

  function updateDraft(idx: number, field: keyof DraftQuestion, value: string) {
    setDrafts((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  function addDraftRow() {
    setDrafts((prev) => [...prev, emptyDraft()]);
  }

  function removeDraftRow(idx: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== idx));
  }

  // Bulk format: one question per line, pipe-separated
  // question | optA | optB | optC | optD | correct(a/b/c/d)
  function parseBulkText(): DraftQuestion[] {
    return bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        const [question_text, option_a, option_b, option_c, option_d, correct_option] = parts;
        return { question_text, option_a, option_b, option_c, option_d, correct_option };
      });
  }

  async function handleSubmit() {
    setLoading(true);
    setMessage(null);
    setErrorDetails([]);

    const payload = mode === "manual" ? drafts : parseBulkText();

    const res = await fetch("/api/admin/mcq/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: payload }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Something went wrong");
      setErrorDetails(data.details || []);
      return;
    }

    setMessage(`${data.inserted} question(s) added successfully.`);
    setDrafts([emptyDraft()]);
    setBulkText("");
    fetchQuestions();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/admin/mcq/questions/${id}`, { method: "DELETE" });
    fetchQuestions();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">MCQ Question Bank</h1>

      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${mode === "manual" ? "bg-amber-500 text-white" : "bg-gray-100"}`}
          onClick={() => setMode("manual")}
        >
          Manual Entry
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === "bulk" ? "bg-amber-500 text-white" : "bg-gray-100"}`}
          onClick={() => setMode("bulk")}
        >
          Bulk Paste
        </button>
      </div>

      {mode === "manual" && (
        <div className="space-y-6 mb-6">
          {drafts.map((d, idx) => (
            <div key={idx} className="border rounded-lg p-4 relative">
              {drafts.length > 1 && (
                <button
                  className="absolute top-2 right-2 text-red-500 text-sm"
                  onClick={() => removeDraftRow(idx)}
                >
                  Remove
                </button>
              )}
              <textarea
                className="w-full border rounded p-2 mb-3"
                placeholder="Question text"
                value={d.question_text}
                onChange={(e) => updateDraft(idx, "question_text", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  className="border rounded p-2"
                  placeholder="Option A"
                  value={d.option_a}
                  onChange={(e) => updateDraft(idx, "option_a", e.target.value)}
                />
                <input
                  className="border rounded p-2"
                  placeholder="Option B"
                  value={d.option_b}
                  onChange={(e) => updateDraft(idx, "option_b", e.target.value)}
                />
                <input
                  className="border rounded p-2"
                  placeholder="Option C"
                  value={d.option_c}
                  onChange={(e) => updateDraft(idx, "option_c", e.target.value)}
                />
                <input
                  className="border rounded p-2"
                  placeholder="Option D"
                  value={d.option_d}
                  onChange={(e) => updateDraft(idx, "option_d", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mr-2">Correct Answer:</label>
                {["a", "b", "c", "d"].map((opt) => (
                  <label key={opt} className="mr-3">
                    <input
                      type="radio"
                      name={`correct-${idx}`}
                      checked={d.correct_option === opt}
                      onChange={() => updateDraft(idx, "correct_option", opt)}
                      className="mr-1"
                    />
                    {opt.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button onClick={addDraftRow} className="text-amber-600 font-medium">
            + Add another question
          </button>
        </div>
      )}

      {mode === "bulk" && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">
            One question per line, pipe-separated: <br />
            <code>Question text | Option A | Option B | Option C | Option D | correct(a/b/c/d)</code>
          </p>
          <textarea
            className="w-full border rounded p-3 h-48 font-mono text-sm"
            placeholder="What is 2+2? | 3 | 4 | 5 | 6 | b"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
        </div>
      )}

      {message && (
        <div className="mb-4">
          <p className={errorDetails.length ? "text-red-600" : "text-green-600"}>{message}</p>
          {errorDetails.length > 0 && (
            <ul className="text-sm text-red-500 list-disc ml-5">
              {errorDetails.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-amber-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Questions"}
      </button>

      <hr className="my-8" />

      <h2 className="text-xl font-semibold mb-3">Existing Questions ({questions.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left border">Question</th>
              <th className="p-2 text-left border">A</th>
              <th className="p-2 text-left border">B</th>
              <th className="p-2 text-left border">C</th>
              <th className="p-2 text-left border">D</th>
              <th className="p-2 text-left border">Correct</th>
              <th className="p-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td className="p-2 border">{q.question_text}</td>
                <td className="p-2 border">{q.option_a}</td>
                <td className="p-2 border">{q.option_b}</td>
                <td className="p-2 border">{q.option_c}</td>
                <td className="p-2 border">{q.option_d}</td>
                <td className="p-2 border font-medium">{q.correct_option.toUpperCase()}</td>
                <td className="p-2 border">
                  <button
                    className="text-red-500"
                    onClick={() => handleDelete(q.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}