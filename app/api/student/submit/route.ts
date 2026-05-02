import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exam_id, answer_file_url } = body;

    // ✅ VALIDATION
    if (!exam_id || !answer_file_url) {
      return new Response(
        JSON.stringify({ error: "Missing exam_id or file" }),
        { status: 400 }
      );
    }

    // ✅ 1. GET AUTH TOKEN FROM HEADER
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: No token" }),
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // ✅ 2. GET USER USING TOKEN (IMPORTANT FIX)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user session" }),
        { status: 401 }
      );
    }

    const student_id = user.id;

    console.log("👤 Logged-in student:", student_id);

    // ✅ 3. CHECK IF ALREADY SUBMITTED
    const { data: existing, error: checkError } = await supabase
      .from("submissions")
      .select("id")
      .eq("exam_id", exam_id)
      .eq("student_id", student_id);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({
          error: "You already attempted this exam",
        }),
        { status: 400 }
      );
    }

    // ✅ 4. CREATE SUBMISSION
    const { data, error } = await supabase
      .from("submissions")
      .insert([
        {
          exam_id,
          student_id,
          answer_file_url,
          status: "submitted",
          total_score: null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Submission saved:", data.id);

    return new Response(
      JSON.stringify({
        success: true,
        submission_id: data.id,
      }),
      { status: 200 }
    );

  } catch (err: any) {
    console.error("🔥 SUBMIT ERROR:", err);

    return new Response(
      JSON.stringify({
        error: err.message || "Submission failed",
      }),
      { status: 500 }
    );
  }
}