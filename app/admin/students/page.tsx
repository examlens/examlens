"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Users,
  GraduationCap,
  Mail,
  Activity,
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
      "Are you sure you want to remove this student?"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 p-6">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>
          <h1 className="text-4xl font-black text-slate-800">
            Student Management
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Monitor attendance,
            performance and manage
            student accounts
          </p>
        </div>

        {/* STATS */}
        <div className="flex gap-4 flex-wrap">

          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl px-6 py-4 min-w-[170px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Users className="text-blue-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Total Students
                </p>

                <h2 className="text-2xl font-bold text-slate-800">
                  {students.length}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl px-6 py-4 min-w-[170px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                <Activity className="text-green-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Active
                </p>

                <h2 className="text-2xl font-bold text-slate-800">
                  {
                    students.filter(
                      (s) =>
                        s.status ===
                        "Evaluated"
                    ).length
                  }
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SEARCH BAR */}
      {/* ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 mb-8">

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
        <div className="bg-white rounded-3xl shadow-sm p-16 text-center">
          <div className="animate-spin w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-5" />

          <p className="text-slate-500 text-lg">
            Loading students...
          </p>
        </div>
      ) : filteredStudents.length ===
        0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-16 text-center">
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
        <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-7">

          {filteredStudents.map(
            (student: any) => (
              <div
                key={student.id}
                className="group bg-white rounded-[30px] border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >

                {/* TOP SECTION */}
                <div className="relative p-6 pb-0">

                  {/* BG */}
                  <div className="absolute inset-0 h-36 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 opacity-95" />

                  {/* CONTENT */}
                  <div className="relative z-10">

                    {/* AVATAR */}
                    <div className="w-24 h-24 rounded-[28px] bg-white shadow-xl flex items-center justify-center text-4xl font-black text-blue-700 mx-auto border-4 border-white">
                      {(student.name ||
                        "S")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* NAME */}
                    <div className="text-center mt-5">
                      <h2 className="text-2xl font-bold text-white">
                        {student.name ||
                          "Student"}
                      </h2>

                      <div className="flex items-center justify-center gap-2 text-blue-100 text-sm mt-2">
                        <Mail size={15} />

                        <span className="truncate max-w-[220px]">
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BODY */}
                <div className="p-6">

                  {/* SCORE */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-center">

                    <p className="text-slate-500 text-sm">
                      Average Score
                    </p>

                    <h1 className="text-5xl font-black text-orange-500 mt-2">
                      {student.avgScore !==
                        null &&
                      student.avgScore !==
                        undefined
                        ? `${student.avgScore}%`
                        : "--"}
                    </h1>
                  </div>

                  {/* STATUS */}
                  <div className="flex items-center justify-between mt-5">

                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
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

                    <div className="flex items-center gap-2 text-slate-500">
                      <GraduationCap size={18} />

                      <span className="text-sm font-medium">
                        {
                          student.attendance
                        }
                        %
                      </span>
                    </div>
                  </div>

                  {/* ATTENDANCE */}
                  <div className="mt-6">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-slate-500">
                        Attendance
                      </span>

                      <span className="font-semibold text-slate-700">
                        {
                          student.attendance
                        }
                        %
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{
                          width: `${student.attendance}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* REMOVE BUTTON */}
                  <button
                    onClick={() =>
                      handleDelete(
                        student.id
                      )
                    }
                    className="mt-7 w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-2xl font-semibold transition-all duration-300"
                  >
                    <Trash2 size={18} />

                    Remove Student
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}