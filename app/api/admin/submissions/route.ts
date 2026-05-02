import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select(`
  id,
  created_at,
  status,
  total_score,
  exams(title),
  users!submissions_student_id_fkey(name)
`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(data || []), {
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}