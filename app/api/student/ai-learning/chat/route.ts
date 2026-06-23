import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { noteId, message } = await req.json();

    if (!noteId || !message) {
      return NextResponse.json(
        {
          error: "Missing data",
        },
        {
          status: 400,
        },
      );
    }

    // ===============================
    // GET UPLOADED STUDENT NOTE
    // ===============================

    const { data: note, error } = await supabaseAdmin
      .from("student_notes")
      .select("*")
      .eq("id", noteId)
      .single();

    if (error || !note) {
      return NextResponse.json(
        {
          error: "Note not found",
        },
        {
          status: 404,
        },
      );
    }

    // ===============================
    // AI REVISION STYLE PROMPT
    // ===============================

    const prompt = `


You are an expert exam tutor.



Subject:

${note.subject}





Reference Notes:

${note.notes_text || "No extracted notes available"}






Student Question:

${message}





Answer the student like a revision notes AI.

Follow this format:



Topic Name



Introduction

Give a simple explanation of the topic.



Definition

Give the textbook definition.



Main Explanation


Explain clearly using:

• Headings

• Bullet points

• Important terms

• Short paragraphs





Important Concepts


Explain each important concept separately.





Formula / Equation


If the topic contains formulas:

Show like:



[ Formula ]



Where:

Variable = Meaning





Diagram / Flowchart


Add simple text diagrams when required.



Example:


[Input]

   ↓

[Process]

   ↓

[Output]





For graphs:


Mention:

X-axis:

Y-axis:

Draw simple graph using text.





Example


Give a real life example.





Conclusion


Give a short exam conclusion.





Rules:

- Answer only from uploaded notes.
- Do not mention AI.
- Do not repeat the question.
- Keep answer easy for students.
- Use markdown headings.
- Do not use # symbols.
- Do not create unnecessary sections.
- Make it look like handwritten revision notes.
- Give detailed but readable answers.



`;

    // ===============================
    // OPENAI CALL
    // ===============================

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",
          content: "You are ExamLens AI Tutor.",
        },

        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.3,
    });

    return NextResponse.json({
      answer:
        completion.choices?.[0]?.message?.content || "No answer generated",
    });
  } catch (e: any) {

    return NextResponse.json(
      {
        error: e.message,
      },
      {
        status: 500,
      },
    );
  }
}
