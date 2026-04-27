"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EvaluatePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/submission/${id}`)
      .then((res) => res.json())
      .then(setData);
  }, [id]);

  const handleEvaluate = async () => {
    await fetch("/api/admin/evaluate", {
      method: "POST",
      body: JSON.stringify({ submission_id: id }),
    });

    alert("✅ Evaluated");

    location.reload();
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">
        {data.users?.name} - {data.exams?.title}
      </h1>

      {data.submission_answers.map((a: any, i: number) => (
        <div key={a.id} className="border p-4 mt-4">
          <p>Q{i + 1}: {a.questions.question}</p>
          <p>Answer: {a.answer}</p>
          <p>Score: {a.score ?? "Not evaluated"}</p>
        </div>
      ))}

      <button
        onClick={handleEvaluate}
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded"
      >
        🤖 Auto Evaluate
      </button>
    </div>
  );
}