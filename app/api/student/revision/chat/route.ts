import OpenAI from "openai";


const openai =
new OpenAI({
apiKey:
process.env.OPENAI_API_KEY
});



export async function POST(req:Request){


const {
question,
context
}=await req.json();



const completion =
await openai.chat.completions.create({

model:"gpt-4.1-mini",


messages:[

{
role:"system",

content:
`
Answer only using notes.
Give clear student explanation.
Include formulas and flow charts when needed.
`
},


{
role:"user",

content:
`
Notes:

${context}


Question:

${question}
`
}

]


});



return Response.json({

answer:
completion.choices[0]
.message
.content

});


}