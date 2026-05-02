export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  const body = new FormData();
  body.append("file", file as Blob);
  body.append("apikey", "YOUR_OCR_KEY");

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body,
  });

  const data = await res.json();

  return Response.json({
    text: data.ParsedResults?.[0]?.ParsedText || "",
  });
}