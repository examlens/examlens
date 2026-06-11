import {NextResponse} from "next/server";
import {supabase} from "@/app/lib/supabase";
import {supabaseAdmin} from "@/app/lib/supabaseAdmin";


export async function GET(req:Request){

try{


const auth =
req.headers.get("authorization");



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
data:{
user
},
error:userError
}
=
await supabase.auth.getUser(token);



if(userError || !user){

return NextResponse.json(
{
error:"Unauthorized"
},
{
status:401
}
);

}



// fetch notes using admin client
const {
data,
error
}
=
await supabaseAdmin
.from("student_notes")
.select("*")
.eq(
"student_id",
user.id
)
.order(
"created_at",
{
ascending:false
}
);



if(error){

console.log(
"NOTES FETCH ERROR",
error
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



console.log(
"STUDENT NOTES:",
data
);



return NextResponse.json(
data || []
);



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