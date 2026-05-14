import { supabase } from "@/app/lib/supabase";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const { data, error } =
      await supabase
        .from("submissions")
        .select(`
          *,
          users!submissions_student_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq("exam_id", id)
        .order("created_at", {
          ascending: false,
        });

    if (error) throw error;

    return new Response(
      JSON.stringify(data || []),
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