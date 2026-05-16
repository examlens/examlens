import { supabase } from "@/app/lib/supabase";

export async function GET(req: Request) {
  try {
    // =========================================
    // AUTH
    // =========================================

    const authHeader =
      req.headers.get("authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401 }
      );
    }

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

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Invalid user",
        }),
        { status: 401 }
      );
    }

    // =========================================
    // FETCH RESULTS
    // =========================================

    const {
      data,
      error,
    } = await supabase
      .from("results")
      .select(`
        id,
        submission_id,
        exam_id,
        student_id,
        score,
        total_marks,
        feedback,
        mistakes,
        expected_answers,
        strong_areas,
        weak_areas,
        evaluated_at,
        exams (
          title
        )
      `)
      .eq("student_id", user.id)
      .order("evaluated_at", {
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

    return new Response(
      JSON.stringify({
        success: true,
        results: data || [],
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);

    return new Response(
      JSON.stringify({
        error:
          err.message ||
          "Failed to fetch results",
      }),
      { status: 500 }
    );
  }
}