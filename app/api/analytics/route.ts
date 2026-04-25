import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    console.log("📊 Analytics API HIT");

    const { data: results, error: rErr } = await supabase
      .from("results")
      .select("*");

    if (rErr) throw rErr;

    const { data: submissions, error: sErr } = await supabase
      .from("submissions")
      .select("*");

    if (sErr) throw sErr;

    const { data: students, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student");

    if (pErr) throw pErr;

    console.log("✅ Data fetched");

    // ✅ DISTRIBUTION
    const distribution = {
      "90-100": 0,
      "80-89": 0,
      "70-79": 0,
      "60-69": 0,
      "<60": 0,
    };

    results?.forEach((r: any) => {
      const score = r.score || 0;

      if (score >= 90) distribution["90-100"]++;
      else if (score >= 80) distribution["80-89"]++;
      else if (score >= 70) distribution["70-79"]++;
      else if (score >= 60) distribution["60-69"]++;
      else distribution["<60"]++;
    });

    // ✅ LEADERBOARD
    const leaderboard: any[] = [];

    students?.forEach((s: any) => {
      const studentSubs = submissions?.filter(
        (sub: any) => sub.user_id === s.id
      );

      const scores = studentSubs?.map((sub: any) => {
        const res = results?.find(
          (r: any) => r.submission_id === sub.id
        );
        return res?.score || 0;
      });

      const avg =
        scores.length > 0
          ? scores.reduce((a: number, b: number) => a + b, 0) /
            scores.length
          : 0;

      leaderboard.push({
        name: s.email,
        score: Math.round(avg),
      });
    });

    leaderboard.sort((a, b) => b.score - a.score);

    // ✅ PERFORMANCE (TEMP SAFE)
    const performance = {
      knowledge: 80,
      memory: 70,
      analytical: 65,
      application: 75,
    };

    // ✅ SUBMISSION RATE
    const submissionRate = students?.length
      ? Math.round((submissions.length / students.length) * 100)
      : 0;

    return new Response(
      JSON.stringify({
        distribution,
        leaderboard,
        performance,
        submissionRate,
        insight: "System running in safe mode",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.log("❌ Analytics ERROR:", err);

    return new Response(
      JSON.stringify({
        error: "Analytics failed",
        details: err,
      }),
      { status: 500 }
    );
  }
}