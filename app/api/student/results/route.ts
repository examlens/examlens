import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET(req: Request) {
  try {
    // ⚠️ For now (no auth), pass student_id via query
    const { searchParams } = new URL(req.url);
    const student_id = searchParams.get("student_id");

    if (!student_id) {
      return NextResponse.json(
        { error: "Missing student_id" },
        { status: 400 }
      );
    }

   const { data, error } = await supabase
  .from("submissions")
  .select(`
    id,
    status,
    total_score,
    exams(title),

    submission_answers!submission_answers_submission_id_fkey (
      id,
      answer,
      score,
      feedback,

      questions!submission_answers_question_id_fkey (
        question,
        marks
      )
    )
  `)
  .eq("student_id", student_id)
  .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}