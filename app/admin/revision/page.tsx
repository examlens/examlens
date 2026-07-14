"use client";

import { useState } from "react";

import {
  UploadCloud,
  FileText,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface Question {
  question: string;
  marks: number;
}

export default function RevisionAdmin() {
  const [subject, setSubject] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      marks: 0,
    },
  ]);

  const [loading, setLoading] = useState(false);

  // ===============================
  // ADD QUESTION
  // ===============================

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        marks: 0,
      },
    ]);
  }

  // ===============================
  // UPDATE QUESTION
  // ===============================

  function updateQuestion(index: number, field: string, value: any) {
    const copy = [...questions];

    copy[index] = {
      ...copy[index],
      [field]: value,
    };

    setQuestions(copy);
  }

  // ===============================
  // DELETE QUESTION
  // ===============================

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  // ===============================
  // SAVE
  // ===============================

  async function save() {
    if (!subject || !file) {
      alert("Subject and PDF required");
      return;
    }

    try {
      setLoading(true);

      // 1. Get a signed upload URL for this file
      const urlRes = await fetch("/api/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });

      if (!urlRes.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, filePath, publicUrl } = await urlRes.json();

      // 2. Upload the PDF directly to Firebase Storage (bypasses your Vercel function)
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("File upload failed");

      // 3. Send only JSON metadata to your API route
      const res = await fetch("/api/admin/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          filePath,
          publicUrl,
          questions,
        }),
      });

      if (!res.ok) throw new Error();

      alert("Revision Content Uploaded");

      setSubject("");
      setFile(null);
      setQuestions([{ question: "", marks: 0 }]);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
min-h-screen
bg-gradient-to-br
from-orange-50
via-white
to-orange-100
p-6
"
    >
      <div
        className="
max-w-7xl
mx-auto
"
      >
        {/* HEADER */}

        <div
          className="
bg-white
rounded-[35px]
shadow-xl
border
border-orange-100
p-8
mb-8
"
        >
          <div
            className="
flex
items-center
gap-4
"
          >
            <div
              className="
w-16
h-16
rounded-3xl
bg-orange-500
flex
items-center
justify-center
text-white
shadow-lg
"
            >
              <BookOpen size={32} />
            </div>

            <div>
              <h1
                className="
text-4xl
font-black
text-slate-800
"
              >
                Revision Center
              </h1>

              <p
                className="
text-slate-500
mt-2
"
              >
                Upload notes and create AI powered revision questions
              </p>
            </div>
          </div>
        </div>

        <div
          className="
grid
lg:grid-cols-3
gap-8
"
        >
          {/* LEFT UPLOAD */}

          <div
            className="
bg-white
rounded-[32px]
border
border-orange-100
shadow-lg
p-6
h-fit
"
          >
            <h2
              className="
text-xl
font-black
text-slate-800
mb-5
"
            >
              Upload Notes
            </h2>

            <div
              className="
border-2
border-dashed
border-orange-300
rounded-3xl
p-8
text-center
bg-orange-50
"
            >
              <UploadCloud
                size={50}
                className="
mx-auto
text-orange-500
"
              />

              <p
                className="
font-bold
mt-4
"
              >
                Upload PDF Notes
              </p>

              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="
mt-5
w-full
text-sm
"
              />

              {file && (
                <div
                  className="
mt-5
bg-white
rounded-xl
p-3
flex
gap-3
items-center
"
                >
                  <FileText className="text-orange-500" />

                  <span
                    className="
text-sm
truncate
"
                  >
                    {file.name}
                  </span>
                </div>
              )}
            </div>

            <label
              className="
block
font-bold
mt-6
mb-2
"
            >
              Subject
            </label>

            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="
Example: Biology
"
              className="
w-full
border
border-orange-200
rounded-2xl
p-4
outline-none
focus:ring-4
focus:ring-orange-100
"
            />

            <button
              onClick={save}
              disabled={loading}
              className="
mt-6
w-full
py-4
rounded-2xl
bg-orange-500
hover:bg-orange-600
text-white
font-black
shadow-lg
transition
"
            >
              {loading ? "Uploading..." : "Publish Revision"}
            </button>
          </div>

          {/* QUESTIONS */}

          <div
            className="
lg:col-span-2
bg-white
rounded-[32px]
border
border-orange-100
shadow-lg
p-6
"
          >
            <div
              className="
flex
justify-between
items-center
mb-6
"
            >
              <h2
                className="
text-2xl
font-black
"
              >
                Questions
              </h2>

              <button
                onClick={addQuestion}
                className="
flex
gap-2
items-center
bg-orange-100
text-orange-700
px-5
py-3
rounded-xl
font-bold
"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            <div
              className="
space-y-5
"
            >
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="
bg-orange-50
rounded-3xl
p-5
border
border-orange-100
"
                >
                  <div
                    className="
flex
justify-between
mb-3
"
                  >
                    <h3
                      className="
font-black
text-slate-700
"
                    >
                      Question {index + 1}
                    </h3>

                    <button
                      onClick={() => removeQuestion(index)}
                      className="
text-red-500
"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <textarea
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(index, "question", e.target.value)
                    }
                    placeholder="
Enter revision question...
"
                    rows={4}
                    className="
w-full
rounded-2xl
p-4
border
border-orange-200
outline-none
"
                  />

                  <input
                    type="number"
                    placeholder="Marks"
                    value={q.marks}
                    onChange={(e) =>
                      updateQuestion(index, "marks", Number(e.target.value))
                    }
                    className="
mt-3
w-full
rounded-2xl
p-4
border
border-orange-200
"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
