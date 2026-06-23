import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/app/lib/supabase";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { submission_id } = await req.json();

    // ==================================================
    // ✅ VALIDATION
    // ==================================================

    if (!submission_id) {
      return NextResponse.json(
        { error: "submission_id required" },
        { status: 400 }
      );
    }

    // ==================================================
    // ✅ GET SUBMISSION
    // ==================================================

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select(`
        id,
        answer_file_url,
        exam_id,
        student_id,
        status,
        total_score,
        feedback
      `)
      .eq("id", submission_id)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // ==================================================
    // ✅ CHECK FILE
    // ==================================================

    if (!submission.answer_file_url) {
      return NextResponse.json(
        { error: "No answer file uploaded" },
        { status: 400 }
      );
    }

    // ==================================================
    // ✅ GET EXAM DETAILS
    // ==================================================

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select(`
        id,
        title,
        reference_file_url
      `)
      .eq("id", submission.exam_id)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // ==================================================
    // ✅ GET QUESTIONS
    // ==================================================

    const { data: questionData, error: questionError } = await supabase
      .from("exam_questions")
      .select(`
        question_id,
        questions (
          id,
          question,
          marks
        )
      `)
      .eq("exam_id", submission.exam_id);

    if (questionError) {
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    // ==================================================
    // ✅ FORMAT QUESTIONS
    // ==================================================

    const questions =
      questionData?.map((q: any, index: number) => {
        const questionObj = Array.isArray(q.questions)
          ? q.questions[0]
          : q.questions;

        return {
          question_number: index + 1,
          question: questionObj?.question || "",
          marks: Number(questionObj?.marks || 0),
        };
      }) || [];

    // ==================================================
    // ✅ TOTAL MARKS
    // ==================================================

    const totalMaxMarks = questions.reduce(
      (sum: number, q: any) => sum + q.marks,
      0
    );

    // ==================================================
    // ✅ DOWNLOAD ANSWER FILE
    // ==================================================

    let answerFile: Blob | null = null;
    try {
      const response = await fetch(submission.answer_file_url);
      if (!response.ok) throw new Error("Failed to download answer file");
      answerFile = await response.blob();
    } catch (downloadError: any) {
      return NextResponse.json(
        { error: downloadError.message || "Failed to download answer file" },
        { status: 400 }
      );
    }

    const answerBuffer = Buffer.from(await answerFile.arrayBuffer());

    // ==================================================
    // ✅ EXTRACT REFERENCE TEXT
    // ==================================================

    let referenceText = "";

    if (exam.reference_file_url) {
      try {
        const response = await fetch(exam.reference_file_url);
        if (response.ok) {
          const referenceFile = await response.blob();
          const referenceBuffer = Buffer.from(await referenceFile.arrayBuffer());
          const uint8 = new Uint8Array(referenceBuffer);
          const { PDFParse } = await import("pdf-parse");
          try {
            const fs = await import("fs");
            const path = await import("path");
            const workerPath = path.join(
              process.cwd(),
              "node_modules",
              "pdf-parse",
              "dist",
              "pdf-parse",
              "web",
              "pdf.worker.mjs"
            );
            const code = fs.readFileSync(workerPath, "utf8");
            const base64 = Buffer.from(code).toString("base64");
            PDFParse.setWorker(`data:application/javascript;base64,${base64}`);
          } catch (e) {
            PDFParse.setWorker("");
          }
          const parserRef = new PDFParse({ data: uint8 });
          const parsedReference = await parserRef.getText();
          await parserRef.destroy();
          referenceText = parsedReference.text || "";
        }
      } catch (err) {
      }
    }

    // ==================================================
    // ✅ DETECT FILE TYPE
    // ==================================================

    const isPDF = submission.answer_file_url.toLowerCase().endsWith(".pdf");

    let studentText = "";

    // ==================================================
    // ✅ EXTRACT PDF TEXT
    // ==================================================

    if (isPDF) {
      try {
        const uint8 = new Uint8Array(answerBuffer);
        const { PDFParse } = await import("pdf-parse");
        try {
          const fs = await import("fs");
          const path = await import("path");
          const workerPath = path.join(
            process.cwd(),
            "node_modules",
            "pdf-parse",
            "dist",
            "pdf-parse",
            "web",
            "pdf.worker.mjs"
          );
          const code = fs.readFileSync(workerPath, "utf8");
          const base64 = Buffer.from(code).toString("base64");
          PDFParse.setWorker(`data:application/javascript;base64,${base64}`);
        } catch (e) {
          PDFParse.setWorker("");
        }
        const parser = new PDFParse({ data: uint8 });
        const parsed = await parser.getText();
        await parser.destroy();

        studentText = parsed.text || "";
      } catch (err) {
      }
    }

    // ==================================================
    // ✅ BUILD QUESTION LIST
    // ==================================================

    const formattedQuestions = questions
      .map(
        (q: any) => `
Question ${q.question_number}:
${q.question}

Maximum Marks: ${q.marks}
`
      )
      .join("\n");

    // ==================================================
    // ✅ AI PROMPT
    // ==================================================

    const prompt = `
You are an expert strict exam evaluator.

Evaluate the student's answer sheet carefully.

==================================================

EXAM TITLE:
${exam.title}

==================================================

QUESTIONS:
${formattedQuestions}

==================================================

REFERENCE ANSWERS:
${referenceText}

==================================================

STUDENT ANSWERS:
${studentText}

==================================================

IMPORTANT RULES:

- Total maximum marks = ${totalMaxMarks}
- Never exceed ${totalMaxMarks}
- Evaluate each question separately
- Penalize wrong answers
- Penalize incomplete answers
- Give realistic scoring
- Give detailed mistakes
- Give improvement suggestions
- Return ONLY valid JSON

==================================================

OUTPUT FORMAT:

{
  "marks": number,
  "feedback": "overall feedback",
  "mistakes": [
    "mistake 1",
    "mistake 2"
  ],
  "knowledge_analysis": {
    "strong_areas": [
      "topic 1"
    ],
    "weak_areas": [
      "topic 1"
    ]
  }
}
`;

    // ==================================================
    // ✅ AI RESPONSE
    // ==================================================

    let aiResponse: any;

    if (!isPDF) {
      const base64 = answerBuffer.toString("base64");
      const mimeType = submission.answer_file_url.endsWith(".png")
        ? "image/png"
        : "image/jpeg";

      aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
            ],
          },
        ],
        temperature: 0.2,
      });
    } else {
      aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });
    }

    // ==================================================
    // ✅ PARSE AI RESPONSE
    // ==================================================

    const rawResponse = aiResponse.choices[0]?.message?.content || "{}";

    let result: any;
    try {
      // Strip possible markdown code fences
      const clean = rawResponse.replace(/```json|```/g, "").trim();
      result = JSON.parse(clean);
    } catch (err) {
      result = {
        marks: 0,
        feedback: "AI response parsing failed",
        mistakes: [],
        knowledge_analysis: { strong_areas: [], weak_areas: [] },
      };
    }

    // ==================================================
    // ✅ FINAL SAFE MARKS
    // ==================================================

    const finalMarks = Math.min(
      Math.max(Number(result.marks || 0), 0),
      totalMaxMarks
    );

    // ==================================================
    // ✅ CALCULATE PERCENTAGE
    // ==================================================

    const percentage =
      totalMaxMarks > 0
        ? Math.round((finalMarks / totalMaxMarks) * 100)
        : 0;

    // ==================================================
    // ✅ SAVE TO RESULTS TABLE
    // ==================================================

    const { error: resultInsertError } = await supabase.from("results").upsert([
      {
        submission_id: submission.id,
        exam_id: submission.exam_id,
        student_id: submission.student_id,
        total_marks: totalMaxMarks,
        score: finalMarks,
        percentage,
        feedback: result.feedback || "",
        mistakes: result.mistakes || [],
        strong_areas: result?.knowledge_analysis?.strong_areas || [],
        weak_areas: result?.knowledge_analysis?.weak_areas || [],
      },
    ]);

    if (resultInsertError) {
      return NextResponse.json(
        { error: resultInsertError.message },
        { status: 500 }
      );
    }

    // ==================================================
    // ✅ UPDATE SUBMISSION
    // ==================================================

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        total_score: finalMarks,
        feedback: result.feedback || "",
        status: "evaluated",
        evaluated_at: new Date().toISOString(),
      })
      .eq("id", submission_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update submission" },
        { status: 500 }
      );
    }

    // ==================================================
    // ✅ FETCH ALL RESULTS
    // ==================================================

    const { data: allResults, error: allResultsError } = await supabase
      .from("results")
      .select("score, percentage")
      .eq("student_id", submission.student_id);

    if (allResultsError) {
    }

    // ==================================================
    // ✅ CALCULATE AVERAGE PERCENTAGE
    // ==================================================

    let averagePercentage = 0;
    if (allResults && allResults.length > 0) {
      const totalPercentage = allResults.reduce(
        (sum: number, item: any) => sum + Number(item.percentage || 0),
        0
      );
      averagePercentage = Math.round(totalPercentage / allResults.length);
    }

    // ==================================================
    // ✅ TOTAL SUBMISSIONS
    // ==================================================

    const { count: totalSubmissionCount, error: totalSubmissionError } =
      await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("student_id", submission.student_id);

    if (totalSubmissionError) {
    }

    // ==================================================
    // ✅ TOTAL EVALUATED
    // ==================================================

    const { count: totalEvaluatedCount, error: totalEvaluatedError } =
      await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("student_id", submission.student_id)
        .eq("status", "evaluated");

    if (totalEvaluatedError) {
    }

    // ==================================================
    // ✅ ATTENDANCE %
    // ==================================================

    const attendancePercentage =
      totalSubmissionCount && totalSubmissionCount > 0
        ? Math.round(
            (Number(totalEvaluatedCount || 0) / Number(totalSubmissionCount)) *
              100
          )
        : 0;

    // ==================================================
    // ✅ UPDATE PROFILE TABLE
    // ==================================================

    const profilePayload = {
      attendance: attendancePercentage,
      avg_score: averagePercentage,
      evaluation_status:
        totalEvaluatedCount && totalEvaluatedCount > 0 ? "evaluated" : "pending",
    };

    const { data: updatedProfile, error: profileUpdateError } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("id", submission.student_id)
      .select();

    if (profileUpdateError) {
    } else {
    }

    // ==================================================
    // ✅ SUCCESS RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,
      result: {
        marks: finalMarks,
        total_marks: totalMaxMarks,
        percentage,
        feedback: result.feedback || "",
        mistakes: result.mistakes || [],
        strong_areas: result?.knowledge_analysis?.strong_areas || [],
        weak_areas: result?.knowledge_analysis?.weak_areas || [],
      },
      submission: {
        id: submission.id,
        answer_file_url: submission.answer_file_url,
        status: "evaluated",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Evaluation failed" },
      { status: 500 }
    );
  }
}