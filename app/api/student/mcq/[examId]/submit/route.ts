import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/app/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { examId: string } }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const answers: Record<string, string> = body.answers || {};

  // 1. Load the existing in-progress submission
  const { data: submission, error: subError } = await supabaseAdmin
    .from("mcq_submissions")
    .select("*")
    .eq("exam_id", params.examId)
    .eq("student_id", user.id)
    .single();

  if (subError || !submission) {
    return NextResponse.json({ error: "No attempt found for this exam" }, { status: 404 });
  }
  if (submission.status !== "in_progress") {
    // Blocks re-submission — already scored/approved
    return NextResponse.json({ error: "This exam has already been submitted" }, { status: 409 });
  }

  // 2. Load exam config + correct answers (server-side only)
  const { data: exam } = await supabaseAdmin
    .from("mcq_exams")
    .select("marks_per_q")
    .eq("id", params.examId)
    .single();

  const { data: mappings, error: mapError } = await supabaseAdmin
    .from("mcq_exam_questions")
    .select("question_id, mcq_questions(correct_option)")
    .eq("exam_id", params.examId);

  if (mapError || !exam) {
    return NextResponse.json({ error: "Could not load exam data" }, { status: 500 });
  }

  // 3. Score
  let correctCount = 0;
  mappings.forEach((m: any) => {
    const submittedAnswer = (answers[m.question_id] || "").toLowerCase();
    if (submittedAnswer === m.mcq_questions.correct_option) {
      correctCount += 1;
    }
  });

  const totalMarks = mappings.length * exam.marks_per_q;
  const score = correctCount * exam.marks_per_q;

  // 4. Save result — status moves to 'evaluated', awaiting admin approval
  const { error: updateError } = await supabaseAdmin
    .from("mcq_submissions")
    .update({
      answers,
      score,
      total_marks: totalMarks,
      status: "evaluated",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", submission.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // Deliberately do NOT return score here — student sees it only after admin approval.
  return NextResponse.json({ success: true, message: "Exam submitted successfully" });
}