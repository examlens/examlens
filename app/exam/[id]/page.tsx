"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Question = {
  id: string;
  text: string;
};

export default function ExamPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Shuffle
  const shuffle = (arr: Question[]) =>
    [...arr].sort(() => Math.random() - 0.5);

  // Load exam
  useEffect(() => {
    if (!id) return;

    const loadExam = async () => {
      const res = await fetch(`/api/exam/${id}`);
      const data = await res.json();

      if (data?.questions?.length > 0) {
        setQuestions(shuffle(data.questions));
      }
    };

    loadExam();
  }, [id]);

  // Upload
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      return alert("File too large (max 5MB)");
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("exam_id", id as string);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Upload successful ✅");
        setFile(null);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Student Exam
        </h1>

        {/* Questions */}
        <div className="space-y-6">
          {questions.length === 0 ? (
            <p className="text-center text-gray-500">
              Loading questions...
            </p>
          ) : (
            questions.map((q, i) => (
              <div key={q.id} className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-2">
                  {i + 1}. {q.text}
                </h3>

                <textarea
                  placeholder="Write your answer..."
                  className="w-full h-28 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))
          )}
        </div>

        {/* Upload Section */}
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">
            Upload Answer Sheet
          </h2>

          {/* Hidden input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Select File
            </button>

            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* File Preview */}
          {file && (
            <p className="mt-3 text-sm text-gray-600">
              Selected: {file.name}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}