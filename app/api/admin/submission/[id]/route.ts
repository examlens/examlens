import { supabase } from "@/app/lib/supabase";

export async function GET(req: Request) {

console.log("HIT API FILE");

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // 🔥 THIS IS THE KEY FIX

  console.log("🔥 EXTRACTED ID:", id);

  if (!id || id === "submission") {
    return new Response(
      JSON.stringify({ error: "Submission ID missing" }),
      { status: 400 }
    );
  }

 const { data, error } = await supabase
  .from("submissions")
  .select(`
    id,
    status,
    total_score,

    users (
      id,
      name
    ),

    exams (
      title
    ),

    submission_answers!submission_answers_submission_id_fkey (
      id,
      question_id,
      answer,
      score,
      feedback,

      questions!submission_answers_question_id_fkey (
        question,
        marks
      )
    )
  `)
  .eq("id", id)
  .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify(data), {
    status: 200,
  });
}