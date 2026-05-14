import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/app/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { submission_id } = await req.json();

    console.log("📥 submission_id:", submission_id);

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

    const { data: submission, error: submissionError } =
      await supabase
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
      console.error(submissionError);

      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    console.log(
      "📂 Answer File:",
      submission.answer_file_url
    );

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
    // ✅ GET EXAM + TOTAL MARKS
    // ==================================================

    const { data: exam, error: examError } =
      await supabase
        .from("exams")
        .select(`
          id,
          title,
          reference_file_url
        `)
        .eq("id", submission.exam_id)
        .single();

    if (examError || !exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    // ==================================================
    // ✅ GET QUESTIONS
    // ==================================================

    const {
      data: questionData,
      error: questionError,
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
      .eq("exam_id", submission.exam_id);

    if (questionError) {
      console.error(questionError);

      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    const questions =
      questionData?.map((q: any) => ({
        question:
          q.questions?.question || "",
        marks:
          Number(q.questions?.marks || 0),
      })) || [];

    // ==================================================
    // ✅ TOTAL MARKS
    // ==================================================

    const totalMaxMarks = questions.reduce(
      (sum: number, q: any) =>
        sum + Number(q.marks || 0),
      0
    );

    console.log(
      "🎯 Total Exam Marks:",
      totalMaxMarks
    );

    // ==================================================
    // ✅ DOWNLOAD STUDENT FILE
    // ==================================================

    const answerPath =
      submission.answer_file_url.split(
        "/exam-answers/"
      )[1];

    if (!answerPath) {
      return NextResponse.json(
        { error: "Invalid answer file path" },
        { status: 400 }
      );
    }

    const {
      data: answerFile,
      error: answerDownloadError,
    } = await supabase.storage
      .from("exam-answers")
      .download(answerPath);

    if (
      answerDownloadError ||
      !answerFile
    ) {
      console.error(answerDownloadError);

      return NextResponse.json(
        {
          error:
            answerDownloadError?.message ||
            "Failed to download answer file",
        },
        { status: 400 }
      );
    }

    const answerBuffer = Buffer.from(
      await answerFile.arrayBuffer()
    );

    // ==================================================
    // ✅ EXTRACT REFERENCE TEXT
    // ==================================================

    let referenceText = "";

    if (exam.reference_file_url) {
      try {
        const referencePath =
          exam.reference_file_url.split(
            "/exam-answers/"
          )[1];

        if (referencePath) {
          const {
            data: referenceFile,
          } = await supabase.storage
            .from("exam-answers")
            .download(referencePath);

          if (referenceFile) {
            const referenceBuffer =
              Buffer.from(
                await referenceFile.arrayBuffer()
              );

            const pdfParseModule =
              await import("pdf-parse");

            const pdfParse =
              (pdfParseModule as any)
                .default || pdfParseModule;

            const parsedReference =
              await pdfParse(
                referenceBuffer
              );

            referenceText =
              parsedReference.text || "";

            console.log(
              "📘 Reference text extracted"
            );
          }
        }
      } catch (err) {
        console.warn(
          "⚠️ Failed to parse reference file"
        );
      }
    }

    // ==================================================
    // ✅ DETECT FILE TYPE
    // ==================================================

    const isPDF =
      submission.answer_file_url
        .toLowerCase()
        .endsWith(".pdf");

    let studentText = "";

    // ==================================================
    // ✅ PDF TEXT EXTRACTION
    // ==================================================

    if (isPDF) {
      try {
        const pdfParseModule =
          await import("pdf-parse");

        const pdfParse =
          (pdfParseModule as any)
            .default || pdfParseModule;

        const parsed =
          await pdfParse(answerBuffer);

        studentText = parsed.text || "";

        console.log(
          "📄 Extracted PDF Text Length:",
          studentText.length
        );
      } catch (err) {
        console.error(
          "❌ PDF Parse Error:",
          err
        );
      }
    }

    // ==================================================
    // ✅ BUILD QUESTION LIST
    // ==================================================

    const formattedQuestions =
      questions
        .map(
          (q: any, index: number) => `
Question ${index + 1}:
${q.question}

Maximum Marks: ${q.marks}
`
        )
        .join("\n");

    // ==================================================
    // ✅ AI PROMPT
    // ==================================================

    const prompt = `
You are a strict AI exam evaluator.

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
- NEVER exceed ${totalMaxMarks}
- Evaluate question by question
- Give realistic marks
- Penalize wrong answers
- Penalize missing answers
- Give detailed teacher feedback
- Return ONLY valid JSON

==================================================

OUTPUT FORMAT:

{
  "marks": number,
  "feedback": string
}
`;

    // ==================================================
    // ✅ IMAGE FLOW
    // ==================================================

    let aiResponse: any;

    if (!isPDF) {
      const base64 =
        answerBuffer.toString("base64");

      const mimeType =
        submission.answer_file_url.endsWith(
          ".png"
        )
          ? "image/png"
          : "image/jpeg";

      aiResponse =
        await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64}`,
                  },
                },
              ],
            },
          ],
          temperature: 0.2,
        });
    }

    // ==================================================
    // ✅ PDF FLOW
    // ==================================================

    else {
      aiResponse =
        await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
        });
    }

    // ==================================================
    // ✅ PARSE AI RESPONSE
    // ==================================================

    const rawResponse =
      aiResponse.choices[0].message
        .content || "{}";

    console.log(
      "🤖 RAW AI RESPONSE:",
      rawResponse
    );

    let result: any;

    try {
      result = JSON.parse(rawResponse);
    } catch {
      result = {
        marks: 0,
        feedback:
          "AI response parsing failed",
      };
    }

    // ==================================================
    // ✅ FINAL SAFE MARKS
    // ==================================================

    const finalMarks = Math.min(
      Math.max(
        Number(result.marks || 0),
        0
      ),
      totalMaxMarks
    );

    console.log(
      "✅ Final Marks:",
      finalMarks
    );

    // ==================================================
    // ✅ SAVE EVALUATION
    // ==================================================

    const { error: updateError } =
      await supabase
        .from("submissions")
        .update({
          total_score: finalMarks,
          feedback:
            result.feedback || "",
          status: "evaluated",
        })
        .eq("id", submission_id);

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        {
          error:
            "Failed to save evaluation",
        },
        { status: 500 }
      );
    }

    // ==================================================
    // ✅ RETURN RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,
      result: {
        marks: finalMarks,
        total_marks: totalMaxMarks,
        feedback:
          result.feedback || "",
      },

      submission: {
        id: submission.id,
        answer_file_url:
          submission.answer_file_url,
        status: "evaluated",
      },
    });
  } catch (err: any) {
    console.error(
      "🔥 EVALUATION ERROR:",
      err
    );

    return NextResponse.json(
      {
        error:
          err.message ||
          "Evaluation failed",
      },
      { status: 500 }
    );
  }
}