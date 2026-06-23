import { supabase } from "@/app/lib/supabase";

// =====================================================
// GET QUESTIONS
// =====================================================

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {

      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
      }
    );
  } catch (err) {

    return new Response(
      JSON.stringify({
        error: "Server error",
      }),
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// ADD QUESTION
// =====================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      question,
      marks,
      category,
      subject,
      difficulty,
    } = body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (
      !question ||
      !marks ||
      !category ||
      !subject ||
      !difficulty
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Question, marks, category, subject and difficulty are required",
        }),
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // INSERT
    // =====================================================

    const { data, error } =
      await supabase
        .from("questions")
        .insert([
          {
            question,
            marks: Number(marks),
            category,
            subject,
            difficulty,
          },
        ])
        .select();

    if (error) {

      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Question added successfully",
        data,
      }),
      {
        status: 200,
      }
    );
  } catch (err: any) {

    return new Response(
      JSON.stringify({
        error: "Insert failed",
        details: err.message,
      }),
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// DELETE QUESTION
// =====================================================

export async function DELETE(
  req: Request
) {
  try {
    const { id } =
      await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({
          error: "ID required",
        }),
        {
          status: 400,
        }
      );
    }

    const { error } =
      await supabase
        .from("questions")
        .delete()
        .eq("id", id);

    if (error) {

      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Question deleted successfully",
      }),
      {
        status: 200,
      }
    );
  } catch (err) {

    return new Response(
      JSON.stringify({
        error: "Delete failed",
      }),
      {
        status: 500,
      }
    );
  }
}