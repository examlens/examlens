"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [examId, setExamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file || !examId) {
      alert("Please select file and enter exam ID");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const filePath = `answers/${Date.now()}_${file.name}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("answers") // 👈 your bucket name
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        alert("Upload failed");
        return;
      }

      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("answers")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      console.log("Public URL:", publicUrl);

      // 3. Save to database
      const { error: dbError } = await supabase.from("submissions").insert({
        file_url: publicUrl,
        exam_id: examId,
        status: "pending",
      });

      if (dbError) {
        console.error(dbError);
        alert("Database insert failed");
        return;
      }

      setMessage("✅ Upload successful!");
      setFile(null);
      setExamId("");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Answer Sheet</h1>

      {/* Exam ID */}
      <input
        type="text"
        placeholder="Enter Exam ID"
        value={examId}
        onChange={(e) => setExamId(e.target.value)}
        className="border p-2 mb-3 block"
      />

      {/* File Input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-3"
      />

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {/* Message */}
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}