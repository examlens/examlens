import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

// ======================================================
// GET STUDENTS
// ======================================================

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        role,
        name,
        email,
        attendance,
        avg_score,
        evaluation_status,
        created_at
      `)
      .eq("role", "student")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(
        "❌ Fetch Students Error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    const formattedStudents =
      (data || []).map(
        (student: any) => ({
          id: student.id,

          name:
            student.name &&
            student.name.trim() !== ""
              ? student.name
              : "Student",

          email:
            student.email &&
            student.email.trim() !== ""
              ? student.email
              : "No Email",

          attendance:
            Number(
              student.attendance
            ) || 0,

          avgScore:
            Number(
              student.avg_score
            ) || 0,

          status:
            student.evaluation_status &&
            student.evaluation_status.toLowerCase() ===
              "evaluated"
              ? "Evaluated"
              : "Pending",
        })
      );

    return NextResponse.json(
      formattedStudents,
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log(
      "❌ Server Error:",
      err
    );

    return NextResponse.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// DELETE STUDENT
// ======================================================

export async function DELETE(
  req: Request
) {
  try {
    const { id } =
      await req.json();

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Student ID required",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================================
    // DELETE RESULTS
    // ======================================================

    const {
      error: resultsError,
    } = await supabase
      .from("results")
      .delete()
      .eq("student_id", id);

    if (resultsError) {
      console.log(
        "❌ Results Delete Error:",
        resultsError
      );
    }

    // ======================================================
    // DELETE SUBMISSIONS
    // ======================================================

    const {
      error: submissionsError,
    } = await supabase
      .from("submissions")
      .delete()
      .eq("student_id", id);

    if (submissionsError) {
      console.log(
        "❌ Submissions Delete Error:",
        submissionsError
      );
    }

    // ======================================================
    // DELETE PROFILE
    // ======================================================

    const {
      error: profileError,
    } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
      console.log(
        "❌ Profile Delete Error:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            profileError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Student removed successfully",
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log(
      "❌ Server Error:",
      err
    );

    return NextResponse.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}