"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ResultRow = {
  id: string;
  exam_title: string;
  student_email: string;
  score: number;
  total_marks: number;
  status: string;
  submitted_at: string;
  approved_at: string | null;
};

export default function MCQResultsPage() {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [filter, setFilter] = useState<"evaluated" | "all">("evaluated");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [filter]);

  async function fetchResults() {
    setLoading(true);
    const url =
      filter === "evaluated"
        ? "/api/admin/mcq/results?status=evaluated"
        : "/api/admin/mcq/results";
    const res = await fetch(url);
    const data = await res.json();
    setResults(data.results || []);
    setSelected([]);
    setLoading(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAll() {
    const approvable = results.filter((r) => r.status === "evaluated").map((r) => r.id);
    setSelected(approvable);
  }

  async function approveOne(id: string) {
    const res = await fetch(`/api/admin/mcq/results/${id}/approve`, { method: "PATCH" });
    if (res.ok) {
      setMessage("Approved.");
      fetchResults();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to approve");
    }
  }

  async function approveBulk() {
    if (selected.length === 0) return;
    const res = await fetch("/api/admin/mcq/results/approve-bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission_ids: selected }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`${data.approved} submission(s) approved.`);
      fetchResults();
    } else {
      setMessage(data.error || "Bulk approve failed");
    }
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      submitted: "bg-gray-100 text-gray-600",
      evaluated: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">MCQ Results & Approval</h1>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded text-sm ${filter === "evaluated" ? "bg-amber-500 text-white" : "bg-gray-100"}`}
            onClick={() => setFilter("evaluated")}
          >
            Pending approval
          </button>
          <button
            className={`px-4 py-2 rounded text-sm ${filter === "all" ? "bg-amber-500 text-white" : "bg-gray-100"}`}
            onClick={() => setFilter("all")}
          >
            All results
          </button>
        </div>

        {filter === "evaluated" && results.length > 0 && (
          <div className="flex gap-2">
            <button className="text-sm text-amber-600" onClick={selectAll}>
              Select all
            </button>
            <button
              className="bg-amber-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              disabled={selected.length === 0}
              onClick={approveBulk}
            >
              Approve selected ({selected.length})
            </button>
          </div>
        )}
      </div>

      {message && <p className="mb-4 text-amber-700">{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-gray-500">No results to show.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                {filter === "evaluated" && <th className="p-2 border w-8"></th>}
                <th className="p-2 text-left border">Student</th>
                <th className="p-2 text-left border">Exam</th>
                <th className="p-2 text-left border">Score</th>
                <th className="p-2 text-left border">Status</th>
                <th className="p-2 text-left border">Submitted</th>
                <th className="p-2 text-left border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  {filter === "evaluated" && (
                    <td className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(r.id)}
                        onChange={() => toggleSelect(r.id)}
                      />
                    </td>
                  )}
                  <td className="p-2 border">{r.student_email}</td>
                  <td className="p-2 border">{r.exam_title}</td>
                  <td className="p-2 border">
                    {r.score} / {r.total_marks}
                  </td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded text-xs ${statusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2 border">
                    {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}
                  </td>
                  <td className="p-2 border space-x-2">
                    <Link href={`/admin/mcq/results/${r.id}`} className="text-amber-600">
                      View
                    </Link>
                    {r.status === "evaluated" && (
                      <button className="text-green-600" onClick={() => approveOne(r.id)}>
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}