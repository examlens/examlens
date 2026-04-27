"use client";

import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch("/api/student/results")
      .then((res) => res.json())
      .then(setResults);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📊 My Results</h1>

      {results.map((r: any) => (
        <div key={r.id} className="p-4 border mt-4">
          <img src={r.submissions.file_url} className="w-40 mb-2" />

          <p>Score: {r.score}</p>
          <p>{r.feedback}</p>
        </div>
      ))}
    </div>
  );
}