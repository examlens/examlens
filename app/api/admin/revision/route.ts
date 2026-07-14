import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { adminStorage } from "@/app/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { subject, filePath, publicUrl, questions } = await req.json();

    if (!subject || !filePath || !publicUrl) {
      return NextResponse.json(
        { error: "subject, filePath and publicUrl are required" },
        { status: 400 },
      );
    }

    let notesText = "";

    // ===============================
    // PDF TEXT EXTRACTION
    // ===============================

    try {
      const bucket = adminStorage.bucket();
      const [buffer] = await bucket.file(filePath).download();

      const { PDFParse } = await import("pdf-parse");

      const parser = new PDFParse({
        data: buffer,
      });

      const result = await parser.getText();

      notesText = result.text || "";

      await parser.destroy();
    } catch (pdfError) {
      console.log("PDF EXTRACTION ERROR", pdfError);

      notesText = "";
    }

    // ===============================
    // MAKE FILE PUBLIC
    // ===============================

    await adminStorage.bucket().file(filePath).makePublic();

    // ===============================
    // SAVE REVISION
    // ===============================

    const { data: revision, error } = await supabase
      .from("revisions")
      .insert({
        subject,
        notes_url: publicUrl,
        notes_text: notesText,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // ===============================
    // SAVE QUESTIONS
    // ===============================

    const questionRows = questions.map((q: any) => ({
      revision_id: revision.id,
      question: q.question,
      marks: q.marks,
    }));

    const { error: qError } = await supabase
      .from("revision_questions")
      .insert(questionRows);

    if (qError) {
      throw qError;
    }

    return NextResponse.json({
      success: true,
      revision,
    });
  } catch (err: any) {
    console.log("REVISION UPLOAD ERROR", err);

    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      },
    );
  }
}