import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*");

  const { data: results } = await supabase
    .from("results")
    .select("*");

  const totalExams = submissions?.length || 0;

  const avgScore =
    results && results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.score, 0) / results.length
        )
      : 0;

  return new Response(
    JSON.stringify({
      totalExams,
      avgScore,
      attendance: 92,
    })
  );
}