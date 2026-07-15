import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/app/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { examId: string } }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: submission, error } = await supabaseAdmin
    .from("mcq_submissions")
    .select(`
      id, exam_id, status, score, total_marks, answers, submitted_at, approved_at,
      mcq_exams(title, marks_per_q)
    `)
    .eq("exam_id", params.examId)
    .eq("student_id", user.id)
    .single();

  if (error || !submission) {
    return NextResponse.json({ error: "No attempt found for this exam" }, { status: 404 });
  }

  // Server-side gate: never return score/breakdown unless approved,
  // regardless of what the client asks for.
  if (submission.status !== "approved") {
    return NextResponse.json({
      status: submission.status,
      exam_title: (submission as any).mcq_exams?.title,
      message:
        submission.status === "in_progress"
          ? "You have not submitted this exam yet."
          : "Your result is pending admin approval.",
    });
  }

  // Approved: build the per-question breakdown for the student, but
  // still without leaking anything beyond what they answered vs. correct.
  const { data: mappings } = await supabaseAdmin
    .from("mcq_exam_questions")
    .select("order_index, mcq_questions(id, question_text, option_a, option_b, option_c, option_d, correct_option)")
    .eq("exam_id", params.examId)
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
    status: "approved",
    exam_title: (submission as any).mcq_exams?.title,
    score: submission.score,
    total_marks: submission.total_marks,
    submitted_at: submission.submitted_at,
    approved_at: submission.approved_at,
    breakdown,
  });
}