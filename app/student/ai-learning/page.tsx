"use client";

import {useEffect,useState} from "react";
import {
UploadCloud,
FileText,
Sparkles,
Send,
X,
BookOpen,
MessageCircle
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";


export default function AILearning(){

const [notes,setNotes]=useState<any[]>([]);
const [active,setActive]=useState<any>(null);

const [title,setTitle]=useState("");
const [subject,setSubject]=useState("");
const [file,setFile]=useState<File|null>(null);

const [message,setMessage]=useState("");
const [chat,setChat]=useState<any[]>([]);
const [answer,setAnswer]=useState("");

const [loading,setLoading]=useState(false);
const [uploading,setUploading]=useState(false);



useEffect(()=>{
loadNotes();
},[]);



// ===============================
// LOAD STUDENT NOTES
// ===============================

async function loadNotes(){

try{


// get current student session
const supabase =
(await import("@/app/lib/supabase"))
.supabase;



const {
data:{
session
}
}
=
await supabase.auth.getSession();



if(!session){

console.log(
"NO ACTIVE SESSION"
);

setNotes([]);

return;

}




// fetch notes from api
const res =
await fetch(
"/api/student/ai-learning",
{
method:"GET",
headers:{
Authorization:
`Bearer ${session.access_token}`,
"Content-Type":
"application/json"
}
}
);




const result =
await res.json();



console.log(
"AI LEARNING NOTES:",
result
);



// handle api error
if(!res.ok){

console.log(
"NOTES FETCH ERROR",
result.error
);

setNotes([]);

return;

}




// update cards
setNotes(
Array.isArray(result)
?
result
:
[]
);



}catch(error){

console.log(
"LOAD NOTES ERROR",
error
);


setNotes([]);

}

}



// ===============================
// UPLOAD NOTES
// ===============================

async function uploadNotes(){

if(!file){
alert("Select PDF");
return;
}


setUploading(true);



try{


const supabase =
(await import("@/app/lib/supabase"))
.supabase;



const {
data:{
session
}
}=await supabase.auth.getSession();



if(!session){
alert("Login expired");
return;
}



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
"/api/student/ai-learning/upload",
{
method:"POST",
headers:{
Authorization:
`Bearer ${session.access_token}`
},
body:form
}
);



const data =
await res.json();



if(!res.ok){

alert(
data.error ||
"Upload failed"
);

return;

}



alert("Notes uploaded");

setTitle("");
setSubject("");
setFile(null);


await loadNotes();



}catch(e){

alert("Upload error");

}
finally{

setUploading(false);

}

}



// ===============================
// ASK AI
// ===============================

async function askAI(){


if(!message || !active)
return;



const text =
message;


setMessage("");



setChat(prev=>[
...prev,
{
role:"student",
text
}
]);



try{


setLoading(true);



const res =
await fetch(
"/api/student/ai-learning/chat",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({

noteId:
active.id,

message:text

})
}
);



const data =
await res.json();



setAnswer(
data.answer ||
"No answer found"
);



setChat(prev=>[
...prev,
{
role:"ai",
text:data.answer
}
]);


}catch{


setAnswer(
"AI failed"
);

}
finally{

setLoading(false);

}


}




return (

<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-6">

<div className="max-w-7xl mx-auto">


{/* HEADER */}

<div className="bg-white rounded-[35px] shadow-xl border border-orange-100 p-8 mb-8 flex justify-between items-center">


<div>

<h1 className="text-4xl font-black text-slate-800 flex gap-3 items-center">

<Sparkles className="text-orange-500"/>

AI Learning Hub

</h1>


<p className="text-slate-500 mt-3">

Upload your notes and study with AI

</p>


</div>


</div>





{/* UPLOAD */}

<div className="bg-white rounded-[35px] shadow-lg border border-orange-100 p-7 mb-10">


<h2 className="text-2xl font-black mb-5">

Upload Notes

</h2>



<div className="grid md:grid-cols-3 gap-4">


<input
value={title}
onChange={e=>setTitle(e.target.value)}
placeholder="Notes title"
className="border rounded-xl p-4"
/>


<input
value={subject}
onChange={e=>setSubject(e.target.value)}
placeholder="Subject"
className="border rounded-xl p-4"
/>



<input
type="file"
accept=".pdf"
onChange={e=>setFile(e.target.files?.[0]||null)}
className="border rounded-xl p-4"
/>


</div>



<button
onClick={uploadNotes}
disabled={uploading}
className="mt-5 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold flex gap-2"
>

<UploadCloud/>

{
uploading?
"Uploading..."
:
"Upload Notes"
}

</button>


</div>







{/* NOTES */}

<h2 className="text-3xl font-black mb-5">

My Notes

</h2>



{
notes.length===0 ?


<div className="bg-white rounded-3xl p-10 text-center text-slate-500">

No uploaded notes yet

</div>


:

<div className="grid md:grid-cols-3 gap-6">


{
notes.map((n:any)=>(


<div
key={n.id}
className="bg-white rounded-[30px] p-7 shadow-xl border border-orange-100 hover:-translate-y-2 transition"
>


<div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white">

<BookOpen/>

</div>



<h3 className="text-xl font-black mt-5">

{n.title}

</h3>



<p className="text-orange-600 font-bold">

{n.subject}

</p>



<a
href={n.file_url}
target="_blank"
className="text-blue-600 block mt-3"
>

Open PDF

</a>



<button

onClick={()=>{

setActive(n);

setAnswer("");

setChat([]);

}}

className="mt-5 bg-orange-500 text-white px-5 py-3 rounded-xl font-bold flex gap-2"
>

<MessageCircle/>

Ask AI

</button>



</div>


))

}


</div>

}







{/* AI CHAT */}


{
active &&

<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">


<div className="bg-white rounded-[35px] w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col shadow-2xl">



<div className="bg-orange-500 text-white p-6 flex justify-between">


<div>

<h2 className="text-2xl font-black">

ExamLens AI Tutor

</h2>


<p>

{active.title}

</p>

</div>



<button
onClick={()=>setActive(null)}
>

<X/>

</button>


</div>





<div className="flex-1 overflow-y-auto p-8">


{
chat.map((c:any,i)=>(


<div
key={i}
className="bg-orange-50 rounded-2xl p-4 mb-3"
>

{c.text}

</div>


))

}




{
answer &&

<div className="border rounded-3xl p-6">


<ReactMarkdown
remarkPlugins={[remarkMath]}
rehypePlugins={[rehypeKatex]}
>

{answer}

</ReactMarkdown>


</div>

}




{
loading &&
<p className="text-orange-500 font-bold mt-5">

AI thinking...

</p>

}


</div>





<div className="border-t p-5 flex gap-3">


<input

value={message}

onChange={e=>setMessage(e.target.value)}

placeholder="Ask from your notes..."

className="flex-1 border rounded-xl p-4"

/>



<button
onClick={askAI}
className="bg-orange-500 text-white px-5 rounded-xl"
>

<Send/>

</button>


</div>



</div>


</div>

}


</div>

</div>

)

}