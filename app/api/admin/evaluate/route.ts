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

    if (!submission_id) {
      return NextResponse.json(
        { error: "submission_id required" },
        { status: 400 }
      );
    }

    // ✅ 1. GET SUBMISSION
    const { data: submission, error } = await supabase
      .from("submissions")
      .select("answer_file_url, exam_id")
      .eq("id", submission_id)
      .single();


    console.log("📂 FILE FROM DB:", submission?.answer_file_url);

    if (error || !submission) {
      throw new Error("Submission not found");
    }

    const fileUrl = submission.answer_file_url;

    if (!fileUrl) {
      return NextResponse.json(
        { error: "No file to evaluate" },
        { status: 400 }
      );
    }

    // ✅ GET TOTAL MARKS OF EXAM
    const { data: questions } = await supabase
      .from("exam_questions")
      .select(`
    questions (
      marks
    )
  `)
      .eq("exam_id", submission.exam_id);

    const totalMaxMarks =
      questions?.reduce(
        (sum: number, q: any) => sum + (q.questions?.marks || 0),
        0
      ) || 100;

    console.log("🎯 Total Max Marks:", totalMaxMarks);

    // ✅ 2. GET REFERENCE FILE
    const { data: exam } = await supabase
      .from("exams")
      .select("reference_file_url")
      .eq("id", submission.exam_id)
      .single();

    const referenceUrl = exam?.reference_file_url || "";

    let referenceText = "";

    // =========================
    // ✅ EXTRACT REFERENCE PDF TEXT
    // =========================
    if (referenceUrl) {
      try {
        const { PDFParse } = await import("pdf-parse");

        const refRes = await fetch(referenceUrl);
        const refBuffer = await refRes.arrayBuffer();

        const parser = new PDFParse({ data: Buffer.from(refBuffer) });
        const textResult = await parser.getText();
        referenceText = textResult.text;

        console.log("📘 Reference text extracted");
      } catch (err) {
        console.warn("⚠️ Failed to parse reference PDF");
      }
    }

    // =========================
    // 🔍 DETECT FILE TYPE
    // =========================
    const isPDF = fileUrl.toLowerCase().endsWith(".pdf");

    // =========================
    // ✅ PDF FLOW
    // =========================
    if (isPDF) {
      const pdfParse: any = await import("pdf-parse");

      // 🔥 TIMEOUT SAFE FETCH
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const fileRes = await fetch(fileUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const buffer = await fileRes.arrayBuffer();

      const parsed = await pdfParse(Buffer.from(buffer));
      const studentText = parsed.text;

      console.log("📄 Student PDF text length:", studentText.length);

      const prompt = `
You are an exam evaluator.

Evaluate the student's answer using the reference notes.

IMPORTANT:
- Maximum marks = ${totalMaxMarks}
- DO NOT exceed ${totalMaxMarks}
- Be strict and fair

Return ONLY JSON:
{
  "marks": number,
  "feedback": string
}
`;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const result = JSON.parse(
        aiResponse.choices[0].message.content || "{}"
      );

      const finalMarks = Math.min(result.marks || 0, totalMaxMarks);

      await supabase
        .from("submissions")
        .update({
          total_score: finalMarks,
          status: "evaluated",
        })
        .eq("id", submission_id);

      return NextResponse.json({ success: true, result });
    }

    // =========================
    // ✅ IMAGE FLOW (HANDWRITTEN)
    // =========================
    else {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
Evaluate this handwritten answer.

Reference Notes:
${referenceText}

Rules:
- Give marks out of 100
- Be strict but fair

Return ONLY JSON:
{
  "marks": number,
  "feedback": string
}
`,
              },
              {
                type: "image_url",
                image_url: { url: fileUrl }, // ✅ DIRECT URL
              },
            ],
          },
        ],
      });

      const result = JSON.parse(
        aiResponse.choices[0].message.content || "{}"
      );

      await supabase
        .from("submissions")
        .update({
          total_score: result.marks,
          status: "evaluated",
        })
        .eq("id", submission_id);

      return NextResponse.json({ success: true, result });
    }
  } catch (err: any) {
    console.error("🔥 EVALUATION ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Evaluation failed" },
      { status: 500 }
    );
  }
}