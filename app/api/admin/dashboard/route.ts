import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    // =====================================================
    // TOTAL STUDENTS
    // =====================================================

    const {
      count: totalStudents,
      error: studentError,
    } = await supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("role", "student");

    if (studentError) {
    }

    // =====================================================
    // TOTAL SUBMISSIONS
    // =====================================================

    const {
      count: totalSubmissions,
      error: submissionError,
    } = await supabase
      .from("submissions")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (submissionError) {
    }

    // =====================================================
    // EVALUATED
    // =====================================================

    const {
      count: evaluatedSubmissions,
      error: evaluatedError,
    } = await supabase
      .from("submissions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "evaluated");

    if (evaluatedError) {
    }

    // =====================================================
    // PENDING
    // =====================================================

    const {
      count: pendingSubmissions,
      error: pendingError,
    } = await supabase
      .from("submissions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .neq("status", "evaluated");

    if (pendingError) {
    }

    // =====================================================
    // RESULTS
    // =====================================================

    const {
      data: results,
      error: resultError,
    } = await supabase
      .from("results")
      .select("percentage");

    if (resultError) {
    }

    // =====================================================
    // AVG SCORE
    // =====================================================

    let averageScore = 0;

    if (results && results.length > 0) {
      const total =
        results.reduce(
          (
            sum: number,
            item: any
          ) =>
            sum +
            Number(
              item.percentage || 0
            ),
          0
        );

      averageScore = Math.round(
        total / results.length
      );
    }

    // =====================================================
    // TOP STUDENTS
    // =====================================================

    const {
      data: topStudents,
      error: topError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        avg_score,
        attendance
      `)
      .order("avg_score", {
        ascending: false,
      })
      .limit(5)

      .eq("role", "student"); // FILTER STUDENTS ONLY

    if (topError) {
    }

    // =====================================================
    // UPCOMING EXAMS
    // =====================================================

    const {
      data: upcomingExams,
      error: examError,
    } = await supabase
      .from("exams")
      .select(`
        id,
        title,
        exam_date,
        duration
      `)
      .order("exam_date", {
        ascending: true,
      })
      .limit(5);

    if (examError) {
    }

    // =====================================================
    // RECENT SUBMISSIONS
    // =====================================================

    const {
      data: recentSubmissions,
      error: recentError,
    } = await supabase
      .from("submissions")
      .select(`
        id,
        status,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    if (recentError) {
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json({
      totalStudents:
        totalStudents || 0,

      totalSubmissions:
        totalSubmissions || 0,

      evaluatedSubmissions:
        evaluatedSubmissions || 0,

      pendingSubmissions:
        pendingSubmissions || 0,

      averageScore,

      topStudents:
        topStudents || [],

      upcomingExams:
        upcomingExams || [],

      recentSubmissions:
        recentSubmissions || [],
    });
  } catch (err: any) {

    return NextResponse.json(
      {
        error:
          err.message ||
          "Dashboard error",
      },
      {
        status: 500,
      }
    );
  }
}