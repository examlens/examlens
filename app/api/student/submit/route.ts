import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    // ==================================================
    // ✅ GET BODY
    // ==================================================

    const body = await req.json();

    const { exam_id, answer_file_url } = body;

    // ==================================================
    // ✅ VALIDATION
    // ==================================================

    if (!exam_id || !answer_file_url) {
      return new Response(
        JSON.stringify({
          error: "Missing exam_id or answer file",
        }),
        { status: 400 }
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
          error: "Unauthorized user",
        }),
        { status: 401 }
      );
    }

    const token = authHeader.replace(
      "Bearer ",
      ""
    );

    // ==================================================
    // ✅ GET LOGGED-IN USER
    // ==================================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error(
        "❌ AUTH ERROR:",
        authError
      );

      return new Response(
        JSON.stringify({
          error: "Invalid user session",
        }),
        { status: 401 }
      );
    }

    const student_id = user.id;

    console.log(
      "👤 Logged-in student:",
      student_id
    );

    // ==================================================
    // ✅ GET EXAM DETAILS
    // ==================================================

    const {
      data: examData,
      error: examError,
    } = await supabase
      .from("exams")
      .select("id, duration")
      .eq("id", exam_id)
      .single();

    if (examError || !examData) {
      console.error(
        "❌ EXAM ERROR:",
        examError
      );

      return new Response(
        JSON.stringify({
          error: "Exam not found",
        }),
        { status: 404 }
      );
    }

    // ==================================================
    // ✅ CHECK EXISTING SUBMISSION
    // ==================================================

    const {
      data: existingSubmission,
      error: existingError,
    } = await supabase
      .from("submissions")
      .select(
        `
        id,
        status,
        start_time,
        submitted_at
      `
      )
      .eq("exam_id", exam_id)
      .eq("student_id", student_id)
      .maybeSingle();

    if (existingError) {
      console.error(
        "❌ EXISTING SUBMISSION ERROR:",
        existingError
      );

      throw existingError;
    }

    // ==================================================
    // ✅ BLOCK IF ALREADY SUBMITTED
    // ==================================================

    if (
      existingSubmission &&
      existingSubmission.status ===
        "submitted"
    ) {
      return new Response(
        JSON.stringify({
          error:
            "You already attempted this exam",
        }),
        { status: 400 }
      );
    }

    // ==================================================
    // ✅ CHECK EXAM TIME LIMIT
    // ==================================================

    if (
      existingSubmission?.start_time
    ) {
      const startTime = new Date(
        existingSubmission.start_time
      ).getTime();

      const currentTime =
        new Date().getTime();

      const durationInMs =
        Number(examData.duration || 10) *
        60 *
        1000;

      const examEndTime =
        startTime + durationInMs;

      // ✅ BLOCK SUBMISSION IF TIME OVER

      if (currentTime > examEndTime) {
        // OPTIONAL:
        // mark submission expired

        await supabase
          .from("submissions")
          .update({
            status: "expired",
          })
          .eq(
            "id",
            existingSubmission.id
          );

        return new Response(
          JSON.stringify({
            error:
              "Exam time is over. Submission blocked.",
          }),
          { status: 400 }
        );
      }
    }

    // ==================================================
    // ✅ UPDATE EXISTING SUBMISSION
    // ==================================================

    let submissionId =
      existingSubmission?.id;

    if (submissionId) {
      const {
        error: updateError,
      } = await supabase
        .from("submissions")
        .update({
          answer_file_url,
          status: "submitted",
          submitted_at:
            new Date().toISOString(),
        })
        .eq("id", submissionId);

      if (updateError) {
        console.error(
          "❌ UPDATE ERROR:",
          updateError
        );

        throw updateError;
      }

      console.log(
        "✅ Existing submission updated:",
        submissionId
      );
    } else {
      // ==================================================
      // ✅ CREATE NEW SUBMISSION
      // ==================================================

      const {
        data: newSubmission,
        error: insertError,
      } = await supabase
        .from("submissions")
        .insert([
          {
            exam_id,
            student_id,
            answer_file_url,
            status: "submitted",
            total_score: null,
            start_time:
              new Date().toISOString(),
            submitted_at:
              new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error(
          "❌ INSERT ERROR:",
          insertError
        );

        throw insertError;
      }

      submissionId =
        newSubmission.id;

      console.log(
        "✅ New submission created:",
        submissionId
      );
    }

    // ==================================================
    // ✅ SUCCESS RESPONSE
    // ==================================================

    return new Response(
      JSON.stringify({
        success: true,
        submission_id:
          submissionId,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error(
      "🔥 SUBMIT ERROR:",
      err
    );

    return new Response(
      JSON.stringify({
        error:
          err.message ||
          "Submission failed",
      }),
      { status: 500 }
    );
  }
}