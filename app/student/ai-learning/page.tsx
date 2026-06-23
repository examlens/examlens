"use client";

import { useEffect, useState } from "react";
import {
  UploadCloud,
  FileText,
  Sparkles,
  Send,
  X,
  BookOpen,
  MessageCircle,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

export default function AILearning() {
  const [notes, setNotes] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<any[]>([]);
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  // ===============================
  // LOAD STUDENT NOTES
  // ===============================

  async function loadNotes() {
    try {
      // get current student session
      const supabase = (await import("@/app/lib/supabase")).supabase;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {

        setNotes([]);

        return;
      }

      // fetch notes from api
      const res = await fetch("/api/student/ai-learning", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      // handle api error
      if (!res.ok) {

        setNotes([]);

        return;
      }

      // update cards
      setNotes(Array.isArray(result) ? result : []);
    } catch (error) {

      setNotes([]);
    }
  }

  // ===============================
  // UPLOAD NOTES
  // ===============================

  async function uploadNotes() {
    if (!file) {
      alert("Select PDF");
      return;
    }

    setUploading(true);

    try {
      const supabase = (await import("@/app/lib/supabase")).supabase;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Login expired");
        return;
      }

      const form = new FormData();

      form.append("file", file);

      form.append("title", title);

      form.append("subject", subject);

      const res = await fetch("/api/student/ai-learning/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Upload failed");

        return;
      }

      alert("Notes uploaded");

      setTitle("");
      setSubject("");
      setFile(null);

      await loadNotes();
    } catch (e) {
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  }

  // ===============================
  // ASK AI
  // ===============================

  async function askAI() {
    if (!message || !active) return;

    const text = message;

    setMessage("");

    setChat((prev) => [
      ...prev,
      {
        role: "student",
        text,
      },
    ]);

    try {
      setLoading(true);

      const res = await fetch("/api/student/ai-learning/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteId: active.id,

          message: text,
        }),
      });

      const data = await res.json();

      setAnswer(data.answer || "No answer found");

      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.answer,
        },
      ]);
    } catch {
      setAnswer("AI failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}

        <div className="bg-white rounded-[28px] md:rounded-[35px] shadow-xl border border-orange-100 p-5 md:p-8 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 flex gap-3 items-center">
              <Sparkles className="text-orange-500 shrink-0" />
              AI Learning Hub
            </h1>

            <p className="text-slate-500 mt-3 text-sm md:text-base">
              Upload your notes and study with AI
            </p>
          </div>
        </div>

        {/* UPLOAD */}

        <div className="bg-white rounded-[28px] md:rounded-[35px] shadow-lg border border-orange-100 p-5 md:p-7 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-black mb-5">Upload Notes</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notes title"
              className="border border-orange-100 rounded-xl p-4 focus:outline-none focus:border-orange-400 transition-colors"
            />

            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="border border-orange-100 rounded-xl p-4 focus:outline-none focus:border-orange-400 transition-colors"
            />

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="border border-orange-100 rounded-xl p-4"
            />
          </div>

          <button
            onClick={uploadNotes}
            disabled={uploading}
            className="mt-5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-6 py-3 rounded-xl font-bold flex gap-2 items-center transition-all duration-150"
          >
            <UploadCloud size={18} />
            {uploading ? "Uploading..." : "Upload Notes"}
          </button>
        </div>

        {/* NOTES */}

        <h2 className="text-2xl md:text-3xl font-black mb-5">My Notes</h2>

        {notes.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-slate-500 border border-orange-100">
            No uploaded notes yet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            {notes.map((n: any) => (
              <div
                key={n.id}
                className="bg-white rounded-[24px] md:rounded-[30px] p-5 md:p-7 shadow-xl border border-orange-100 hover:-translate-y-2 transition-all duration-200"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
                  <BookOpen size={20} />
                </div>

                <h3 className="text-lg md:text-xl font-black mt-4">{n.title}</h3>

                <p className="text-orange-600 font-bold text-sm">{n.subject}</p>

                <a
                  href={n.file_url}
                  target="_blank"
                  className="text-blue-600 block mt-3 text-sm hover:underline"
                >
                  Open PDF
                </a>

                <button
                  onClick={() => { setActive(n); setAnswer(""); setChat([]); }}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 items-center transition-all duration-150 text-sm"
                >
                  <MessageCircle size={16} />
                  Ask AI
                </button>
              </div>
            ))}
          </div>
        )}

        {/* AI CHAT */}

        {active && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 md:p-5">
            <div className="bg-white rounded-none md:rounded-[35px] w-full h-full md:h-auto max-w-5xl md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl modal-enter">
              <div className="bg-orange-500 text-white p-5 md:p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl md:text-2xl font-black">ExamLens AI Tutor</h2>
                  <p className="text-orange-100 text-sm mt-0.5">{active.title}</p>
                </div>

                <button
                  onClick={() => setActive(null)}
                  className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 md:p-8">
                {chat.map((c: any, i) => (
                  <div key={i} className={`rounded-2xl p-4 mb-3 text-sm ${c.role === "student" ? "bg-orange-50 text-slate-700" : "bg-slate-50 border border-slate-100"}`}>
                    <span className="text-xs font-bold text-orange-500 block mb-1">{c.role === "student" ? "You" : "AI"}</span>
                    {c.text}
                  </div>
                ))}

                {answer && (
                  <div className="border border-orange-100 rounded-2xl md:rounded-3xl p-5 md:p-6">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {answer}
                    </ReactMarkdown>
                  </div>
                )}

                {loading && (
                  <p className="text-orange-500 font-bold mt-5 animate-pulse">
                    AI thinking...
                  </p>
                )}
              </div>

              <div className="border-t p-4 flex gap-3">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askAI()}
                  placeholder="Ask from your notes..."
                  className="flex-1 border border-orange-100 rounded-xl p-3 md:p-4 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                />

                <button
                  onClick={askAI}
                  className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-4 md:px-5 rounded-xl transition-all duration-150 flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
