import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

// GET — full exam detail including its questions (with correct answers, admin view)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data: exam, error: examError } = await supabaseAdmin
    .from("mcq_exams")
    .select("*")
    .eq("id", params.id)
    .single();

  if (examError) return NextResponse.json({ error: examError.message }, { status: 404 });

  const { data: mappings, error: mapError } = await supabaseAdmin
    .from("mcq_exam_questions")
    .select("order_index, question_id, mcq_questions(*)")
    .eq("exam_id", params.id)
    .order("order_index", { ascending: true });

  if (mapError) return NextResponse.json({ error: mapError.message }, { status: 500 });

  return NextResponse.json({
    exam,
    questions: mappings.map((m: any) => ({ ...m.mcq_questions, order_index: m.order_index })),
  });
}

// PATCH — update exam fields (title, duration, marks, status) and/or replace question list
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { title, duration_min, marks_per_q, status, question_ids } = body;

  const updateFields: Record<string, any> = {};
  if (title !== undefined) updateFields.title = title;
  if (duration_min !== undefined) updateFields.duration_min = duration_min;
  if (marks_per_q !== undefined) updateFields.marks_per_q = marks_per_q;
  if (status !== undefined) updateFields.status = status;

  if (Object.keys(updateFields).length > 0) {
    const { error } = await supabaseAdmin
      .from("mcq_exams")
      .update(updateFields)
      .eq("id", params.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If question_ids is provided, replace the full mapping set
  if (Array.isArray(question_ids)) {
    const { error: deleteError } = await supabaseAdmin
      .from("mcq_exam_questions")
      .delete()
      .eq("exam_id", params.id);

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    if (question_ids.length > 0) {
      const rows = question_ids.map((qid: string, idx: number) => ({
        exam_id: params.id,
        question_id: qid,
        order_index: idx,
      }));

      const { error: insertError } = await supabaseAdmin
        .from("mcq_exam_questions")
        .insert(rows);

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE — remove an exam entirely (cascades to mappings + submissions via FK)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin
    .from("mcq_exams")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}