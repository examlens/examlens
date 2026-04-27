"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSubmissions() {
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d)) setData(d);
        else setData([]);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📥 Submissions</h1>

      {data.map((s) => (
        <div
          key={s.id}
          className="p-4 border mt-4 flex justify-between"
        >
          <div>
            <p>👤 {s.users?.name}</p>
            <p>📄 {s.exams?.title}</p>
            <p>📊 {s.status}</p>
          </div>

          <button
            onClick={() =>
              router.push(`/admin/submissions/${s.id}`)
            }
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Evaluate
          </button>
        </div>
      ))}
    </div>
  );
}