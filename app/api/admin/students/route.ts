import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    // =====================================================
    // ✅ GET ALL STUDENTS
    // =====================================================

    const { data: students, error } =
      await supabase
        .from("profiles")
        .select(`
          id,
          name,
          email,
          created_at,
          role
        `)
        .eq("role", "student")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(error);

      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 500 }
      );
    }

    // =====================================================
    // ✅ GET SUBMISSIONS
    // =====================================================

    const {
      data: submissions,
      error: submissionError,
    } = await supabase
      .from("submissions")
      .select(`
        student_id,
        status
      `);

    if (submissionError) {
      console.error(submissionError);

      return new Response(
        JSON.stringify({
          error:
            submissionError.message,
        }),
        { status: 500 }
      );
    }

    // =====================================================
    // ✅ FORMAT STUDENTS
    // =====================================================

    const formatted =
      students?.map(
        (student: any, index: number) => {
          const studentSubs =
            submissions?.filter(
              (s: any) =>
                s.student_id ===
                student.id
            ) || [];

          const totalExams =
            studentSubs.length;

          const completedExams =
            studentSubs.filter(
              (s: any) =>
                s.status ===
                  "submitted" ||
                s.status ===
                  "evaluated"
            ).length;

          // =====================================================
          // ✅ ATTENDANCE LOGIC
          // =====================================================

          const attendance =
            totalExams > 0
              ? Math.round(
                  (completedExams /
                    totalExams) *
                    100
                )
              : 0;

          // =====================================================
          // ✅ STATUS
          // =====================================================

          let status = "Not Submitted";

          if (
            studentSubs.some(
              (s: any) =>
                s.status ===
                "evaluated"
            )
          ) {
            status = "Evaluated";
          } else if (
            studentSubs.some(
              (s: any) =>
                s.status ===
                "submitted"
            )
          ) {
            status = "Pending";
          }

          // =====================================================
          // ✅ RANDOM UI COLORS
          // =====================================================

          const colors = [
            "from-orange-500 to-red-500",
            "from-cyan-500 to-blue-600",
            "from-purple-500 to-indigo-600",
            "from-green-500 to-emerald-600",
            "from-pink-500 to-rose-600",
            "from-yellow-500 to-orange-600",
          ];

          return {
            id: student.id,
            name:
              student.name ||
              "Student",

            email:
              student.email || "",

            created_at:
              student.created_at,

            attendance,

            exams_attempted:
              completedExams,

            total_exams:
              totalExams,

            status,

            avatar:
              student.name
                ?.charAt(0)
                ?.toUpperCase() || "S",

            avatarColor:
              colors[
                index %
                  colors.length
              ],
          };
        }
      ) || [];

    // =====================================================
    // ✅ RETURN RESPONSE
    // =====================================================

    return new Response(
      JSON.stringify(formatted),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (err: any) {
    console.error(
      "🔥 STUDENT FETCH ERROR:",
      err
    );

    return new Response(
      JSON.stringify({
        error:
          err.message ||
          "Server Error",
      }),
      { status: 500 }
    );
  }
}

// =====================================================
// ✅ DELETE STUDENT
// =====================================================

export async function DELETE(
  req: Request
) {
  try {
    const { student_id } =
      await req.json();

    // =====================================================
    // ✅ VALIDATION
    // =====================================================

    if (!student_id) {
      return new Response(
        JSON.stringify({
          error:
            "student_id required",
        }),
        { status: 400 }
      );
    }

    // =====================================================
    // ✅ DELETE SUBMISSIONS
    // =====================================================

    const {
      error: submissionDeleteError,
    } = await supabase
      .from("submissions")
      .delete()
      .eq("student_id", student_id);

    if (submissionDeleteError) {
      console.error(
        submissionDeleteError
      );
    }

    // =====================================================
    // ✅ DELETE RESULTS
    // =====================================================

    const {
      error: resultDeleteError,
    } = await supabase
      .from("results")
      .delete()
      .eq("student_id", student_id);

    if (resultDeleteError) {
      console.error(
        resultDeleteError
      );
    }

    // =====================================================
    // ✅ DELETE PROFILE
    // =====================================================

    const { error } =
      await supabase
        .from("profiles")
        .delete()
        .eq("id", student_id);

    if (error) {
      console.error(error);

      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 500 }
      );
    }

    // =====================================================
    // ✅ SUCCESS
    // =====================================================

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Student removed successfully",
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error(
      "🔥 DELETE ERROR:",
      err
    );

    return new Response(
      JSON.stringify({
        error:
          err.message ||
          "Delete failed",
      }),
      { status: 500 }
    );
  }
}