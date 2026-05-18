"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

interface Result {
  id: string;
  score: number;
  total_marks: number;
  feedback: string;
  mistakes: string[];
  expected_answers: string[];
  strong_areas: string[];
  weak_areas: string[];
  evaluated_at: string;

  exams: {
    title: string;
  };
}

export default function ResultsPage() {
  const [results, setResults] =
    useState<Result[]>([]);

  const [selectedResult, setSelectedResult] =
    useState<Result | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      const res = await fetch(
        "/api/student/results",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to fetch results"
        );
      }

      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
    {/* HEADER */}
    <div className="mb-12 max-w-6xl mx-auto">
      <h1 className="text-5xl font-bold text-slate-800 tracking-tight">
        My Results
      </h1>
      <p className="text-slate-600 mt-3 text-xl">
        Track your performance, review feedback, and improve your learning.
      </p>
    </div>

    {/* RESULT CARDS */}
    <div className="max-w-6xl mx-auto grid gap-8">
      {results.map((result) => (
        <div
          key={result.id}
          onClick={() => setSelectedResult(result)}
          className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-orange-100 hover:border-orange-200 overflow-hidden transition-all duration-300 cursor-pointer"
        >
          {/* Top Accent */}
          <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500" />

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Exam Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                  {result.exams?.title || "Untitled Exam"}
                </h2>
                <p className="text-slate-500 mt-2 text-sm">
                  Evaluated on{" "}
                  {new Date(result.evaluated_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Score Card */}
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white px-8 py-6 rounded-3xl text-center shadow-xl min-w-[180px]">
                <div className="text-5xl font-black tracking-tighter">
                  {result.score} <span className="text-3xl">/</span> {result.total_marks}
                </div>
                <div className="text-sm font-medium mt-1 opacity-90">
                  {Math.round((result.score / result.total_marks) * 100)}% Score
                </div>
              </div>
            </div>

            {/* Feedback Preview */}
            {result.feedback && (
              <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-6 text-slate-700 line-clamp-2">
                {result.feedback}
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4 flex-wrap mt-6">
              <div className="bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl font-medium flex items-center gap-2">
                ✅ Strong Areas: <span className="font-bold">{result.strong_areas?.length || 0}</span>
              </div>
              <div className="bg-red-50 text-red-700 px-5 py-3 rounded-2xl font-medium flex items-center gap-2">
                ❌ Weak Areas: <span className="font-bold">{result.weak_areas?.length || 0}</span>
              </div>
              <div className="bg-amber-50 text-amber-700 px-5 py-3 rounded-2xl font-medium flex items-center gap-2">
                ⚠ Mistakes: <span className="font-bold">{result.mistakes?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* DETAIL MODAL */}
    {selectedResult && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="px-8 pt-8 pb-6 border-b flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-bold text-slate-800">
                {selectedResult.exams?.title}
              </h2>
              <p className="text-slate-500 mt-1">Detailed Performance Report</p>
            </div>

            <button
              onClick={() => setSelectedResult(null)}
              className="bg-red-500 hover:bg-slate-200 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
            >
              Close
            </button>
          </div>

          <div className="overflow-y-auto p-8 space-y-10">
            {/* Score Section */}
            <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white rounded-3xl p-10 shadow-inner">
              <div className="text-xl font-medium opacity-90">Your Score</div>
              <div className="text-7xl font-black mt-4 tracking-tighter">
                {selectedResult.score} / {selectedResult.total_marks}
              </div>
              <div className="text-2xl mt-2 opacity-90">
                {Math.round((selectedResult.score / selectedResult.total_marks) * 100)}% Performance
              </div>
            </div>

            {/* Teacher Feedback */}
            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-5">Teacher Feedback</h3>
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-lg leading-relaxed text-slate-700">
                {selectedResult.feedback || "No feedback provided yet."}
              </div>
            </div>

            {/* Mistakes */}
            <div>
              <h3 className="text-3xl font-bold text-red-600 mb-5">Mistakes & Corrections</h3>
              <div className="space-y-5">
                {selectedResult.mistakes?.length > 0 ? (
                  selectedResult.mistakes.map((item: string, index: number) => (
                    <div key={index} className="bg-red-50 border border-red-100 rounded-3xl p-6">
                      <div className="font-semibold text-red-700 mb-2">Mistake {index + 1}</div>
                      <p className="text-slate-700">{item}</p>
                      {selectedResult.expected_answers?.[index] && (
                        <div className="mt-5 bg-green-50 border border-green-100 rounded-2xl p-5">
                          <div className="font-semibold text-green-700 mb-1">Expected Answer</div>
                          <p className="text-green-800">{selectedResult.expected_answers[index]}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-green-50 border border-green-100 rounded-3xl p-8 text-center text-green-700 font-medium">
                    No major mistakes found. Excellent work!
                  </div>
                )}
              </div>
            </div>

            {/* Strong & Weak Areas */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Strong Areas */}
              <div>
                <h3 className="text-3xl font-bold text-emerald-600 mb-5">Strong Areas</h3>
                <div className="space-y-3">
                  {selectedResult.strong_areas?.length > 0 ? (
                    selectedResult.strong_areas.map((item: string, index: number) => (
                      <div key={index} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-3">
                        ✅ <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">No strong areas recorded.</div>
                  )}
                </div>
              </div>

              {/* Weak Areas */}
              <div>
                <h3 className="text-3xl font-bold text-amber-600 mb-5">Areas to Improve</h3>
                <div className="space-y-3">
                  {selectedResult.weak_areas?.length > 0 ? (
                    selectedResult.weak_areas.map((item: string, index: number) => (
                      <div key={index} className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-3">
                        ⚠ <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">No weak areas identified.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}