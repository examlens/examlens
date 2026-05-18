"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Users,
  GraduationCap,
  Mail,
  CheckCircle2,
  Clock3,
  Eye,
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  // ======================================================
  // FETCH STUDENTS
  // ======================================================

  const fetchStudents = async () => {
    try {
      const res = await fetch(
        "/api/admin/students"
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to fetch students"
        );
      }

      setStudents(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.log(err);

      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ======================================================
  // DELETE STUDENT
  // ======================================================

  const handleDelete = async (
    id: string
  ) => {
    const confirmDelete = confirm(
      "Are you sure you want to permanently remove this student?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        "/api/admin/students",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to remove student"
        );
      }

      setStudents((prev) =>
        prev.filter(
          (student) =>
            student.id !== id
        )
      );

      alert(
        "Student removed successfully"
      );
    } catch (err: any) {
      console.log(err);

      alert(
        err.message ||
          "Failed to remove student"
      );
    }
  };

  // ======================================================
  // FILTER STUDENTS
  // ======================================================

  const filteredStudents =
    students.filter((student) =>
      (student.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  // ======================================================
  // STATS
  // ======================================================

  const evaluatedCount =
    students.filter(
      (s) =>
        s.status === "Evaluated"
    ).length;

  const pendingCount =
    students.filter(
      (s) =>
        s.status === "Pending"
    ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 p-4 md:p-6">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="mb-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

        {/* LEFT */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            Student Management
          </h1>

          <p className="text-slate-500 mt-2 text-base md:text-lg">
            Monitor attendance,
            evaluation status and
            manage student accounts
          </p>
        </div>

        {/* RIGHT STATS */}
        <div className="flex flex-wrap gap-4">

          {/* TOTAL */}
          <div className="bg-white border border-slate-200 rounded-3xl px-5 py-4 shadow-sm min-w-[170px]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Users className="text-blue-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Total Students
                </p>

                <h2 className="text-2xl font-black text-slate-800">
                  {students.length}
                </h2>
              </div>
            </div>
          </div>

          {/* EVALUATED */}
          <div className="bg-white border border-slate-200 rounded-3xl px-5 py-4 shadow-sm min-w-[170px]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="text-green-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Evaluated
                </p>

                <h2 className="text-2xl font-black text-green-600">
                  {evaluatedCount}
                </h2>
              </div>
            </div>
          </div>

          {/* PENDING */}
          <div className="bg-white border border-slate-200 rounded-3xl px-5 py-4 shadow-sm min-w-[170px]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
                <Clock3 className="text-yellow-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Pending
                </p>

                <h2 className="text-2xl font-black text-yellow-600">
                  {pendingCount}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SEARCH BAR */}
      {/* ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-[26px] shadow-sm p-4 mb-8">

        <div className="relative max-w-md">
          <Search
            className="absolute left-4 top-4 text-slate-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
        </div>
      </div>

      {/* ====================================================== */}
      {/* LOADING */}
      {/* ====================================================== */}

      {loading ? (
        <div className="bg-white rounded-[26px] shadow-sm p-16 text-center">
          <div className="animate-spin w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-5" />

          <p className="text-slate-500 text-lg">
            Loading students...
          </p>
        </div>
      ) : filteredStudents.length ===
        0 ? (
        <div className="bg-white rounded-[26px] shadow-sm p-16 text-center">
          <Users
            size={60}
            className="mx-auto text-slate-300 mb-5"
          />

          <h2 className="text-2xl font-bold text-slate-700">
            No Students Found
          </h2>

          <p className="text-slate-500 mt-2">
            Try searching with another
            name
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-5">

          {filteredStudents.map(
            (student: any) => (
              <div
                key={student.id}
                className="group relative bg-white rounded-[24px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >

                {/* TOP */}
                <div className="h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500" />

                {/* CONTENT */}
                <div className="px-4 pb-4 relative">

                  {/* AVATAR */}
                  <div className="-mt-10 relative z-10">
                    <div className="w-20 h-20 rounded-[22px] bg-white shadow-lg border-[5px] border-white flex items-center justify-center mx-auto">
                      <span className="text-2xl font-black text-blue-700">
                        {(student.name ||
                          "S")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* NAME */}
                  <div className="text-center mt-3">
                    <h2 className="text-lg font-black text-slate-800 truncate">
                      {student.name ||
                        "Student"}
                    </h2>

                    <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-2">
                      <Mail size={13} />

                      <span className="truncate max-w-[180px]">
                        {student.email}
                      </span>
                    </div>
                  </div>

                  {/* SCORE */}
                  <div className="mt-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-[22px] p-4 text-white shadow-md">

                    <p className="text-orange-100 text-xs">
                      Average Score
                    </p>

                    <h1 className="text-4xl font-black mt-1">
                      {student.avgScore}%
                    </h1>
                  </div>

                  {/* STATUS */}
                  <div className="flex items-center justify-between mt-4">

                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        student.status ===
                        "Evaluated"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {student.status ===
                      "Evaluated"
                        ? "✓ Evaluated"
                        : "⏳ Pending"}
                    </div>

                    <div className="flex items-center gap-1 text-slate-700 font-semibold text-sm">
                      <GraduationCap size={15} />

                      <span>
                        {
                          student.attendance
                        }
                        %
                      </span>
                    </div>
                  </div>

                  {/* ATTENDANCE */}
                  <div className="mt-4">

                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-500">
                        Attendance
                      </span>

                      <span className="font-bold text-slate-700">
                        {
                          student.attendance
                        }
                        %
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{
                          width: `${student.attendance}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* BUTTONS */}
                  <div className="mt-5 flex gap-2">

                    {/* VIEW */}
                    {/* <Link
                      href={`/admin/students/${student.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 text-sm"
                    >
                      <Eye size={16} />

                      View
                    </Link> */}

                    {/* DELETE */}
                    <button
                      onClick={() =>
                        handleDelete(
                          student.id
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 text-sm"
                    >
                      <Trash2 size={16} />

                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}