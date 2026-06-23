import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { adminStorage } from "@/app/lib/firebaseAdmin";
import { getDownloadURL } from "firebase-admin/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const subject = formData.get("subject") as string;
    const file = formData.get("file") as File;

    const questions = JSON.parse(formData.get("questions") as string);

    if (!file) {
      return NextResponse.json({ error: "PDF missing" }, { status: 400 });
    }

    let notesText = "";

    // ===============================
    // PDF TEXT EXTRACTION
    // ===============================

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      const { PDFParse } = await import("pdf-parse");

      const parser = new PDFParse({
        data: buffer,
      });

      const result = await parser.getText();

      notesText = result.text || "";

      await parser.destroy();
    } catch (pdfError) {

      notesText = "";
    }

    // ===============================
    // FIREBASE STORAGE UPLOAD
    // ===============================

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileName = `revision-notes/${Date.now()}-${file.name}`;

    const bucket = adminStorage.bucket();

    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // make public url

    await fileRef.makePublic();

    const notesUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // ===============================
    // SAVE REVISION
    // ===============================

    const { data: revision, error } = await supabase
      .from("revisions")
      .insert({
        subject,

        notes_url: notesUrl,

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
