"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Users,
  CheckCircle2,
  Clock3,
  Mail,
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2500);
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch students");
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this student permanently?")) return;
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("✅ Student deleted", "success");
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || "Failed to delete student", "error");
    }
  };

  const filteredStudents = students.filter((s) =>
    (s.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const evaluatedCount = students.filter((s) => s.status === "Evaluated").length;
  const pendingCount = students.filter((s) => s.status === "Pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── HERO HEADER ── */}
        <div className="relative overflow-hidden bg-white border border-orange-100 rounded-3xl shadow-lg">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-orange-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
          <div className="relative z-10 p-5 sm:p-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              SaaS Student Dashboard
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
              Student Management
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base leading-relaxed">
              Monitor attendance, evaluation progress, and manage all students from one dashboard.
            </p>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-3 mt-5">

              {/* Total */}
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl px-4 py-4 shadow-lg shadow-orange-200">
                <p className="text-orange-100 text-xs font-semibold">Total</p>
                <h2 className="text-3xl font-black mt-1">{students.length}</h2>
                <div className="mt-2 flex items-center gap-1.5 opacity-80">
                  <Users size={14} />
                  <span className="text-xs font-medium">Students</span>
                </div>
              </div>

              {/* Evaluated */}
              <div className="bg-white border border-green-100 rounded-2xl px-4 py-4 shadow-sm">
                <p className="text-slate-400 text-xs font-semibold">Evaluated</p>
                <h2 className="text-3xl font-black text-green-600 mt-1">{evaluatedCount}</h2>
                <div className="mt-2 flex items-center gap-1.5 text-green-600 opacity-80">
                  <CheckCircle2 size={14} />
                  <span className="text-xs font-medium">Done</span>
                </div>
              </div>

              {/* Pending */}
              <div className="bg-white border border-yellow-100 rounded-2xl px-4 py-4 shadow-sm">
                <p className="text-slate-400 text-xs font-semibold">Pending</p>
                <h2 className="text-3xl font-black text-yellow-500 mt-1">{pendingCount}</h2>
                <div className="mt-2 flex items-center gap-1.5 text-yellow-500 opacity-80">
                  <Clock3 size={14} />
                  <span className="text-xs font-medium">Awaiting</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── SEARCH ── */}
        <div className="bg-white border border-orange-100 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={17} />
            <input
              type="text"
              placeholder="Search students by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-orange-50 border border-orange-100 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-slate-700 placeholder:text-slate-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <p className="text-sm font-semibold text-slate-700">{filteredStudents.length} Found</p>
          </div>
        </div>

        {/* ── TABLE / EMPTY / LOADING ── */}
        {loading ? (
          <div className="bg-white border border-orange-100 rounded-3xl shadow-lg p-14 text-center">
            <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <h2 className="text-xl font-black text-slate-800">Loading Students...</h2>
            <p className="text-slate-400 mt-1 text-sm">Fetching latest data</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white border border-orange-100 rounded-3xl shadow-lg p-14 text-center">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center mb-5">
              <Users size={36} className="text-orange-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">No Students Found</h2>
            <p className="text-slate-400 mt-2 text-sm">Try a different name.</p>
          </div>
        ) : (
          /* scrollable table wrapper */
          <div className="bg-white border border-orange-100 rounded-3xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">

                <thead className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  <tr>
                    <th className="px-5 py-4 text-left font-bold uppercase tracking-wider text-xs whitespace-nowrap">Student</th>
                    <th className="px-5 py-4 text-left font-bold uppercase tracking-wider text-xs whitespace-nowrap">Email</th>
                    <th className="px-5 py-4 text-center font-bold uppercase tracking-wider text-xs whitespace-nowrap">Avg Score</th>
                    <th className="px-5 py-4 text-center font-bold uppercase tracking-wider text-xs whitespace-nowrap">Status</th>
                    <th className="px-5 py-4 text-center font-bold uppercase tracking-wider text-xs whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student: any, index: number) => (
                    <tr
                      key={student.id}
                      className={`border-b border-orange-50 hover:bg-orange-50/40 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-orange-50/10"}`}
                    >

                      {/* STUDENT NAME */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow">
                            {(student.name || "S").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-800 whitespace-nowrap">
                            {student.name || "Student"}
                          </span>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Mail size={14} className="text-orange-400 flex-shrink-0" />
                          <span className="text-xs truncate max-w-[180px]">{student.email}</span>
                        </div>
                      </td>

                      {/* AVG SCORE */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-xl font-black text-sm shadow">
                          {student.avgScore}%
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                          student.status === "Evaluated"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {student.status === "Evaluated"
                            ? <><CheckCircle2 size={13} /> Evaluated</>
                            : <><Clock3 size={13} /> Pending</>
                          }
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl font-bold text-xs shadow transition-all active:scale-95"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── TOAST ── */}
      {toast.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white border border-orange-200 shadow-2xl rounded-2xl px-6 py-5 w-[300px] text-center animate-fadeIn pointer-events-auto">
            <div className={`w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center text-lg ${
              toast.type === "success" ? "bg-orange-100 text-orange-500" : "bg-red-100 text-red-500"
            }`}>
              {toast.type === "success" ? "✔" : "✖"}
            </div>
            <p className="text-sm font-semibold text-slate-700">{toast.message}</p>
            <div className="mt-3 h-1 w-full bg-orange-500 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}