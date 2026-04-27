import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const exam_id = formData.get("exam_id");

  const fileName = `${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("answers")
    .upload(fileName, file);

  if (uploadError) {
    return new Response(JSON.stringify({ error: uploadError.message }), {
      status: 500,
    });
  }

  const file_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/answers/${fileName}`;

  await supabase.from("submissions").insert([
    {
      exam_id,
      file_url,
      status: "pending",
    },
  ]);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}