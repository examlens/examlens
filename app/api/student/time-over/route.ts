import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const submissionId =
      body.submission_id;

    const { error } = await supabase
      .from("submissions")
      .update({
        status: "time_over",

        is_completed: true,
      })
      .eq("id", submissionId);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err.message,
      }),
      {
        status: 500,
      }
    );
  }
}