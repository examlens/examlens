import { NextRequest } from "next/server";
import { supabase } from "./supabase"; // your existing file above
import { supabaseAdmin } from "./supabaseAdmin";

export async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");

  // Validate the token against Supabase auth
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  return data.user; // { id, email, ... }
}

// Optional: fetch role too, since most of our routes need it
export async function getAuthenticatedUserWithRole(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return null;

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  return { ...user, role: profile.role as "admin" | "student" };
}