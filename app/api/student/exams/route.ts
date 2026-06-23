import { supabase } from "@/app/lib/supabase";

export async function GET(req: Request) {
  try {
    // ==================================================
    // ✅ GET AUTH TOKEN
    // ==================================================

    const authHeader =
      req.headers.get("authorization");

    let student_id = "";

    // ==================================================
    // ✅ GET LOGGED-IN USER
    // ==================================================

    if (authHeader) {
      const token = authHeader.replace(
        "Bearer ",
        ""
      );

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(
        token
      );

      if (!authError && user) {
        student_id = user.id;
      }
    }

    // ==================================================
    // ✅ FETCH ALL EXAMS
    // ==================================================

    const {
      data: exams,
      error: examsError,
    } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (examsError) {
      return new Response(
        JSON.stringify({
          error:
            examsError.message,
        }),
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // ✅ IF NO LOGIN → RETURN EXAMS ONLY
    // ==================================================

    if (!student_id) {
      return new Response(
        JSON.stringify(exams || []),
        {
          status: 200,
        }
      );
    }

    // ==================================================
    // ✅ FETCH STUDENT SUBMISSIONS
    // ==================================================

    const {
      data: submissions,
      error: submissionsError,
    } = await supabase
      .from("submissions")
      .select(`
        exam_id,
        status,
        is_completed
      `)
      .eq("student_id", student_id);

    if (submissionsError) {
      return new Response(
        JSON.stringify({
          error:
            submissionsError.message,
        }),
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // ✅ FORMAT EXAMS
    // ==================================================

    const formattedExams = (
      exams || []
    ).map((exam: any) => {
      const submission =
        submissions?.find(
          (s: any) =>
            s.exam_id === exam.id
        );

      return {
        ...exam,

        is_completed:
          submission
            ?.is_completed ||
          submission?.status ===
            "submitted" ||
          submission?.status ===
            "evaluated",
      };
    });

    // ==================================================
    // ✅ RETURN RESPONSE
    // ==================================================

    return new Response(
      JSON.stringify(
        formattedExams
      ),
      {
        status: 200,
      }
    );
  } catch (err: any) {

    return new Response(
      JSON.stringify({
        error:
          err.message ||
          "Server error",
      }),
      {
        status: 500,
      }
    );
  }
}