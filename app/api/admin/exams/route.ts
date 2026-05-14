import { supabase } from "@/app/lib/supabase";

// ======================================================
// ✅ GET ALL EXAMS
// ======================================================

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("exams")
      .select(`
        *,
        exam_questions (
          id
        ),
        submissions (
          id,
          status
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    // ✅ FORMAT RESPONSE
    const formatted = (data || []).map(
      (exam: any) => ({
        ...exam,

        question_count:
          exam.exam_questions?.length || 0,

        submission_count:
          exam.submissions?.length || 0,
      })
    );

    return new Response(
      JSON.stringify(formatted),
      {
        status: 200,
      }
    );
  } catch (err: any) {
    console.error(
      "🔥 FETCH EXAMS ERROR:",
      err
    );

    return new Response(
      JSON.stringify({
        error: err.message,
      }),
      { status: 500 }
    );
  }
}

// ======================================================
// ✅ CREATE EXAM
// ======================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      duration,
      reference_file_url,
    } = body;

    // ✅ VALIDATION
    if (!title?.trim()) {
      return new Response(
        JSON.stringify({
          error: "Title is required",
        }),
        { status: 400 }
      );
    }

    // ✅ CREATE EXAM
    const { data, error } = await supabase
      .from("exams")
      .insert([
        {
          title: title.trim(),

          description:
            description?.trim() || null,

          duration:
            Number(duration) || 10,

          reference_file_url:
            reference_file_url || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log(
      "✅ Exam created:",
      data.id
    );

    return new Response(
      JSON.stringify({
        success: true,
        exam: data,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error(
      "🔥 CREATE EXAM ERROR:",
      err
    );

    return new Response(
      JSON.stringify({
        error: err.message,
      }),
      { status: 500 }
    );
  }
}

// ======================================================
// ✅ DELETE EXAM
// ======================================================

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);

    const examId =
      url.searchParams.get("id");

    // ✅ VALIDATION
    if (!examId) {
      return new Response(
        JSON.stringify({
          error: "Exam ID missing",
        }),
        { status: 400 }
      );
    }

    console.log(
      "🗑️ Deleting exam:",
      examId
    );

    // ======================================================
    // ✅ DELETE RELATED EXAM QUESTIONS
    // ======================================================

    const {
      error: examQuestionsError,
    } = await supabase
      .from("exam_questions")
      .delete()
      .eq("exam_id", examId);

    if (examQuestionsError) {
      throw examQuestionsError;
    }

    // ======================================================
    // ✅ DELETE RELATED SUBMISSIONS
    // ======================================================

    const {
      error: submissionError,
    } = await supabase
      .from("submissions")
      .delete()
      .eq("exam_id", examId);

    if (submissionError) {
      throw submissionError;
    }

    // ======================================================
    // ✅ DELETE EXAM
    // ======================================================

    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", examId);

    if (error) throw error;

    console.log(
      "✅ Exam deleted successfully"
    );

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Exam deleted successfully",
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error(
      "🔥 DELETE EXAM ERROR:",
      err
    );

    return new Response(
      JSON.stringify({
        error: err.message,
      }),
      { status: 500 }
    );
  }
}