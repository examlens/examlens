"use client";

import { useState } from "react";

export default function QuestionsPage() {
  const [text, setText] = useState("");
  const [type, setType] = useState("memory");
  const [marks, setMarks] = useState(5);
  const [modelAnswer, setModelAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log("Button clicked");

    // Basic validation
    if (!text || !modelAnswer) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          type,
          marks,
          model_answer: modelAnswer,
        }),
      });

      const data = await res.json();

      console.log("API Response:", data);

      if (!res.ok) {
        alert("Error: " + data.error);
        return;
      }

      alert("✅ Question added successfully");

      // Clear form
      setText("");
      setType("memory");
      setMarks(5);
      setModelAnswer("");

    } catch (err) {
      console.error("Frontend Error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Add Question</h1>

      <input
        placeholder="Question"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br /><br />

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="memory">Memory</option>
        <option value="knowledge">Knowledge</option>
        <option value="analytical">Analytical</option>
      </select>
      <br /><br />

      <input
        type="number"
        value={marks}
        onChange={(e) => setMarks(Number(e.target.value))}
      />
      <br /><br />

      <textarea
        placeholder="Model Answer"
        value={modelAnswer}
        onChange={(e) => setModelAnswer(e.target.value)}
      />
      <br /><br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Adding..." : "Add Question"}
      </button>
    </div>
  );
}