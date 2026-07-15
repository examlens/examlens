import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data: submission, error } = await supabaseAdmin
    .from("mcq_submissions")
    .select(`
      id, exam_id, student_id, answers, score, total_marks, status,
      mcq_exams(title, marks_per_q),
      profiles(email)
    `)
    .eq("id", params.id)
    .single();

  if (error || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const { data: mappings } = await supabaseAdmin
    .from("mcq_exam_questions")
    .select("order_index, mcq_questions(id, question_text, option_a, option_b, option_c, option_d, correct_option)")
    .eq("exam_id", submission.exam_id)
    .order("order_index", { ascending: true });

  const breakdown = (mappings || []).map((m: any) => {
    const q = m.mcq_questions;
    const studentAnswer = (submission.answers as any)?.[q.id] || null;
    return {
      question_text: q.question_text,
      options: { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d },
      correct_option: q.correct_option,
      student_answer: studentAnswer,
      is_correct: studentAnswer === q.correct_option,
    };
  });

  return NextResponse.json({
    submission: {
      id: submission.id,
      exam_title: (submission as any).mcq_exams?.title,
      student_email: (submission as any).profiles?.email,
      score: submission.score,
      total_marks: submission.total_marks,
      status: submission.status,
    },
    breakdown,
  });
}