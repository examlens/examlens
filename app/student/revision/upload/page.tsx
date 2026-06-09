"use client";


import {
useState
} from "react";

import {
Upload,
Sparkles
} from "lucide-react";


export default function UploadNotes(){


const [title,setTitle]=useState("");

const [subject,setSubject]=useState("");

const [file,setFile]=useState<File|null>(null);

const [loading,setLoading]=useState(false);



async function upload(){


if(!file)
return;



setLoading(true);



const form =
new FormData();



form.append(
"file",
file
);


form.append(
"title",
title
);


form.append(
"subject",
subject
);




const res =
await fetch(
"/api/student/revision/upload",
{
method:"POST",
body:form
}
);



const data =
await res.json();



if(data.success)
alert("Notes uploaded");


setLoading(false);

}




return (

<div className="
min-h-screen
bg-orange-50
p-8
">


<div className="
max-w-xl
mx-auto
bg-white
rounded-[35px]
p-8
shadow-xl
">


<h1 className="
text-3xl
font-black
flex
gap-3
">

<Sparkles className="text-orange-500"/>

My AI Notes


</h1>



<input

placeholder="Notes title"

onChange={
e=>setTitle(e.target.value)
}

className="
border
p-4
rounded-xl
w-full
mt-6
"/>



<input

placeholder="Subject"

onChange={
e=>setSubject(e.target.value)
}

className="
border
p-4
rounded-xl
w-full
mt-4
"/>



<input

type="file"

accept=".pdf"

onChange={
e=>
setFile(
e.target.files?.[0]||null
)
}

className="
mt-5
"/>




<button

onClick={upload}

className="
mt-6
bg-orange-500
text-white
px-6
py-4
rounded-xl
font-bold
flex
gap-2
"


>

<Upload/>

{
loading?
"Uploading..."
:
"Upload Notes"
}


</button>


</div>

</div>

)

}