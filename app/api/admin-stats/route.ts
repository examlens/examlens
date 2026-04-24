import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    const { data: submissions } = await supabase
      .from("submissions")
      .select("*");

    const { data: results } = await supabase
      .from("results")
      .select("*");

    const totalSubmissions = submissions?.length || 0;
    const evaluated = results?.length || 0;
    const pending = totalSubmissions - evaluated;

    const avgScore =
      results && results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + r.score, 0) /
              results.length
          )
        : 0;

    return new Response(
      JSON.stringify({
        totalSubmissions,
        evaluated,
        pending,
        avgScore,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch stats" }),
      { status: 500 }
    );
  }
}