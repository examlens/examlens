import { supabase } from "@/app/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing ID" }), {
      status: 400,
    });
  }

  try {
    const { data, error } = await supabase
      .from("submissions")
      .select(`
        id,
        status,
        total_score,
        users (name),
        exams (title),
        submission_answers (
          id,
          answer,
          score,
          feedback,
          questions (
            id,
            question,
            marks
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}