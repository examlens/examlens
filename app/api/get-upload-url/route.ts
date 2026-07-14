import { NextResponse } from "next/server";
import { adminStorage } from "@/app/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 },
      );
    }

    const safeName = `revision-notes/${Date.now()}-${fileName}`;
    const bucket = adminStorage.bucket();
    const file = bucket.file(safeName);

    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      contentType,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${safeName}`;

    return NextResponse.json({ uploadUrl, filePath: safeName, publicUrl });
  } catch (err: any) {
    console.log("GET UPLOAD URL ERROR", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}