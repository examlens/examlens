import { supabase } from "@/app/lib/supabase";

// ✅ GET ALL EXAMS
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}

// ✅ CREATE EXAM
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🔥 NEW FIELD ADDED
    const {
      title,
      description,
      duration,
      reference_file_url,
    } = body;

    // ✅ VALIDATION
    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        { status: 400 }
      );
    }

    // ✅ INSERT INTO DB
    const { data, error } = await supabase
      .from("exams")
      .insert([
        {
          title,
          description: description || null,
          duration: duration || 10, // default 10 mins
          reference_file_url: reference_file_url || null, // 🔥 IMPORTANT
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        exam: data,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("🔥 CREATE EXAM ERROR:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}