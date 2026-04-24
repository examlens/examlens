"use client";

import { useEffect, useState } from "react";

type Exam = {
  id: string;
  title: string;
  description: string;
  duration: number;
  created_at: string;
};

export default function ExamsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExams = async () => {
    const res = await fetch("/api/exams");
    const data = await res.json();
    setExams(data);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreate = async () => {
    if (!title) return alert("Title required");

    setLoading(true);

    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, duration }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
    } else {
      alert("✅ Exam created");
      setTitle("");
      setDescription("");
      setDuration(60);
      fetchExams();
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📊 Exams Dashboard</h1>

      {/* CREATE CARD */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Exam</h2>

        <div className="grid gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Exam Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="border p-2 rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />

          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Exam"}
          </button>
        </div>
      </div>

      {/* EXAMS LIST */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">All Exams</h2>

        {exams.length === 0 ? (
          <p className="text-gray-500">No exams yet</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="border p-4 rounded-xl hover:shadow-md transition"
              >
                <h3 className="font-bold text-lg">{exam.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {exam.description}
                </p>

                <div className="flex justify-between text-sm">
                  <span>⏱ {exam.duration} mins</span>
                  <span className="text-gray-400">
                    {new Date(exam.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}