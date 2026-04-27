import { supabase } from "@/app/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { submission_id } = await req.json();

    if (!submission_id) {
      return new Response(JSON.stringify({ error: "Missing ID" }), {
        status: 400,
      });
    }

    // 1️⃣ Get answers with questions
    const { data: answers, error } = await supabase
      .from("submission_answers")
      .select(`
        id,
        answer,
        questions (
          question,
          marks
        )
      `)
      .eq("submission_id", submission_id);

    if (error) throw error;

    let total = 0;

    // 2️⃣ Loop and evaluate using OpenAI
    for (const ans of answers) {
      const question = ans.questions?.[0]?.question || "";
      const maxMarks = ans.questions?.[0]?.marks || 10;
      const studentAnswer = ans.answer || "";

      // 🧠 OpenAI Evaluation Prompt
      const prompt = `
You are an exam evaluator.

Question:
${question}

Student Answer:
${studentAnswer}

Max Marks: ${maxMarks}

Give output in JSON format:
{
  "score": number,
  "feedback": "short feedback"
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.3-mini", // cost efficient
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.choices[0].message.content || "{}";

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { score: 0, feedback: "Evaluation failed" };
      }

      const score = Math.min(parsed.score || 0, maxMarks);
      total += score;

      // 3️⃣ Save each answer result
      await supabase
        .from("submission_answers")
        .update({
          score,
          feedback: parsed.feedback,
        })
        .eq("id", ans.id);
    }

    // 4️⃣ Update total score
    await supabase
      .from("submissions")
      .update({
        total_score: total,
        status: "evaluated",
      })
      .eq("id", submission_id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}