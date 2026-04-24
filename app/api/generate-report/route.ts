import PDFDocument from "pdfkit";

export async function POST(req: Request) {
  try {
    const { submission } = await req.json();

    const doc = new PDFDocument();

    const chunks: Uint8Array[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    return await new Promise((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);

        resolve(
          new Response(pdfBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": "attachment; filename=report.pdf",
            },
          })
        );
      });

      // 📄 CONTENT
      doc.fontSize(18).text("AI Exam Evaluation Report", {
        align: "center",
      });

      doc.moveDown();

      doc.fontSize(12).text(
        `Score: ${submission.score} / ${submission.total}`
      );

      doc.moveDown();

      doc.text("Extracted Answer:");
      doc.moveDown(0.5);
      doc.fontSize(10).text(submission.extractedText || "N/A");

      doc.moveDown();

      doc.fontSize(12).text("Breakdown:");

      if (submission.breakdown) {
        submission.breakdown.forEach((q: any) => {
          doc.moveDown(0.5);
          doc.fontSize(10).text(`Q${q.question_index}`);
          doc.text(`Marks: ${q.score}`);
          doc.text(`Feedback: ${q.feedback}`);
        });
      }

      // ✅ IMPORTANT (this was missing in many cases)
      doc.end();
    });
  } catch (err) {
    console.log("PDF ERROR:", err);

    return new Response(
      JSON.stringify({ error: "PDF generation failed" }),
      { status: 500 }
    );
  }
}