import { supabase } from "@/app/lib/supabase";

export async function GET(req: Request) {
  try {
    // ✅ Extract ID from URL manually
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const examId = segments[segments.length - 1];

    console.log("Extracted Exam ID:", examId); // DEBUG

    if (!examId || examId === "undefined") {
      return new Response(
        JSON.stringify({ error: "Invalid exam ID" }),
        { status: 400 }
      );
    }

    // 1. Get exam
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examError) {
      return new Response(JSON.stringify({ error: examError.message }), {
        status: 500,
      });
    }

    // 2. Get linked question IDs
    const { data: examQuestions, error: eqError } = await supabase
      .from("exam_questions")
      .select("question_id")
      .eq("exam_id", examId);

    if (eqError) {
      return new Response(JSON.stringify({ error: eqError.message }), {
        status: 500,
      });
    }

    const questionIds = examQuestions.map((q) => q.question_id);

    // 3. Get questions
    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select("*")
      .in("id", questionIds);

    if (qError) {
      return new Response(JSON.stringify({ error: qError.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({
        exam,
        questions,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}