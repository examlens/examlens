import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { exam_id, question_ids } = body;

    if (!exam_id) {
      return new Response(
        JSON.stringify({ error: "exam_id is required" }),
        { status: 400 }
      );
    }

    if (!Array.isArray(question_ids) || question_ids.length === 0) {
      return new Response(
        JSON.stringify({
          error: "question_ids must be a non-empty array",
        }),
        { status: 400 }
      );
    }

    const rows = question_ids.map((question_id: string) => ({
      exam_id,
      question_id,
    }));

    const { error } = await supabase
      .from("exam_questions")
      .insert(rows);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err.message || "Failed to assign questions",
      }),
      { status: 500 }
    );
  }
}
