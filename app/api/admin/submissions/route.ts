import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    // ============================================
    // ✅ FETCH ALL SUBMISSIONS WITH EXAMS
    // ============================================

    const { data, error } = await supabase
      .from("submissions")
      .select(`
        id,
        exam_id,

        exams (
          id,
          title,
          description,
          duration
        )
      `);

    if (error) throw error;

    // ============================================
    // ✅ GROUP EXAMS
    // ============================================

    const groupedMap: any = {};

    for (const item of data || []) {
      const exam = Array.isArray(item.exams)
        ? item.exams[0]
        : item.exams;

      const examId = exam?.id;

      if (!examId) continue;

      if (!groupedMap[examId]) {
        groupedMap[examId] = {
          exam_id: exam.id,

          exam_title:
            exam.title || "Unknown Exam",

          description:
            exam.description || "",

          duration:
            exam.duration || 0,

          submission_count: 0,
        };
      }

      groupedMap[
        examId
      ].submission_count += 1;
    }

    return new Response(
      JSON.stringify(
        Object.values(groupedMap)
      ),
      {
        status: 200,
      }
    );
  } catch (err: any) {
    console.error(err);

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