import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { PDFParse } from "pdf-parse";
import { adminStorage } from "@/app/lib/firebaseAdmin";


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
    // UPLOAD PDF TO FIREBASE
    // ===============================


    const fileName =
      `${Date.now()}-${file.name}`;


    let notesUrl: string;
    try {
      const bucket = adminStorage.bucket();
      const fileRef = bucket.file(`revision-notes/${fileName}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });
      
      // Generate public URL for Firebase Storage
      const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      notesUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/revision-notes%2F${encodeURIComponent(fileName)}?alt=media`;
    } catch (uploadError: any) {
      throw uploadError;
    }

    // ===============================
    // SAVE REVISION
    // ===============================

    const { data: revision, error } =
      await supabase
        .from("revisions")
        .insert({

          subject,

          notes_url:
            notesUrl,

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