import { supabase } from "@/app/lib/supabase";

export async function GET(req: Request) {
  try {
    // ==================================================
    // ✅ EXTRACT EXAM ID
    // ==================================================

    const url = new URL(req.url);

    const segments = url.pathname.split("/");

    const examId =
      segments[segments.length - 1];

    console.log(
      "📥 Extracted examId:",
      examId
    );

    if (!examId) {
      return new Response(
        JSON.stringify({
          error: "Exam ID missing",
        }),
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // ✅ GET AUTH TOKEN
    // ==================================================

    const authHeader =
      req.headers.get("authorization");

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return new Response(
        JSON.stringify({
          error: "No auth token",
        }),
        {
          status: 401,
        }
      );
    }

    const token = authHeader.replace(
      "Bearer ",
      ""
    );

    // ==================================================
    // ✅ GET REAL USER
    // ==================================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(
      token
    );

    if (authError || !user) {
      console.error(
        "❌ AUTH ERROR:",
        authError
      );

      return new Response(
        JSON.stringify({
          error:
            "User not authenticated",
        }),
        {
          status: 401,
        }
      );
    }

    const student_id = user.id;

    console.log(
      "👤 REAL USER:",
      student_id
    );

    // ==================================================
    // ✅ ENSURE STUDENT EXISTS IN USERS TABLE
    // ==================================================

    const userPayload = {
      id: student_id,
      email: user.email || null,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email ||
        "Student",
    };

    const {
      error: userUpsertError,
    } = await supabase
      .from("users")
      .upsert([userPayload], {
        onConflict: "id",
      });

    if (userUpsertError) {
      console.error(
        "❌ UPSERT USER ERROR:",
        userUpsertError
      );

      return new Response(
        JSON.stringify({
          error:
            userUpsertError.message ||
            "Failed to verify user record",
        }),
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // ✅ GET EXAM DETAILS
    // ==================================================

    const {
      data: examData,
      error: examError,
    } = await supabase
      .from("exams")
      .select(`
        id,
        title,
        duration
      `)
      .eq("id", examId)
      .single();

    if (
      examError ||
      !examData
    ) {
      console.error(
        "❌ EXAM ERROR:",
        examError
      );

      return new Response(
        JSON.stringify({
          error:
            "Exam not found",
        }),
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // ✅ GET QUESTIONS
    // ==================================================

    const {
      data: questionData,
      error: qError,
    } = await supabase
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
      console.error(
        "❌ QUESTIONS ERROR:",
        qError
      );

      return new Response(
        JSON.stringify({
          error: qError.message,
        }),
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // ✅ FORMAT QUESTIONS
    // ==================================================

    const questions = (
      questionData || []
    ).map((item: any) => {
      const q = Array.isArray(
        item.questions
      )
        ? item.questions[0]
        : item.questions;

      return {
        id: q?.id || "",
        question:
          q?.question || "",
        marks: q?.marks || 0,
      };
    });

    console.log(
      "✅ Questions Count:",
      questions.length
    );

    // ==================================================
    // ✅ CHECK EXISTING SUBMISSION
    // ==================================================

    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from("submissions")
      .select(`
        id,
        status,
        start_time,
        started_at,
        submitted_at,
        is_completed
      `)
      .eq("exam_id", examId)
      .eq("student_id", student_id)
      .maybeSingle();

    if (existingError) {
      console.error(
        "❌ EXISTING SUBMISSION ERROR:",
        existingError
      );

      return new Response(
        JSON.stringify({
          error:
            existingError.message,
        }),
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // ✅ BLOCK IF ALREADY SUBMITTED
    // ==================================================

    if (
      existing &&
      (
        existing.status ===
        "submitted" ||
        existing.is_completed === true
      )
    ) {
      return new Response(
        JSON.stringify({
          already_attempted: true,
          message:
            "You already attempted this exam",
        }),
        {
          status: 200,
        }
      );
    }

    // ==================================================
    // ✅ CREATE / RESUME SUBMISSION
    // ==================================================

    let submission: any = existing;

    if (!existing) {
      const startedAt =
        new Date().toISOString();

      const {
        data: newSubmission,
        error: subError,
      } = await supabase
        .from("submissions")
        .insert([
          {
            exam_id: examId,

            student_id,

            status:
              "in_progress",

            start_time:
              startedAt,

            started_at:
              startedAt,

            is_completed:
              false,
          },
        ])
        .select()
        .single();

      if (subError) {
        console.error(
          "❌ CREATE SUBMISSION ERROR:",
          subError
        );

        return new Response(
          JSON.stringify({
            error:
              subError.message,
          }),
          {
            status: 500,
          }
        );
      }

      submission =
        newSubmission;

      console.log(
        "✅ New exam started:",
        submission.id
      );
    } else {
      console.log(
        "🔁 Resuming existing attempt:",
        submission.id
      );
    }

    // ==================================================
    // ✅ CALCULATE REMAINING TIME
    // ==================================================

    const durationMinutes =
      Number(
        examData.duration || 10
      );

    const startTime =
      new Date(
        submission.started_at ||
        submission.start_time
      ).getTime();

    const currentTime =
      Date.now();

    const endTime =
      startTime +
      durationMinutes *
      60 *
      1000;

    const remainingSeconds =
      Math.floor(
        (endTime -
          currentTime) /
        1000
      );

    console.log(
      "⏳ Remaining Seconds:",
      remainingSeconds
    );

    // ==================================================
    // ✅ AUTO TIME OVER
    // ==================================================

    if (remainingSeconds <= 0) {

      // ✅ ONLY MARK TIME OVER
      // IF IT WAS REALLY STARTED BEFORE

      await supabase
        .from("submissions")
        .update({
          status: "time_over",
          is_completed: true,
        })
        .eq("id", submission.id);

      return new Response(
        JSON.stringify({
          success: true,

          time_over: true,

          exam_id: examId,

          title:
            examData.title || "Exam",

          duration:
            durationMinutes,

          start_time:
            submission.started_at ||
            submission.start_time,

          submission_id:
            submission.id,

          questions,

          remaining_seconds: 0,
        }),
        {
          status: 200,
        }
      );
    }

    // ==================================================
    // ✅ FINAL RESPONSE
    // ==================================================

    return new Response(
      JSON.stringify({
        success: true,

        exam_id: examId,

        title:
          examData.title || "Exam",

        duration:
          durationMinutes,

        start_time:
          submission.started_at ||
          submission.start_time,

        submission_id:
          submission.id,

        questions,

        remaining_seconds:
          remainingSeconds,
      }),
      {
        status: 200,
      }
    );
  } catch (err: any) {
    console.error(
      "❌ API CRASH:",
      err
    );

    return new Response(
      JSON.stringify({
        error:
          err.message ||
          "Failed to fetch exam",
      }),
      {
        status: 500,
      }
    );
  }
}