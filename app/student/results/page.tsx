"use client";

import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/student/results")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setResults(data);
        else setResults([]);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📊 My Results</h1>

      {results.map((r) => (
        <div key={r.id} className="border p-4 mt-4">
          <p>📄 {r.exams?.title}</p>
          <p>📊 Score: {r.total_score}</p>
          <p>📌 Status: {r.status}</p>
        </div>
      ))}
    </div>
  );
}