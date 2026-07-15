import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/app/lib/auth"; // your existing session helper

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: exams, error } = await supabaseAdmin
    .from("mcq_exams")
    .select("id, title, duration_min, marks_per_q, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: submissions } = await supabaseAdmin
    .from("mcq_submissions")
    .select("exam_id, status, score, total_marks")
    .eq("student_id", user.id);

  const submissionMap: Record<string, any> = {};
  (submissions || []).forEach((s) => (submissionMap[s.exam_id] = s));

  const enriched = exams.map((e) => {
    const sub = submissionMap[e.id];
    return {
      ...e,
      attempt_status: sub ? sub.status : "not_attempted",
      // Only expose score if approved — belt-and-suspenders even though
      // the client shouldn't render it otherwise.
      score: sub?.status === "approved" ? sub.score : null,
      total_marks: sub?.status === "approved" ? sub.total_marks : null,
    };
  });

  return NextResponse.json({ exams: enriched });
}