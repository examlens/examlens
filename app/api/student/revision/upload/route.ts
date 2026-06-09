import {supabase} from "@/app/lib/supabase";
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
{
return Response.json(
{error:"No file"},
{status:400}
);
}




const {
data:{
user
}
}=await supabase.auth.getUser();



if(!user)
{
return Response.json(
{error:"Unauthorized"},
{status:401}
);
}





const buffer =
Buffer.from(
await file.arrayBuffer()
);



const filePath =
`${user.id}/${Date.now()}-${file.name}`;


const upload =
await supabaseAdmin
.storage
.from("student-notes")
.upload(
filePath,
buffer
);



if(upload.error)
throw upload.error;



const url =
supabaseAdmin
.storage
.from("student-notes")
.getPublicUrl(
filePath
)
.data
.publicUrl;




const {error} =
await supabaseAdmin
.from("student_notes")
.insert({

student_id:user.id,

title,

subject,

file_url:url,

content:""

});



if(error)
throw error;



return Response.json(
{
success:true,
url
}
);



}
catch(e:any){


return Response.json(
{
error:e.message
},
{
status:500
}
);


}


}