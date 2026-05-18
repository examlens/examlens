import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    console.log("🗑️ DELETE USER:", userId);

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // DELETE FROM RESULTS TABLE
    // =====================================================

    const {
      error: resultsDeleteError,
    } = await supabase
      .from("results")
      .delete()
      .eq("student_id", userId);

    if (resultsDeleteError) {
      console.error(
        "❌ Results Delete Error:",
        resultsDeleteError
      );

      return NextResponse.json(
        {
          error:
            resultsDeleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "✅ Results Deleted"
    );

    // =====================================================
    // DELETE FROM SUBMISSIONS TABLE
    // =====================================================

    const {
      error: submissionsDeleteError,
    } = await supabase
      .from("submissions")
      .delete()
      .eq("student_id", userId);

    if (submissionsDeleteError) {
      console.error(
        "❌ Submissions Delete Error:",
        submissionsDeleteError
      );

      return NextResponse.json(
        {
          error:
            submissionsDeleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "✅ Submissions Deleted"
    );

    // =====================================================
    // DELETE FROM USERS TABLE
    // =====================================================

    const {
      error: usersDeleteError,
    } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (usersDeleteError) {
      console.error(
        "❌ Users Table Delete Error:",
        usersDeleteError
      );

      return NextResponse.json(
        {
          error:
            usersDeleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "✅ Users Table Deleted"
    );

    // =====================================================
    // DELETE FROM PROFILES TABLE
    // =====================================================

    const {
      error: profilesDeleteError,
    } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profilesDeleteError) {
      console.error(
        "❌ Profiles Delete Error:",
        profilesDeleteError
      );

      return NextResponse.json(
        {
          error:
            profilesDeleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "✅ Profiles Deleted"
    );

    // =====================================================
    // DELETE AUTH USER
    // =====================================================

    const {
      data: authDeleteData,
      error: authDeleteError,
    } =
      await supabaseAdmin.auth.admin.deleteUser(
        userId
      );

    console.log(
      "🛡️ AUTH DELETE RESPONSE:",
      authDeleteData
    );

    if (authDeleteError) {
      console.error(
        "❌ Auth Delete Error:",
        authDeleteError
      );

      return NextResponse.json(
        {
          error:
            authDeleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "✅ Auth User Deleted"
    );

    // =====================================================
    // SUCCESS RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,
      message:
        "User deleted permanently",
    });
  } catch (err: any) {
    console.error(
      "🔥 DELETE USER ERROR:",
      err
    );

    return NextResponse.json(
      {
        error:
          err.message ||
          "Failed to delete user",
      },
      {
        status: 500,
      }
    );
  }
}