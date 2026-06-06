import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { PDFParse } from "pdf-parse";


export async function POST(req: Request) {

  try {

    const formData = await req.formData();


    const subject =
      formData.get("subject") as string;


    const file =
      formData.get("file") as File;


    const questions =
      JSON.parse(
        formData.get("questions") as string
      );


    let notesText = "";



    // ===============================
    // PDF TEXT EXTRACTION
    // ===============================

    if (file) {

      const buffer =
        Buffer.from(
          await file.arrayBuffer()
        );


      const parser =
        new PDFParse({
          data: buffer
        });


      const result =
        await parser.getText();


      notesText =
        result.text;


      await parser.destroy();

    }



    // ===============================
    // UPLOAD PDF
    // ===============================


    const fileName =
      `${Date.now()}-${file.name}`;


    const { error: uploadError } =
      await supabase.storage
        .from("revision-notes")
        .upload(
          fileName,
          file
        );


    if (uploadError) {
      throw uploadError;
    }



    const { data: urlData } =
      supabase.storage
        .from("revision-notes")
        .getPublicUrl(fileName);




    // ===============================
    // SAVE REVISION
    // ===============================


    const { data: revision, error } =
      await supabase
        .from("revisions")
        .insert({

          subject,

          notes_url:
            urlData.publicUrl,

          notes_text:
            notesText

        })
        .select()
        .single();



    if (error) {
      throw error;
    }




    // ===============================
    // SAVE QUESTIONS
    // ===============================


    const questionRows =
      questions.map((q:any)=>({

        revision_id:
          revision.id,

        question:
          q.question,

        marks:
          q.marks

      }));



    const {error:qError}=

      await supabase
      .from("revision_questions")
      .insert(questionRows);



    if(qError){
      throw qError;
    }




    return NextResponse.json({

      success:true

    });



  }
  catch(err:any){

    console.log(err);


    return NextResponse.json(
      {
        error:
          err.message
      },
      {
        status:500
      }
    );

  }

}