"use client";

import { useEffect, useState } from "react";

export default function StudentSubmissionsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 📥 Fetch student's submissions
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const res = await fetch("/api/get-submissions");
    const data = await res.json();
    setSubmissions(data);
  };

  // 📸 Handle file select
  const handleFileChange = (e: any) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  // 🚀 Upload submission
  const handleSubmit = async () => {
    if (!file) {
      alert("Upload an answer image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-submission", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        setFile(null);
        setPreview(null);
        fetchSubmissions();
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Score color
  const getScoreColor = (score: number, total: number) => {
    const percent = (score / total) * 100;
    if (percent >= 75) return "text-green-600";
    if (percent >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 🔝 Header */}
      <h1 className="text-3xl font-bold mb-6">
        📚 My Submissions
      </h1>

      {/* 📤 Upload Card */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Upload Answer Sheet
        </h2>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
        />

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-full max-w-sm rounded-lg mb-4"
          />
        )}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {loading ? "Uploading..." : "Submit"}
        </button>
      </div>

      {/* 📊 Submission List */}
      <div className="grid md:grid-cols-2 gap-6">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="bg-white rounded-2xl shadow p-5"
          >
            {/* Image */}
            <img
              src={sub.file_url}
              alt="answer"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />

            {/* Status */}
            <div className="mb-3">
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  sub.status === "evaluated"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {sub.status}
              </span>
            </div>

            {/* Result */}
            {sub.score !== undefined && (
              <div className="mb-3">
                <p
                  className={`text-lg font-semibold ${getScoreColor(
                    sub.score,
                    sub.total
                  )}`}
                >
                  Score: {sub.score} / {sub.total}
                </p>
              </div>
            )}

            {/* Feedback */}
            {sub.feedback && (
              <div className="bg-gray-100 p-3 rounded-lg text-sm">
                💬 {sub.feedback}
              </div>
            )}

            {/* Pending message */}
            {sub.status !== "evaluated" && (
              <p className="text-gray-500 text-sm">
                ⏳ Waiting for evaluation...
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}