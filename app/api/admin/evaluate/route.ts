import { supabase } from "@/app/lib/supabase";

// ✅ GET ALL EXAMS
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ GET EXAMS ERROR:", error);
      throw error;
    }

    return new Response(JSON.stringify(data || []), {
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err.message || "Failed to fetch exams",
      }),
      { status: 500 }
    );
  }
}

// ✅ CREATE EXAM
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📥 CREATE EXAM BODY:", body);

    const {
      title,
      description,
      duration,
      reference_file_url,
    } = body;

    // ✅ VALIDATION
    if (!title || title.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        { status: 400 }
      );
    }

    // ✅ CLEAN DATA
    const cleanDuration = duration ? Number(duration) : 10;

    // ✅ INSERT INTO DB
    const { data, error } = await supabase
      .from("exams")
      .insert([
        {
          title: title.trim(),
          description: description?.trim() || null,
          duration: cleanDuration,
          reference_file_url: reference_file_url || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ INSERT ERROR:", error);
      throw error;
    }

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
      JSON.stringify({
        error: err.message || "Failed to create exam",
      }),
      { status: 500 }
    );
  }
}