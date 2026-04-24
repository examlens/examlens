import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { text, type, marks, model_answer } = body;

    const { data, error } = await supabase
      .from("questions")
      .insert([
        { text, type, marks, model_answer }
      ])
      .select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ message: "Question added", data }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}