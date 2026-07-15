import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

// GET — list all exams with question counts
export async function GET(req: NextRequest) {
  const { data: exams, error } = await supabaseAdmin
    .from("mcq_exams")
    .select("id, title, duration_min, marks_per_q, status, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get question counts per exam in one query rather than looping
  const { data: mappings } = await supabaseAdmin
    .from("mcq_exam_questions")
    .select("exam_id");

  const counts: Record<string, number> = {};
  (mappings || []).forEach((m) => {
    counts[m.exam_id] = (counts[m.exam_id] || 0) + 1;
  });

  const enriched = exams.map((e) => ({
    ...e,
    question_count: counts[e.id] || 0,
  }));

  return NextResponse.json({ exams: enriched });
}

// POST — create exam + attach selected questions
// Expected body: { title, duration_min, marks_per_q, question_ids: string[] }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, duration_min, marks_per_q, question_ids } = body;

  if (!title || !duration_min || !marks_per_q) {
    return NextResponse.json({ error: "title, duration_min, marks_per_q are required" }, { status: 400 });
  }
  if (!Array.isArray(question_ids) || question_ids.length === 0) {
    return NextResponse.json({ error: "Select at least one question" }, { status: 400 });
  }

  // 1. Create the exam (defaults to 'draft')
  const { data: exam, error: examError } = await supabaseAdmin
    .from("mcq_exams")
    .insert({ title, duration_min, marks_per_q })
    .select("id")
    .single();

  if (examError) {
    return NextResponse.json({ error: examError.message }, { status: 500 });
  }

  // 2. Batch-insert the grouping rows with order preserved
  const mappingRows = question_ids.map((qid: string, idx: number) => ({
    exam_id: exam.id,
    question_id: qid,
    order_index: idx,
  }));

  const { error: mappingError } = await supabaseAdmin
    .from("mcq_exam_questions")
    .insert(mappingRows);

  if (mappingError) {
    // Roll back the exam if the mapping insert fails, so we don't
    // leave an empty/broken exam behind.
    await supabaseAdmin.from("mcq_exams").delete().eq("id", exam.id);
    return NextResponse.json({ error: mappingError.message }, { status: 500 });
  }

  return NextResponse.json({ exam_id: exam.id, question_count: mappingRows.length });
}