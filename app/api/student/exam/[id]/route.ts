import { supabase } from "@/app/lib/supabase";

export async function GET(req: Request) {
  try {
    // ✅ Extract exam ID
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const examId = segments[segments.length - 1];

    console.log("📥 Extracted examId:", examId);

    if (!examId) {
      return new Response(
        JSON.stringify({ error: "Exam ID missing" }),
        { status: 400 }
      );
    }

    // 🔥 TEMP: get any student (replace with auth later)
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .limit(1)
      .single();

    const student_id = user?.id;

    if (!student_id) {
      return new Response(
        JSON.stringify({ error: "Student not found" }),
        { status: 400 }
      );
    }

    // 🔥 1. CHECK EXISTING SUBMISSION (prevent reattempt)
    const { data: existing } = await supabase
      .from("submissions")
      .select("id, start_time, status")
      .eq("exam_id", examId)
      .eq("student_id", student_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({
          error: "You already attempted this exam",
        }),
        { status: 400 }
      );
    }

    // 🔥 2. GET EXAM DETAILS (duration)
    const { data: examData, error: examError } = await supabase
      .from("exams")
      .select("id, title, duration")
      .eq("id", examId)
      .single();

    if (examError || !examData) {
      return new Response(
        JSON.stringify({ error: "Exam not found" }),
        { status: 404 }
      );
    }

    // 🔥 3. FETCH QUESTIONS
    const { data: questionData, error: qError } = await supabase
      .from("exam_questions")
      .select(`
        question_id,
        questions (
          id,
          question,
          marks
        )
      `)
      .eq("exam_id", examId);

    if (qError) {
      return new Response(
        JSON.stringify({ error: qError.message }),
        { status: 500 }
      );
    }

    const questions = (questionData || []).map((item: any) => ({
      id: item.questions.id,
      question: item.questions.question,
      marks: item.questions.marks,
    }));

    // 🔥 4. CREATE NEW SUBMISSION (START EXAM)
    const startTime = new Date();

    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .insert([
        {
          exam_id: examId,
          student_id,
          status: "in_progress",
          start_time: startTime.toISOString(),
        },
      ])
      .select()
      .single();

    if (subError) {
      return new Response(
        JSON.stringify({ error: subError.message }),
        { status: 500 }
      );
    }

    console.log("✅ Exam started:", submission.id);

    // 🔥 FINAL RESPONSE (VERY IMPORTANT)
    return new Response(
      JSON.stringify({
        exam_id: examId,
        title: examData.title,
        duration: examData.duration || 10,
        start_time: submission.start_time,
        submission_id: submission.id,
        questions,
      }),
      { status: 200 }
    );

  } catch (err: any) {
    console.error("❌ API crash:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}