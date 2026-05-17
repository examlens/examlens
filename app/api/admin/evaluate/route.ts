import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/app/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { submission_id } = await req.json();

    console.log(
      "📥 submission_id:",
      submission_id
    );

    // ==================================================
    // ✅ VALIDATION
    // ==================================================

    if (!submission_id) {
      return NextResponse.json(
        {
          error:
            "submission_id required",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // ✅ GET SUBMISSION
    // ==================================================

    const {
      data: submission,
      error: submissionError,
    } = await supabase
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

    if (
      submissionError ||
      !submission
    ) {
      console.error(
        "❌ Submission Error:",
        submissionError
      );

      return NextResponse.json(
        {
          error:
            "Submission not found",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "📂 Answer File:",
      submission.answer_file_url
    );

    // ==================================================
    // ✅ CHECK FILE
    // ==================================================

    if (
      !submission.answer_file_url
    ) {
      return NextResponse.json(
        {
          error:
            "No answer file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // ✅ GET EXAM DETAILS
    // ==================================================

    const {
      data: exam,
      error: examError,
    } = await supabase
      .from("exams")
      .select(`
        id,
        title,
        reference_file_url
      `)
      .eq("id", submission.exam_id)
      .single();

    if (examError || !exam) {
      console.error(
        "❌ Exam Error:",
        examError
      );

      return NextResponse.json(
        {
          error: "Exam not found",
        },
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
      console.error(
        "❌ Question Error:",
        questionError
      );

      return NextResponse.json(
        {
          error:
            "Failed to fetch questions",
        },
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // ✅ FORMAT QUESTIONS
    // ==================================================

    const questions =
      questionData?.map(
        (
          q: any,
          index: number
        ) => {
          const questionObj =
            Array.isArray(
              q.questions
            )
              ? q.questions[0]
              : q.questions;

          return {
            question_number:
              index + 1,

            question:
              questionObj?.question ||
              "",

            marks: Number(
              questionObj?.marks || 0
            ),
          };
        }
      ) || [];

    // ==================================================
    // ✅ TOTAL MARKS
    // ==================================================

    const totalMaxMarks =
      questions.reduce(
        (
          sum: number,
          q: any
        ) => sum + q.marks,
        0
      );

    console.log(
      "🎯 Total Exam Marks:",
      totalMaxMarks
    );

    // ==================================================
    // ✅ DOWNLOAD ANSWER FILE
    // ==================================================

    const answerPath =
      submission.answer_file_url.split(
        "/exam-answers/"
      )[1];

    if (!answerPath) {
      return NextResponse.json(
        {
          error:
            "Invalid answer file path",
        },
        {
          status: 400,
        }
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
      console.error(
        "❌ Download Error:",
        answerDownloadError
      );

      return NextResponse.json(
        {
          error:
            answerDownloadError?.message ||
            "Failed to download answer file",
        },
        {
          status: 400,
        }
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
            .download(
              referencePath
            );

          if (referenceFile) {
            const referenceBuffer =
              Buffer.from(
                await referenceFile.arrayBuffer()
              );

            const pdfParseModule =
              await import(
                "pdf-parse"
              );

            const pdfParse =
              (pdfParseModule as any)
                .default ||
              pdfParseModule;

            const parsedReference =
              await pdfParse(
                referenceBuffer
              );

            referenceText =
              parsedReference.text ||
              "";

            console.log(
              "📘 Reference Text Extracted"
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
    // ✅ EXTRACT PDF TEXT
    // ==================================================

    if (isPDF) {
      try {
        const pdfParseModule =
          await import(
            "pdf-parse"
          );

        const pdfParse =
          (pdfParseModule as any)
            .default ||
          pdfParseModule;

        const parsed =
          await pdfParse(
            answerBuffer
          );

        studentText =
          parsed.text || "";

        console.log(
          "📄 Student Text Length:",
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
      const base64 =
        answerBuffer.toString(
          "base64"
        );

      const mimeType =
        submission.answer_file_url.endsWith(
          ".png"
        )
          ? "image/png"
          : "image/jpeg";

      aiResponse =
        await openai.chat.completions.create(
          {
            model:
              "gpt-4o-mini",

            messages: [
              {
                role: "user",

                content: [
                  {
                    type: "text",
                    text: prompt,
                  },

                  {
                    type:
                      "image_url",

                    image_url: {
                      url: `data:${mimeType};base64,${base64}`,
                    },
                  },
                ],
              },
            ],

            temperature: 0.2,
          }
        );
    } else {
      aiResponse =
        await openai.chat.completions.create(
          {
            model:
              "gpt-4o-mini",

            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],

            temperature: 0.2,
          }
        );
    }

    // ==================================================
    // ✅ PARSE AI RESPONSE
    // ==================================================

    const rawResponse =
      aiResponse.choices[0]
        ?.message?.content ||
      "{}";

    console.log(
      "🤖 RAW AI RESPONSE:",
      rawResponse
    );

    let result: any;

    try {
      result = JSON.parse(
        rawResponse
      );
    } catch (err) {
      console.error(
        "❌ JSON Parse Error:",
        err
      );

      result = {
        marks: 0,

        feedback:
          "AI response parsing failed",

        mistakes: [],

        knowledge_analysis: {
          strong_areas: [],
          weak_areas: [],
        },
      };
    }

    // ==================================================
    // ✅ FINAL SAFE MARKS
    // ==================================================

    const finalMarks = Math.min(
      Math.max(
        Number(
          result.marks || 0
        ),
        0
      ),
      totalMaxMarks
    );

    console.log(
      "✅ Final Marks:",
      finalMarks
    );

    // ==================================================
    // ✅ CALCULATE PERCENTAGE
    // ==================================================

    const percentage =
      totalMaxMarks > 0
        ? Math.round(
            (finalMarks /
              totalMaxMarks) *
              100
          )
        : 0;

    console.log(
      "📊 Percentage:",
      percentage
    );

    // ==================================================
    // ✅ SAVE TO RESULTS TABLE
    // ==================================================

    const {
      error: resultInsertError,
    } = await supabase
      .from("results")
      .upsert([
        {
          submission_id:
            submission.id,

          exam_id:
            submission.exam_id,

          student_id:
            submission.student_id,

          total_marks:
            totalMaxMarks,

          score: finalMarks,

          percentage:
            percentage,

          feedback:
            result.feedback || "",

          mistakes:
            result.mistakes || [],

          strong_areas:
            result
              ?.knowledge_analysis
              ?.strong_areas ||
            [],

          weak_areas:
            result
              ?.knowledge_analysis
              ?.weak_areas ||
            [],
        },
      ]);

    if (resultInsertError) {
      console.error(
        "❌ Result Insert Error:",
        resultInsertError
      );

      return NextResponse.json(
        {
          error:
            resultInsertError.message,
        },
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // ✅ UPDATE SUBMISSION
    // ==================================================

    const {
      error: updateError,
    } = await supabase
      .from("submissions")
      .update({
        total_score:
          finalMarks,

        feedback:
          result.feedback || "",

        status:
          "evaluated",

        evaluated_at:
          new Date().toISOString(),
      })
      .eq("id", submission_id);

    if (updateError) {
      console.error(
        "❌ Submission Update Error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Failed to update submission",
        },
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // ✅ FETCH ALL RESULTS
    // ==================================================

    const {
      data: allResults,
      error: allResultsError,
    } = await supabase
      .from("results")
      .select(`
        score,
        percentage
      `)
      .eq(
        "student_id",
        submission.student_id
      );

    if (allResultsError) {
      console.error(
        "❌ Results Fetch Error:",
        allResultsError
      );
    }

    // ==================================================
    // ✅ CALCULATE AVERAGE PERCENTAGE
    // ==================================================

    let averagePercentage = 0;

    if (
      allResults &&
      allResults.length > 0
    ) {
      const totalPercentage =
        allResults.reduce(
          (
            sum: number,
            item: any
          ) =>
            sum +
            Number(
              item.percentage || 0
            ),
          0
        );

      averagePercentage =
        Math.round(
          totalPercentage /
            allResults.length
        );
    }

    console.log(
      "📊 Average Percentage:",
      averagePercentage
    );

    // ==================================================
    // ✅ TOTAL SUBMISSIONS
    // ==================================================

    const {
      count: totalSubmissionCount,
      error:
        totalSubmissionError,
    } = await supabase
      .from("submissions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "student_id",
        submission.student_id
      );

    if (totalSubmissionError) {
      console.error(
        "❌ Submission Count Error:",
        totalSubmissionError
      );
    }

    // ==================================================
    // ✅ TOTAL EVALUATED
    // ==================================================

    const {
      count: totalEvaluatedCount,
      error:
        totalEvaluatedError,
    } = await supabase
      .from("submissions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "student_id",
        submission.student_id
      )
      .eq("status", "evaluated");

    if (totalEvaluatedError) {
      console.error(
        "❌ Evaluated Count Error:",
        totalEvaluatedError
      );
    }

    console.log(
      "📘 Total Submissions:",
      totalSubmissionCount
    );

    console.log(
      "✅ Total Evaluated:",
      totalEvaluatedCount
    );

    // ==================================================
    // ✅ ATTENDANCE %
    // ==================================================

    const attendancePercentage =
      totalSubmissionCount &&
      totalSubmissionCount > 0
        ? Math.round(
            (Number(
              totalEvaluatedCount ||
                0
            ) /
              Number(
                totalSubmissionCount
              )) *
              100
          )
        : 0;

    console.log(
      "🎓 Attendance:",
      attendancePercentage
    );

    // ==================================================
    // ✅ UPDATE PROFILE TABLE
    // ==================================================

    const profilePayload = {
      attendance:
        attendancePercentage,

      avg_score:
        averagePercentage,

      evaluation_status:
        totalEvaluatedCount &&
        totalEvaluatedCount > 0
          ? "evaluated"
          : "pending",
    };

    console.log(
      "🛠 Updating Profile:",
      profilePayload
    );

    console.log(
      "🎯 Student ID:",
      submission.student_id
    );

    const {
      data: updatedProfile,
      error: profileUpdateError,
    } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("id", submission.student_id)
      .select();

    if (profileUpdateError) {
      console.error(
        "❌ Profile Update Error:",
        profileUpdateError
      );
    } else {
      console.log(
        "✅ Profile Updated:",
        updatedProfile
      );
    }

    // ==================================================
    // ✅ SUCCESS RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,

      result: {
        marks: finalMarks,

        total_marks:
          totalMaxMarks,

        percentage:
          percentage,

        feedback:
          result.feedback || "",

        mistakes:
          result.mistakes || [],

        strong_areas:
          result
            ?.knowledge_analysis
            ?.strong_areas ||
          [],

        weak_areas:
          result
            ?.knowledge_analysis
            ?.weak_areas ||
          [],
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
      {
        status: 500,
      }
    );
  }
}