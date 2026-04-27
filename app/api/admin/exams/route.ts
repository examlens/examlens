import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { title, description } = body;

  const { data, error } = await supabase
    .from("exams")
    .insert([{ title, description }])
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}