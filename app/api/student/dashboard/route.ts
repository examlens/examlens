import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/app/lib/supabase";

export async function GET(
  req: NextRequest
) {
  try {
    // =========================================
    // GET STUDENT ID
    // =========================================

    const studentId =
      req.nextUrl.searchParams.get(
        "student_id"
      );

    if (!studentId) {
      return NextResponse.json(
        {
          error:
            "student_id required",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "👤 Student ID:",
      studentId
    );

    // =========================================
    // PROFILE
    // =========================================

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", studentId)
      .single();

    if (profileError) {
      console.log(
        "PROFILE ERROR",
        profileError
      );
    }

    // =========================================
    // RESULTS
    // =========================================

    const {
      data: results,
      error: resultError,
    } = await supabase
      .from("results")
      .select(`
        id,
        score,
        percentage,
        feedback,
        created_at,
        exam_id
      `)
      .eq(
        "student_id",
        studentId
      )
      .order("created_at", {
        ascending: false,
      });

    if (resultError) {
      console.log(
        "RESULT ERROR",
        resultError
      );
    }

    // =========================================
    // GET EXAM TITLES
    // =========================================

    const formattedResults =
      await Promise.all(
        (results || []).map(
          async (item: any) => {
            const {
              data: exam,
            } = await supabase
              .from("exams")
              .select("title")
              .eq(
                "id",
                item.exam_id
              )
              .single();

            return {
              ...item,
              exam_title:
                exam?.title ||
                "Exam",
            };
          }
        )
      );

    // =========================================
    // SUBMISSION COUNT
    // =========================================

    const {
      count: submissionCount,
    } = await supabase
      .from("submissions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "student_id",
        studentId
      );

    // =========================================
    // UPCOMING EXAMS
    // =========================================

    const {
      data: upcomingExams,
      error: examError,
    } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    if (examError) {
      console.log(
        "EXAM ERROR",
        examError
      );
    }

    // =========================================
    // SUCCESS
    // =========================================

    return NextResponse.json({
      profile:
        profile || null,

      results:
        formattedResults || [],

      upcomingExams:
        upcomingExams || [],

      submissionCount:
        submissionCount || 0,
    });
  } catch (err: any) {
    console.log(
      "DASHBOARD ERROR",
      err
    );

    return NextResponse.json(
      {
        error:
          err.message ||
          "Dashboard failed",
      },
      {
        status: 500,
      }
    );
  }
}