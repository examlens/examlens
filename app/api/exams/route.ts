import { supabase } from "@/app/lib/supabase";

// 👉 CREATE EXAM
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, description, duration } = body;

    // Basic validation
    if (!title || !duration) {
      return new Response(
        JSON.stringify({ error: "Title and duration are required" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("exams")
      .insert([
        {
          title,
          description,
          duration,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Exam created successfully",
        data,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Server Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

// 👉 GET ALL EXAMS
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}