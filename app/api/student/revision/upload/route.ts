import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {createServerClient} from "@supabase/ssr";
import {supabaseAdmin} from "@/app/lib/supabaseAdmin";



export async function POST(req:Request){


try{


const formData =
await req.formData();


const file =
formData.get("file") as File;


const title =
formData.get("title") as string;


const subject =
formData.get("subject") as string;



if(!file)
return NextResponse.json(
{error:"No file"},
{status:400}
);





const cookieStore =
await cookies();



const supabase =
createServerClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

{
cookies:{
get(name){
return cookieStore.get(name)?.value
}
}
}

);



const {
data:{
user
}
}
=
await supabase.auth.getUser();



if(!user)
return NextResponse.json(
{error:"Unauthorized"},
{status:401}
);





const buffer =
Buffer.from(
await file.arrayBuffer()
);





const path =
`${user.id}/${Date.now()}-${file.name}`;



const {error:uploadError} =
await supabaseAdmin.storage
.from("student-notes")
.upload(
path,
buffer,
{
contentType:file.type
}
);



if(uploadError)
throw uploadError;




const url =
supabaseAdmin.storage
.from("student-notes")
.getPublicUrl(path)
.data
.publicUrl;





/*
temporary content
later replace with pdf extraction
*/

const content = `

Student uploaded notes.

Subject:
${subject}

Title:
${title}

File:
${url}

`;





const {error} =
await supabaseAdmin
.from("student_notes")
.insert({

student_id:user.id,

title,

subject,

file_url:url,

content

});




if(error)
throw error;




return NextResponse.json({
success:true
});



}
catch(e:any){


return NextResponse.json(
{
error:e.message
},
{
status:500
}
);


}


}