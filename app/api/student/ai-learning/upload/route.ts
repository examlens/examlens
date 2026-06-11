import {NextResponse} from "next/server";
import {supabase} from "@/app/lib/supabase";
import {supabaseAdmin} from "@/app/lib/supabaseAdmin";


export async function POST(req:Request){

try{


const auth =
req.headers.get(
"authorization"
);


if(!auth){

return NextResponse.json(
{
error:"No token"
},
{
status:401
}
);

}



const token =
auth.replace(
"Bearer ",
""
);



const {
data:{user},
error
}
=
await supabase.auth.getUser(
token
);



if(error || !user){

return NextResponse.json(
{
error:"Unauthorized"
},
{
status:401
}
);

}



const form =
await req.formData();



const file =
form.get("file") as File;


const title =
form.get("title") as string;


const subject =
form.get("subject") as string;



if(!file){

return NextResponse.json(
{
error:"File missing"
},
{
status:400
}
);

}




const buffer =
Buffer.from(
await file.arrayBuffer()
);



const fileName =
`${Date.now()}-${file.name}`;





// upload storage

const upload =
await supabaseAdmin.storage
.from("student-ai-notes")
.upload(
fileName,
buffer,
{
contentType:
file.type
}
);



if(upload.error){

return NextResponse.json(
{
error:upload.error.message
},
{
status:500
}
);

}




const url =
supabaseAdmin.storage
.from("student-ai-notes")
.getPublicUrl(
fileName
)
.data.publicUrl;





// save database

const {error:dbError}
=
await supabaseAdmin
.from("student_notes")
.insert({

student_id:user.id,

title,

subject,

file_url:url

});




if(dbError){

return NextResponse.json(
{
error:dbError.message
},
{
status:500
}
);

}




return NextResponse.json(
{
success:true
}
);



}catch(e:any){


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