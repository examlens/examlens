import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/app/lib/auth";

// Expected body: { submission_ids: string[] }
export async function PATCH(req: NextRequest) {
  const admin = await getAuthenticatedUser(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { submission_ids } = body;

  if (!Array.isArray(submission_ids) || submission_ids.length === 0) {
    return NextResponse.json({ error: "submission_ids must be a non-empty array" }, { status: 400 });
  }

  // Only flip rows that are actually 'evaluated' — avoids accidentally
  // re-approving or touching in_progress rows if a stale ID sneaks in.
  const { data, error } = await supabaseAdmin
    .from("mcq_submissions")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: admin.id,
    })
    .in("id", submission_ids)
    .eq("status", "evaluated")
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ approved: data.length });
}