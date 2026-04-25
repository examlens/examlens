"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin-dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card title="Students" value={data.students} />
        <Card title="Avg Score" value={`${data.avgScore}%`} />
        <Card title="Submissions" value={data.submissions} />
        <Card title="Questions" value={data.questions} />
      </div>

      {/* Performance */}
      <div className="bg-white p-4 rounded-xl">
        <h2 className="font-bold mb-3">Student Performance</h2>

        {data.performance.map((s: any, i: number) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between">
              <span>{s.name}</span>
              <span>{s.score}%</span>
            </div>
            <div className="bg-gray-200 h-2 rounded">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${s.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Card = ({ title, value }: any) => (
  <div className="bg-white p-4 rounded-xl shadow">
    <p className="text-gray-500">{title}</p>
    <h2 className="text-xl font-bold">{value}</h2>
  </div>
);