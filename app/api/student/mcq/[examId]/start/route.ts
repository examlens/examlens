import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/app/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { examId: string } }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Confirm exam exists and is published
  const { data: exam, error: examError } = await supabaseAdmin
    .from("mcq_exams")
    .select("id, duration_min, status")
    .eq("id", params.examId)
    .single();

  if (examError || !exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  if (exam.status !== "published") {
    return NextResponse.json({ error: "This exam is not available" }, { status: 403 });
  }

  // Check for an existing attempt (unique constraint means at most one row)
  const { data: existing } = await supabaseAdmin
    .from("mcq_submissions")
    .select("*")
    .eq("exam_id", params.examId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.status !== "in_progress") {
      return NextResponse.json({ error: "You have already attempted this exam" }, { status: 409 });
    }
    // Resume: return the existing in-progress attempt as-is
    return NextResponse.json({ submission: existing, resumed: true });
  }

  const { data: created, error: insertError } = await supabaseAdmin
    .from("mcq_submissions")
    .insert({ exam_id: params.examId, student_id: user.id })
    .select("*")
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ submission: created, resumed: false });
}