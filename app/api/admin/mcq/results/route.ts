import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

// GET — list submissions, optionally filtered by status
// e.g. /api/admin/mcq/results?status=evaluated
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");

  let query = supabaseAdmin
    .from("mcq_submissions")
    .select(`
      id, exam_id, student_id, score, total_marks, status,
      started_at, submitted_at, approved_at,
      mcq_exams(title),
      profiles(email)
    `)
    .order("submitted_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  } else {
    // Default: show anything past in_progress, since admin doesn't
    // need to see attempts still being taken.
    query = query.in("status", ["submitted", "evaluated", "approved"]);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = data.map((r: any) => ({
    id: r.id,
    exam_id: r.exam_id,
    exam_title: r.mcq_exams?.title,
    student_id: r.student_id,
    student_email: r.profiles?.email,
    score: r.score,
    total_marks: r.total_marks,
    status: r.status,
    submitted_at: r.submitted_at,
    approved_at: r.approved_at,
  }));

  return NextResponse.json({ results });
}