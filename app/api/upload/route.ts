import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const exam_id = formData.get("exam_id") as string;

    if (!file || !exam_id) {
      return new Response(JSON.stringify({ error: "Missing data" }), {
        status: 400,
      });
    }

    const fileName = `${Date.now()}-${file.name}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("answers")
      .upload(fileName, file);

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("answers")
      .getPublicUrl(fileName);

    // Save to DB
    const { error: insertError } = await supabase
      .from("submissions")
      .insert([
        {
          exam_id,
          student_id: null, // 🔥 will replace later with auth
          file_url: urlData.publicUrl,
          status: "uploaded",
        },
      ]);

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ message: "Uploaded successfully" }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}