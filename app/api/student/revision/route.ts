import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";


// ======================================
// GET STUDENT REVISION CONTENT
// ======================================

export async function GET() {

  try {


    const {
      data,
      error
    } = await supabase
      .from("revisions")
      .select(
        `
        id,
        subject,
        notes_url,
        created_at,

        revision_questions(
          id,
          question,
          marks,
          created_at
        )

        `
      )
      .order(
        "created_at",
        {
          ascending:false
        }
      );



    if(error){

      console.log(
        "Revision Fetch Error:",
        error.message
      );


      return NextResponse.json(
        {
          error:error.message
        },
        {
          status:500
        }
      );

    }



    return NextResponse.json(
      data || [],
      {
        status:200
      }
    );



  }
  catch(err:any){


    console.log(
      "Student Revision API Error:",
      err
    );


    return NextResponse.json(
      {
        error:
        err.message ||
        "Failed to fetch revision"
      },
      {
        status:500
      }
    );

  }

}