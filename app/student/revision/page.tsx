"use client";

import {
  useEffect,
  useState
} from "react";

import {
  BookOpen,
  FileText,
  MessageCircle,
  Send,
  Sparkles,
  X
} from "lucide-react";


import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";



export default function RevisionPage(){


const [data,setData]=useState<any[]>([]);

const [selected,setSelected]=useState<any>(null);

const [activeQuestion,setActiveQuestion]=useState<any>(null);


const [message,setMessage]=useState("");

const [chat,setChat]=useState<any[]>([]);


const [loading,setLoading]=useState(false);


const [showAnswer,setShowAnswer]=useState(false);

const [answer,setAnswer]=useState("");





useEffect(()=>{


async function load(){

try{


const res =
await fetch(
"/api/student/revision"
);


const result =
await res.json();



setData(
Array.isArray(result)
?
result
:
[]
);



}
catch(e){

setData([]);

}


}


load();


},[]);







async function askAI(){


if(!message || !activeQuestion)
return;



const question =
message;



setMessage("");



setChat(prev=>[
...prev,
{
role:"student",
text:question
}
]);




try{


setLoading(true);



const res =
await fetch(
"/api/ai/revision-chat",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},


body:JSON.stringify({

questionId:
activeQuestion.id,

userMessage:
question

})

}

);



const result =
await res.json();




setAnswer(
result.answer ||
"No answer found"
);



setShowAnswer(true);




setChat(prev=>[
...prev,
{
role:"ai",
text:
result.answer
}
]);




}
catch(e){


setAnswer(
"AI failed to generate answer"
);


setShowAnswer(true);


}
finally{

setLoading(false);

}



}






return (

<div className="
min-h-screen
bg-gradient-to-br
from-orange-50
via-white
to-orange-100
p-6
">


<div className="max-w-7xl mx-auto">



{/* HEADER */}

<div className="
bg-white
rounded-[35px]
shadow-xl
border
border-orange-100
p-8
mb-8
">


<h1 className="
text-4xl
font-black
text-slate-800
flex
gap-3
items-center
">

<Sparkles className="text-orange-500"/>

AI Revision Center

</h1>


<p className="text-slate-500 mt-3">

Learn from admin notes with AI Tutor

</p>


</div>





{/* SUBJECTS */}


{!selected && (


<div className="
grid
md:grid-cols-3
gap-6
">


{
data.map((item:any)=>(


<div

key={item.id}

onClick={()=>setSelected(item)}

className="
bg-white
rounded-[30px]
p-7
border
border-orange-100
shadow-lg
cursor-pointer
hover:-translate-y-2
transition
"


>


<div className="
w-16
h-16
rounded-2xl
bg-orange-500
flex
items-center
justify-center
text-white
mb-5
">

<BookOpen/>


</div>



<h2 className="
text-2xl
font-black
">

{item.subject}

</h2>



<p className="text-slate-500 mt-2">

{item.revision_questions?.length || 0}
Questions

</p>


</div>


))

}


</div>


)}







{/* QUESTIONS */}



{
selected && (


<div>


<button

onClick={()=>setSelected(null)}

className="
mb-5
text-orange-600
font-bold
"

>

← Back Subjects

</button>





<div className="
bg-white
rounded-[35px]
shadow-xl
p-7
mb-6
">


<div className="
flex
justify-between
items-center
">


<h2 className="
text-3xl
font-black
">

{selected.subject}

</h2>



<a

href={selected.notes_url}

target="_blank"

className="
bg-orange-500
text-white
px-5
py-3
rounded-xl
flex
gap-2
font-bold
"

>

<FileText size={18}/>

Notes

</a>


</div>


</div>








<div className="space-y-5">


{
selected.revision_questions?.map((q:any)=>(



<div

key={q.id}

className="
bg-white
rounded-3xl
p-6
shadow-lg
border
border-orange-100
"

>


<h2 className="
text-xl
font-bold
text-slate-800
">

{q.question}

</h2>




<div className="
mt-5
">


<span className="
bg-orange-100
text-orange-700
px-4
py-2
rounded-full
font-bold
">

{q.marks} Marks

</span>


</div>


</div>



))

}


</div>


</div>


)

}









{/* FLOATING AI BUTTON */}


<button

onClick={()=>{

setActiveQuestion(
selected?.revision_questions?.[0]
);

setAnswer("");

setChat([]);

}}

className="
fixed
right-8
bottom-8
z-40
w-16
h-16
rounded-full
bg-orange-500
text-white
shadow-2xl
flex
items-center
justify-center
hover:scale-110
transition
"


>


<MessageCircle size={30}/>


</button>








{/* AI POPUP */}



{
activeQuestion && (


<div className="
fixed
inset-0
z-50
bg-black/50
backdrop-blur-sm
flex
items-center
justify-center
p-5
">



<div className="
bg-white
w-full
max-w-5xl
rounded-[35px]
shadow-2xl
overflow-hidden
max-h-[90vh]
flex
flex-col
">






{/* HEADER */}


<div className="
bg-gradient-to-r
from-orange-500
to-amber-500
p-6
text-white
flex
justify-between
">


<div>


<h2 className="
text-2xl
font-black
">

ExamLens AI Tutor

</h2>



{/* <p className="text-orange-100 mt-2">

Question:

{activeQuestion.question}

</p> */}


{/* <p className="text-orange-200">

Marks: {activeQuestion.marks}

</p> */}


</div>




<button

onClick={()=>
setActiveQuestion(null)
}

>

<X/>

</button>



</div>







{/* ANSWER */}



<div className="
flex-1
overflow-y-auto
p-8
">


{

answer ?


<ReactMarkdown

remarkPlugins={[
remarkMath
]}

rehypePlugins={[
rehypeKatex
]}

components={{

pre({children}){

return (

<pre className="
bg-slate-900
text-white
p-5
rounded-2xl
overflow-x-auto
">

{children}

</pre>

)

}

}}

>


{answer}


</ReactMarkdown>


:


<div className="
text-center
text-slate-400
py-20
">

Ask AI about this question

</div>


}




{
loading &&

<p className="
mt-5
text-orange-500
font-bold
">

AI is thinking...

</p>

}



</div>







{/* INPUT */}



<div className="
border-t
p-5
flex
gap-3
">


<input

value={message}

onChange={
e=>setMessage(e.target.value)
}

placeholder="
Ask explanation from notes...
"

className="
flex-1
border
rounded-xl
p-4
"


/>




<button

onClick={askAI}

className="
bg-orange-500
text-white
px-5
rounded-xl
"

>


<Send/>

</button>



</div>





</div>


</div>


)

}





</div>


</div>

)

}