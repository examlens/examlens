import { supabase } from "@/app/lib/supabase";

// ✅ GET - fetch all questions
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("❌ GET ERROR:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
    });
  } catch (err) {
    console.log("❌ SERVER ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}

// ✅ POST - ADD QUESTION (THIS WAS MISSING)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming Data:", body);

    const { question, marks, category } = body;

    // 🔒 Validation
    if (!question  || !marks || !category) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    // ✅ Insert into Supabase
    const { data, error } = await supabase
      .from("questions")
      .insert([
        {
          question,
          marks: Number(marks),
          category,
        },
      ])
      .select();

    if (error) {
      console.log("❌ INSERT ERROR:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    console.log("✅ INSERT SUCCESS:", data);

    return new Response(
      JSON.stringify({
        message: "Question added successfully",
        data,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.log("❌ POST ERROR:", err.message);

    return new Response(
      JSON.stringify({
        error: "Insert failed",
        details: err.message,
      }),
      { status: 500 }
    );
  }
}

// ✅ DELETE (optional but useful)
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: "ID required" }), {
        status: 400,
      });
    }

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("❌ DELETE ERROR:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Deleted successfully" }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Delete failed" }), {
      status: 500,
    });
  }
}