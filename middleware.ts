import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: any) {
  const res = NextResponse.next();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 🔒 If not logged in → redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

// ✅ Protect these routes
export const config = {
  matcher: ["/dashboard", "/admin/:path*"],
};