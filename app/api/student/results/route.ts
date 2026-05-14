import { supabase } from "@/app/lib/supabase";

export async function GET(req: Request) {
  try {
    // ==========================================
    // GET TOKEN
    // ==========================================

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

    const token =
      authHeader.replace("Bearer ", "");

    // ==========================================
    // GET USER
    // ==========================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Invalid user",
        }),
        { status: 401 }
      );
    }

    // ==========================================
    // FETCH RESULTS
    // ==========================================

    const { data, error } =
      await supabase
        .from("submissions")
        .select(`
          id,
          total_score,
          feedback,
          mistakes,
          knowledge_level,
          evaluated,
          evaluated_at,
          status,

          exams (
            title
          )
        `)
        .eq("student_id", user.id)
        .order("evaluated_at", {
          ascending: false,
        });

    if (error) {
      throw error;
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