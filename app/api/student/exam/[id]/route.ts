import { supabase } from "@/app/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;

    console.log("📥 Params:", params);
    console.log("📥 Exam ID:", examId);

    if (!examId) {
      return new Response(
        JSON.stringify({ error: "Exam ID missing" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("exam_questions")
      .select(`
        question_id,
        questions (
          id,
          question,
          marks
        )
      `)
      .eq("exam_id", examId);

    if (error) {
      console.error("❌ Supabase error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    const formatted = (data || []).map((item: any) => ({
      id: item.questions.id,
      question: item.questions.question,
      marks: item.questions.marks,
    }));

    console.log("✅ Questions:", formatted);

    return new Response(JSON.stringify(formatted), { status: 200 });

  } catch (err: any) {
    console.error("❌ API crash:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}