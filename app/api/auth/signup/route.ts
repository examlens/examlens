import { supabase } from "@/app/lib/supabase";

export async function POST(request: Request) {
  const { user, name } = await request.json();

  await supabase.from("profiles").insert([
    {
      id: user.id,
      name: name,
      role: "student", // or admin
    },
  ]);
}