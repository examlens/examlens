"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import {
  BookOpen,
  Trophy,
  AlertTriangle,
  Brain,
  Clock,
} from "lucide-react";

interface ResultItem {
  id: string;

  total_score: number | null;

  feedback: string | null;

  mistakes: string | null;

  knowledge_level: string | null;

  evaluated: boolean;

  evaluated_at: string | null;

  status: string;

  exams: {
    title: string;
  };
}

export default function StudentResultsPage() {
  const [results, setResults] = useState<
    ResultItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // FETCH RESULTS
  // ==========================================

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);

      // ==========================================
      // GET SESSION
      // ==========================================

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Please login again"
        );
      }

      // ==========================================
      // FETCH API
      // ==========================================

      const res = await fetch(
        "/api/student/results",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await res.json();

      console.log(
        "📦 RESULTS:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to fetch results"
        );
      }

      setResults(
        data.results || []
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SCORE COLOR
  // ==========================================

  const getScoreColor = (
    score: number
  ) => {
    if (score >= 90) {
      return "bg-green-500";
    }

    if (score >= 70) {
      return "bg-blue-500";
    }

    if (score >= 50) {
      return "bg-yellow-500";
    }

    return "bg-red-500";
  };

  // ==========================================
  // KNOWLEDGE LEVEL COLOR
  // ==========================================

  const getKnowledgeColor = (
    level: string
  ) => {
    switch (
      level?.toLowerCase()
    ) {
      case "advanced":
        return "bg-green-100 text-green-700";

      case "intermediate":
        return "bg-yellow-100 text-yellow-700";

      case "beginner":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (
    date: string | null
  ) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleString();
  };

  // ==========================================
  // LOADING UI
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-xl rounded-2xl p-10">
          <p className="text-lg font-semibold text-gray-700 animate-pulse">
            Loading Results...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR UI
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-3">
            Error
          </h1>

          <p className="text-gray-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#0d426a]">
          My Results
        </h1>

        <p className="text-gray-500 mt-2">
          View your evaluated exams,
          performance analytics,
          mistakes, and teacher
          feedback.
        </p>
      </div>

      {/* EMPTY */}

      {results.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-10 text-center">
          <p className="text-gray-500 text-lg">
            No results available
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {results.map((item) => {
            const score =
              item.total_score || 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100"
              >
                {/* TOP */}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0d426a] flex items-center gap-2">
                      <BookOpen size={22} />

                      {
                        item.exams
                          ?.title
                      }
                    </h2>

                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={14} />

                      Evaluated:
                      {" "}
                      {formatDate(
                        item.evaluated_at
                      )}
                    </p>
                  </div>

                  {/* STATUS */}

                  {item.evaluated ? (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
                      Evaluated
                    </div>
                  ) : (
                    <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl text-sm font-semibold">
                      Pending
                    </div>
                  )}
                </div>

                {/* SCORE */}

                {item.evaluated ? (
                  <>
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Trophy
                            size={20}
                          />

                          <span className="font-semibold text-gray-700">
                            Score
                          </span>
                        </div>

                        <span className="text-2xl font-bold text-[#0d426a]">
                          {score}/100
                        </span>
                      </div>

                      {/* PROGRESS BAR */}

                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-4 rounded-full ${getScoreColor(
                            score
                          )}`}
                          style={{
                            width: `${score}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* FEEDBACK */}

                    <div className="mt-6">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">
                        Teacher Feedback
                      </h3>

                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-gray-700">
                        {item.feedback ||
                          "No feedback"}
                      </div>
                    </div>

                    {/* MISTAKES */}

                    <div className="mt-6">
                      <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                        <AlertTriangle
                          size={20}
                        />

                        Mistakes
                      </h3>

                      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-gray-700">
                        {item.mistakes ||
                          "No mistakes added"}
                      </div>
                    </div>

                    {/* KNOWLEDGE */}

                    <div className="mt-6">
                      <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                        <Brain
                          size={20}
                        />

                        Knowledge Level
                      </h3>

                      <span
                        className={`px-4 py-2 rounded-xl text-sm font-semibold ${getKnowledgeColor(
                          item.knowledge_level ||
                            ""
                        )}`}
                      >
                        {item.knowledge_level ||
                          "Not Available"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                    <p className="text-yellow-700 font-medium">
                      ⏳ Your answer sheet
                      is waiting for teacher
                      evaluation.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}