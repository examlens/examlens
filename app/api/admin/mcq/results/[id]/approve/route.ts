import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/app/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedUser(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: submission, error: fetchError } = await supabaseAdmin
    .from("mcq_submissions")
    .select("id, status")
    .eq("id", params.id)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (submission.status !== "evaluated") {
    return NextResponse.json(
      { error: `Cannot approve a submission with status '${submission.status}'` },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("mcq_submissions")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: admin.id,
    })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}