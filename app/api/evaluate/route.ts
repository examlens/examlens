import { supabase } from "@/app/lib/supabase";

// ✅ Extract handwritten text
async function extractTextWithAI(imageUrl: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in .env.local");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extract ALL handwritten answers clearly. Keep answers separated as Q1, Q2, Q3. Do NOT summarize.",
            },
            {
              type: "input_image",
              image_url: imageUrl,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI API error");
  }

  return (data.output?.[0]?.content?.[0]?.text || "").trim();
}

// ✅ Per-question evaluation
async function evaluateEachQuestion(studentText: string, questions: any[]) {
  const apiKey = process.env.OPENAI_API_KEY;

  const prompt = `
You are a strict exam evaluator.

Student Answers:
${studentText}

Questions:
${questions
  .map(
    (q, i) => `
Q${i + 1}: ${q.question}
Model Answer: ${q.model_answer}
Marks: ${q.marks}`
  )
  .join("\n\n")}

Instructions:
- Evaluate EACH question separately
- Give partial marks if needed
- Focus on meaning, not exact words

Return ONLY JSON:
{
  "results": [
    {
      "question_index": 1,
      "score": number,
      "feedback": "short reason"
    }
  ]
}
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      text: {
        format: { type: "json_object" },
      },
      input: prompt,
    }),
  });

  const data = await response.json();

  console.log("🧠 AI RAW:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data.error?.message || "AI evaluation failed");
  }

  try {
    const text = data.output?.[0]?.content?.[0]?.text || "{}";
    return JSON.parse(text);
  } catch {
    return { results: [] };
  }
}

export async function POST(req: Request) {
  try {
    console.log("🔥 Evaluate API HIT");

    const { submission_id } = await req.json();

    if (!submission_id) {
      return new Response(JSON.stringify({ error: "Missing submission_id" }), {
        status: 400,
      });
    }

    // 1. Get submission
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submission_id)
      .single();

    if (subError || !submission) {
      return new Response(JSON.stringify({ error: "Submission not found" }), {
        status: 500,
      });
    }

    console.log("📎 FILE URL:", submission.file_url);

    // 2. Extract text
    let extractedText = "";

    try {
      extractedText = await extractTextWithAI(submission.file_url);

      extractedText = extractedText
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!extractedText) {
        throw new Error("Empty extracted text");
      }

      console.log("✅ TEXT:", extractedText.slice(0, 200));
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: "AI extraction failed",
          details: err.message,
        }),
        { status: 500 }
      );
    }

    // 3. Get questions
    const { data: examQuestions } = await supabase
      .from("exam_questions")
      .select("question_id")
      .eq("exam_id", submission.exam_id);

    if (!examQuestions || examQuestions.length === 0) {
      return new Response(JSON.stringify({ error: "No exam questions found" }), {
        status: 404,
      });
    }

    const questionIds = examQuestions.map((q) => q.question_id);

    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .in("id", questionIds);

    if (!questions || questions.length === 0) {
      return new Response(JSON.stringify({ error: "No questions found" }), {
        status: 404,
      });
    }

    // 4. AI per-question evaluation
    let aiResult;

    try {
      aiResult = await evaluateEachQuestion(extractedText, questions);
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: "AI evaluation failed",
          details: err.message,
        }),
        { status: 500 }
      );
    }

    let totalScore = 0;
    let totalMarks = 0;

    // 5. Save per-question results
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const res = aiResult.results?.find(
        (r: any) => r.question_index === i + 1
      );

      const score = res?.score || 0;
      const feedback = res?.feedback || "No feedback";

      totalScore += score;
      totalMarks += q.marks;

      await supabase.from("question_results").insert([
        {
          submission_id,
          question_id: q.id,
          score,
          feedback,
        },
      ]);
    }

    // 6. Save overall result (no duplicates)
    await supabase.from("results").upsert(
      [
        {
          submission_id,
          score: totalScore,
          feedback: "Evaluated per question",
        },
      ],
      { onConflict: "submission_id" }
    );

    // 7. Update submission
    await supabase
      .from("submissions")
      .update({ status: "evaluated" })
      .eq("id", submission_id);

    console.log("🎯 FINAL SCORE:", totalScore, "/", totalMarks);

    return new Response(
      JSON.stringify({
        score: totalScore,
        total: totalMarks,
        extractedText,
        breakdown: aiResult.results,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.log("❌ API CRASH:", err);

    return new Response(JSON.stringify({ error: "Evaluation failed" }), {
      status: 500,
    });
  }
}