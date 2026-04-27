import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  const { exam_id, question_ids } = await req.json();

  console.log("ASSIGN DEBUG:", exam_id, question_ids);

  const payload = question_ids.map((qid: string) => ({
    exam_id,
    question_id: qid,
  }));

  const { data, error } = await supabase
    .from("exam_questions")
    .insert(payload)
    .select();

  console.log("INSERT RESULT:", data, error);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}