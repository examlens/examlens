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
    <div className="min-h-screen bg-[#f4f7fb] p-6">
      {/* HEADER */}

      <div className="mb-10">
        <h1 className="text-5xl font-black text-[#0d426a]">
          My Results
        </h1>

        <p className="text-gray-600 mt-3 text-lg">
          Performance analytics,
          teacher evaluation,
          mistakes and learning insights.
        </p>
      </div>

      {/* RESULT CARDS */}

      <div className="grid gap-6">
        {results.map((result) => (
          <div
            key={result.id}
            onClick={() =>
              setSelectedResult(result)
            }
            className="bg-white rounded-3xl p-7 shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-[#0d426a]">
                  {
                    result.exams
                      ?.title
                  }
                </h2>

                <p className="text-gray-500 mt-2">
                  Evaluated on{" "}
                  {new Date(
                    result.evaluated_at
                  ).toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-6 py-4 rounded-2xl text-center shadow-lg">
                <div className="text-3xl font-black">
                  {result.score}/
                  {
                    result.total_marks
                  }
                </div>

                <div className="text-sm opacity-90">
                  Score
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <p className="text-blue-900 text-lg leading-8">
                {
                  result.feedback
                }
              </p>
            </div>

            <div className="flex gap-4 flex-wrap mt-6">
              <div className="bg-green-100 text-green-700 px-5 py-3 rounded-xl font-semibold">
                ✅ Strong Areas:{" "}
                {
                  result
                    .strong_areas
                    ?.length
                }
              </div>

              <div className="bg-red-100 text-red-700 px-5 py-3 rounded-xl font-semibold">
                ❌ Weak Areas:{" "}
                {
                  result.weak_areas
                    ?.length
                }
              </div>

              <div className="bg-yellow-100 text-yellow-700 px-5 py-3 rounded-xl font-semibold">
                ⚠ Mistakes:{" "}
                {
                  result.mistakes
                    ?.length
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}

      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-5xl rounded-3xl p-8 max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* TOP */}

            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-black text-[#0d426a]">
                  {
                    selectedResult
                      .exams?.title
                  }
                </h2>

                <p className="text-gray-500 mt-2">
                  Complete Evaluation
                  Report
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedResult(
                    null
                  )
                }
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold"
              >
                Close
              </button>
            </div>

            {/* SCORE */}

            <div className="mt-8 bg-gradient-to-r from-[#0d426a] to-[#00a0dc] rounded-3xl p-10 text-white shadow-xl">
              <div className="text-xl font-semibold opacity-90">
                Final Score
              </div>

              <div className="text-7xl font-black mt-4">
                {
                  selectedResult.score
                }
                /
                {
                  selectedResult.total_marks
                }
              </div>

              <div className="mt-3 text-lg opacity-90">
                Performance:
                {" "}
                {Math.round(
                  (selectedResult.score /
                    selectedResult.total_marks) *
                    100
                )}
                %
              </div>
            </div>

            {/* FEEDBACK */}

            <div className="mt-10">
              <h3 className="text-3xl font-bold mb-5">
                Teacher Feedback
              </h3>

              <div className="bg-gray-100 rounded-2xl p-6 text-lg leading-9 text-gray-800">
                {
                  selectedResult.feedback
                }
              </div>
            </div>

            {/* MISTAKES */}

            <div className="mt-10">
              <h3 className="text-3xl font-bold text-red-600 mb-5">
                Mistakes
              </h3>

              <div className="space-y-4">
                {selectedResult
                  .mistakes?.length >
                0 ? (
                  selectedResult.mistakes.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={index}
                        className="bg-red-50 border border-red-100 p-5 rounded-2xl"
                      >
                        <div className="font-semibold text-red-700">
                          Mistake{" "}
                          {index + 1}
                        </div>

                        <div className="text-gray-700 mt-2">
                          {item}
                        </div>

                        {selectedResult
                          .expected_answers?.[
                          index
                        ] && (
                          <div className="mt-4 bg-green-50 border border-green-100 p-4 rounded-xl">
                            <div className="font-semibold text-green-700">
                              Expected Answer
                            </div>

                            <div className="mt-2 text-gray-700">
                              {
                                selectedResult
                                  .expected_answers[
                                  index
                                ]
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )
                ) : (
                  <div className="bg-green-50 p-5 rounded-2xl text-green-700">
                    No major mistakes.
                  </div>
                )}
              </div>
            </div>

            {/* STRONG */}

            <div className="mt-10">
              <h3 className="text-3xl font-bold text-green-600 mb-5">
                Strong Areas
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {selectedResult.strong_areas?.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="bg-green-50 border border-green-100 p-5 rounded-2xl"
                    >
                      ✅ {item}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* WEAK */}

            <div className="mt-10">
              <h3 className="text-3xl font-bold text-yellow-600 mb-5">
                Weak Areas
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {selectedResult.weak_areas?.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="bg-yellow-50 border border-yellow-100 p-5 rounded-2xl"
                    >
                      ⚠ {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}