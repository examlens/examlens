import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { adminStorage } from "@/app/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const subject = formData.get("subject") as string;
    const file = formData.get("file") as File;
    const questions = JSON.parse(formData.get("questions") as string);

    let notesText = "";
    let fileArrayBuffer: ArrayBuffer | undefined;

    // ===============================
    // PDF TEXT EXTRACTION
    // ===============================

    if (file) {
      fileArrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileArrayBuffer);

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
      const parser = new PDFParse({ data: uint8Array });
      const parsed = await parser.getText();
      await parser.destroy();

      notesText = parsed.text || "";
    }

    // ===============================
    // UPLOAD PDF TO FIREBASE
    // ===============================

    const fileName = `${Date.now()}-${file?.name || "revision.pdf"}`;

    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(`revision-notes/${fileName}`);
    // reuse array buffer from above when available to avoid double reads
    const uploadBuffer = fileArrayBuffer
      ? Buffer.from(new Uint8Array(fileArrayBuffer))
      : Buffer.from("");

    await fileRef.save(uploadBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const notesUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/revision-notes%2F${encodeURIComponent(fileName)}?alt=media`;

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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}