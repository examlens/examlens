import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

// GET — list all questions in the bank
export async function GET(req: NextRequest) {
  const { data, error } = await supabaseAdmin
    .from("mcq_questions")
    .select("id, question_text, option_a, option_b, option_c, option_d, correct_option, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ questions: data });
}

// POST — bulk insert questions
// Expected body: { questions: [{ question_text, option_a, option_b, option_c, option_d, correct_option }, ...] }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { questions } = body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "questions must be a non-empty array" }, { status: 400 });
  }

  // Validate every row before inserting any — fail the whole batch together
  // rather than partially inserting, so admin gets one clear error to fix.
  const validOptions = ["a", "b", "c", "d"];
  const errors: string[] = [];

  const rows = questions.map((q: any, idx: number) => {
    const missing = ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_option"]
      .filter((field) => !q[field] || String(q[field]).trim() === "");

    if (missing.length > 0) {
      errors.push(`Row ${idx + 1}: missing ${missing.join(", ")}`);
    }

    const correct = String(q.correct_option || "").trim().toLowerCase();
    if (q.correct_option && !validOptions.includes(correct)) {
      errors.push(`Row ${idx + 1}: correct_option must be one of a/b/c/d`);
    }

    return {
      question_text: q.question_text?.trim(),
      option_a: q.option_a?.trim(),
      option_b: q.option_b?.trim(),
      option_c: q.option_c?.trim(),
      option_d: q.option_d?.trim(),
      correct_option: correct,
    };
  });

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("mcq_questions")
    .insert(rows)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: data.length, ids: data.map((d) => d.id) });
}