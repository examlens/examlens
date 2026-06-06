import {NextResponse} from "next/server";
import OpenAI from "openai";
import {supabase} from "@/app/lib/supabase";


const openai =
new OpenAI({
apiKey:
process.env.OPENAI_API_KEY
});



export async function POST(req:Request){


try{


const {
questionId,
userMessage
}=await req.json();




const {data:q}=await supabase
.from("revision_questions")
.select(`
question,
marks,
revision_id
`)
.eq(
"id",
questionId
)
.single();

if (!q) {
	return NextResponse.json({ error: "Question not found" }, { status: 404 });
}





const {data:r}=await supabase
.from("revisions")
.select(`
subject,
notes_text
`)
.eq(
"id",
q.revision_id
)
.single();

if (!r) {
	return NextResponse.json({ error: "Revision not found" }, { status: 404 });
}





const prompt = `

You are an expert exam tutor.

Subject:
${r.subject}


Reference notes:
${r.notes_text}


Question:
${q.question}


Student asked:
${userMessage}


Marks:
${q.marks}


Instructions:

1. Answer only from notes.
2. Make answer suitable for ${q.marks} marks.
3. Give headings.
4. Give bullet points.
5. Add diagram/flowchart using text if needed.
6. Do not mention AI.

`;




const completion =
await openai.chat.completions.create({

model:"gpt-4.1-mini",


messages:[
{
role:"user",
content:prompt
}
]

});




return NextResponse.json({

answer:
completion.choices?.[0]?.message?.content ?? null

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