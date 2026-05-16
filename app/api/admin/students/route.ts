import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    // =========================================
    // FETCH STUDENTS
    // =========================================

    const { data: students, error } =
      await supabase
        .from("profiles")
        .select(`
          id,
          name,
          email,
          created_at
        `)
        .eq("role", "student")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // =========================================
    // FETCH SUBMISSIONS
    // =========================================

    const { data: submissions } =
      await supabase
        .from("submissions")
        .select(`
          id,
          student_id,
          status
        `);

    // =========================================
    // BUILD STUDENT DATA
    // =========================================

    const finalStudents =
      students.map((student) => {
        const studentSubs =
          submissions?.filter(
            (s) =>
              s.student_id === student.id
          ) || [];

        const totalExams =
          studentSubs.length;

        const attended =
          studentSubs.filter(
            (s) =>
              s.status === "submitted" ||
              s.status === "evaluated"
          ).length;

        const attendance =
          totalExams > 0
            ? Math.round(
                (attended / totalExams) *
                  100
              )
            : 0;

        return {
          ...student,
          attendance,
          status:
            attended > 0
              ? "Evaluated"
              : "Pending",
        };
      });

    return NextResponse.json(
      finalStudents
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}