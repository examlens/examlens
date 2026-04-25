"use client";

import { useEffect, useState } from "react";
import {
    Bar
} from "react-chartjs-2";
import "chart.js/auto";

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then((res) => res.json())
            .then(setData);
    }, []);

    if (!data) return <p className="p-6">Loading analytics...</p>;

    if (data.error)
        return (
            <p className="p-6 text-red-500">
                Error: {data.error}
            </p>
        );

    const chartData = {
        labels: Object.keys(data.distribution),
        datasets: [
            {
                label: "Students",
                data: Object.values(data.distribution),
            },
        ],
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Analytics</h1>

            {/* 📊 Chart */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">
                    Score Distribution
                </h2>
                <Bar data={chartData} />
            </div>

            {/* 📊 Performance */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">
                    Performance by Type
                </h2>

                {Object.entries(data.performance).map(
                    ([key, value]: any) => (
                        <div key={key} className="mb-4">
                            <p className="capitalize">{key}</p>
                            <div className="w-full bg-gray-200 h-2 rounded">
                                <div
                                    className="bg-green-500 h-2 rounded"
                                    style={{ width: `${value}%` }}
                                />
                            </div>
                            <p>{value}%</p>
                        </div>
                    )
                )}

                {/* 🤖 Insight */}
                <div className="mt-4 bg-yellow-100 p-3 rounded">
                    💡 {data.insight}
                </div>
            </div>

            {/* 🏆 Leaderboard */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">
                    Leaderboard
                </h2>

                {data.leaderboard.map((s: any, i: number) => (
                    <div
                        key={i}
                        className="flex justify-between border-b py-2"
                    >
                        <p>#{i + 1} {s.name}</p>
                        <p className="font-bold">{s.score}%</p>
                    </div>
                ))}
            </div>

            {/* 📈 Submission Rate */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">
                    Submission Rate
                </h2>

                <div className="w-full bg-gray-200 h-3 rounded">
                    <div
                        className="bg-orange-500 h-3 rounded"
                        style={{ width: `${data.submissionRate}%` }}
                    />
                </div>

                <p className="mt-2">
                    {data.submissionRate}% students submitted
                </p>
            </div>
        </div>
    );
}