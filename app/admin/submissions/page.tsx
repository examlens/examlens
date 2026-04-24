"use client";

import { useEffect, useState } from "react";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/get-submissions");
        const data = await res.json();
        setSubmissions(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchSubmissions();
  }, []);

  const handleEvaluate = async (id: number) => {
    try {
      setLoadingId(id);

      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submission_id: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Evaluation failed");
        return;
      }

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                score: data.score,
                total: data.total,
                extractedText: data.extractedText,
                breakdown: data.breakdown,
                feedback: data.feedback,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Evaluate error:", err);
      alert("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ FIXED PDF DOWNLOAD
  const downloadReport = async (sub: any) => {
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submission: sub }),
      });

      if (!res.ok) {
        alert("Failed to generate PDF");
        return;
      }

      const blob = await res.blob();

      // 🚨 Prevent corrupted file
      if (blob.size === 0) {
        alert("Empty PDF generated");
        return;
      }

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${sub.id}.pdf`;
      document.body.appendChild(a);
      a.click();

      // ✅ CLEANUP (IMPORTANT)
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF error:", err);
      alert("PDF download failed");
    }
  };

  const getScoreColor = (score: number, total: number) => {
    if (!total) return "bg-gray-400";

    const percent = (score / total) * 100;

    if (percent >= 75) return "bg-green-500";
    if (percent >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📊 AI Exam Dashboard</h1>

      {submissions.length === 0 ? (
        <p>No submissions found</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {submissions.map((sub) => {
            const percent =
              sub.score !== undefined && sub.total
                ? Math.round((sub.score / sub.total) * 100)
                : 0;

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl shadow-lg p-5"
              >
                {/* 📄 Image */}
                <img
                  src={sub.file_url}
                  alt="answer"
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />

                {/* 🎯 Score */}
                {sub.score !== undefined && (
                  <>
                    <div className="mb-3">
                      <span
                        className={`text-white px-3 py-1 rounded-full text-sm ${getScoreColor(
                          sub.score,
                          sub.total
                        )}`}
                      >
                        {sub.score} / {sub.total} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full ${getScoreColor(
                          sub.score,
                          sub.total
                        )}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </>
                )}

                {/* 🧠 Breakdown */}
                {sub.breakdown && (
                  <details className="mb-3">
                    <summary className="cursor-pointer font-semibold">
                      📘 Question Breakdown
                    </summary>

                    <div className="mt-2 space-y-2">
                      {sub.breakdown.map((q: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 border rounded-lg bg-gray-50"
                        >
                          <p className="font-medium">
                            Q{q.question_index}
                          </p>

                          <p className="text-green-600 text-sm">
                            Score: {q.score}
                          </p>

                          <p className="text-gray-600 text-sm">
                            {q.feedback}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* 🔍 Extracted Text */}
                {sub.extractedText && (
                  <details className="mb-3">
                    <summary className="cursor-pointer text-gray-700">
                      🔍 View Extracted Text
                    </summary>
                    <p className="text-sm mt-2 bg-gray-100 p-2 rounded">
                      {sub.extractedText}
                    </p>
                  </details>
                )}

                {/* ▶️ Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEvaluate(sub.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                  >
                    {loadingId === sub.id
                      ? "Evaluating..."
                      : sub.score !== undefined
                      ? "Re-evaluate"
                      : "Evaluate"}
                  </button>

                  {sub.score !== undefined && (
                    <button
                      onClick={() => downloadReport(sub)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                    >
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}