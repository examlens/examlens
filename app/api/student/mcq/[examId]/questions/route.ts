import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/app/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { examId: string } }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: exam } = await supabaseAdmin
    .from("mcq_exams")
    .select("id, title, duration_min, marks_per_q, status")
    .eq("id", params.examId)
    .single();

  if (!exam || exam.status !== "published") {
    return NextResponse.json({ error: "Exam not available" }, { status: 403 });
  }

  const { data: mappings, error } = await supabaseAdmin
    .from("mcq_exam_questions")
    .select("order_index, question_id, mcq_questions(id, question_text, option_a, option_b, option_c, option_d)")
    .eq("exam_id", params.examId)
    .order("order_index", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Explicitly strip anything beyond the safe fields — defense in depth
  // even though the select above already omits correct_option.
  const questions = mappings.map((m: any) => ({
    id: m.mcq_questions.id,
    question_text: m.mcq_questions.question_text,
    option_a: m.mcq_questions.option_a,
    option_b: m.mcq_questions.option_b,
    option_c: m.mcq_questions.option_c,
    option_d: m.mcq_questions.option_d,
  }));

  return NextResponse.json({ exam, questions });
}