import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exam_id, answer_file_url } = body;

    if (!exam_id || !answer_file_url) {
      return new Response(
        JSON.stringify({ error: "Missing exam_id or file" }),
        { status: 400 }
      );
    }

    // ✅ 1. GET TOKEN FROM HEADER
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No auth token" }),
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // ✅ 2. VERIFY USER USING TOKEN
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 401 }
      );
    }

    const student_id = user.id;

    console.log("👤 REAL USER:", student_id);

    // ✅ Only block if already SUBMITTED
    const { data: existingSubmission } = await supabase
      .from("submissions")
      .select("id, status")
      .eq("exam_id", exam_id)
      .eq("student_id", student_id)
      .maybeSingle();

    if (existingSubmission && existingSubmission.status === "submitted") {
      return new Response(
        JSON.stringify({
          error: "You already submitted this exam",
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
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, submission_id: data.id }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}