import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exam_id, question_ids } = body;

    if (!exam_id || !question_ids?.length) {
      return new Response(
        JSON.stringify({ error: "Missing data" }),
        { status: 400 }
      );
    }

    // Convert to insert format
    const rows = question_ids.map((qId: string) => ({
      exam_id,
      question_id: qId,
    }));

    const { error } = await supabase
      .from("exam_questions")
      .insert(rows);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ message: "Questions assigned successfully" }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}