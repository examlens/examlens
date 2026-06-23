import { supabase } from "@/app/lib/supabase";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ✅ NEXTJS 15 FIX
    const { id } = await context.params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Submission ID missing" }),
        { status: 400 }
      );
    }

    // ✅ FETCH SINGLE SUBMISSION
    const { data, error } = await supabase
      .from("submissions")
      .select(`
        *,
        exams (
          id,
          title,
          description,
          duration,
          reference_file_url
        ),
        users!submissions_student_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // ✅ NO DATA
    if (!data) {
      return new Response(
        JSON.stringify({ error: "Submission not found" }),
        { status: 404 }
      );
    }

    // ✅ FIX ARRAY RESPONSE
    const exam = Array.isArray(data.exams) ? data.exams[0] : data.exams;
    const user = Array.isArray(data.users) ? data.users[0] : data.users;

    const formatted = {
      ...data,
      exams: exam || null,
      users: user || null,
    };

    return new Response(
      JSON.stringify(formatted),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err.message || "Internal server error",
      }),
      { status: 500 }
    );
  }
}
