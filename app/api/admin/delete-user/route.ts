import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase =
  createClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(
  req: Request
) {
  try {
    const { id } =
      await req.json();

    const { error } =
      await adminSupabase.auth.admin.deleteUser(
        id
      );

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Failed to delete user",
      },
      { status: 500 }
    );
  }
}