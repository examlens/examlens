import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming Body:", body);

    const { exam_id, answers } = body;

    // ⚠️ TEMP: hardcode student_id (until auth is added)
    const student_id = "9a66d6ad-9cfd-46f9-9e86-4c6e621d203f";

    if (!exam_id || !answers || !student_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // ✅ 1. Create submission
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .insert({
        exam_id,
        student_id,
        status: "pending",
      })
      .select()
      .single();

    if (subError) {
      console.error("❌ Submission insert error:", subError);
      throw subError;
    }

    console.log("✅ Submission created:", submission);

    // ✅ 2. Insert answers
    const answerRows = Object.entries(answers).map(
      ([question_id, answer]) => ({
        submission_id: submission.id,
        question_id,
        answer,
      })
    );

    const { error: ansError } = await supabase
      .from("submission_answers")
      .insert(answerRows);

    if (ansError) {
      console.error("❌ Answers insert error:", ansError);
      throw ansError;
    }

    console.log("✅ Answers inserted");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (err: any) {
    console.error("🔥 SUBMIT ERROR:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}