import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId } = body;

    if (!userId) {
      return NextResponse.json({
        success: true,
        message: "User ID is required",
      });
    }

    // DELETE PROFILE

    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    // DELETE USERS TABLE

    await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    // DELETE AUTH USER

    const { error } =
      await supabaseAdmin.auth.admin.deleteUser(
        userId
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {

    return NextResponse.json(
      {
        error: err.message,
      },
      { status: 500 }
    );
  }
}