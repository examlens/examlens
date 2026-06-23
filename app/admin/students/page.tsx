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
  // TOAST

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // ======================================================
  // TOAST FUNCTION
  // ======================================================

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  };

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
    userId: string
  ) => {
    const confirmDelete = confirm (
      "Delete this student permanently?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        "/api/admin/delete-user",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      showToast("✅ Student deleted", "success");

      fetchStudents();
    } catch (err: any) {

      showToast(err.message || "Failed to delete student", "error");
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
      <div className="max-w-5xl mx-auto">

      {/* ====================================================== */}
      {/* HERO HEADER */}
      {/* ====================================================== */}

      <div className="relative overflow-hidden bg-white border border-orange-100 rounded-[36px] shadow-xl mb-8">

          {/* BACKGROUND DECOR */}

          <div className="absolute -top-24 -right-24 w-80 h-80 bg-orange-200 rounded-full blur-3xl opacity-30" />

          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-100 rounded-full blur-3xl opacity-30" />

          <div className="relative z-10 p-7 md:p-10">

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

              {/* LEFT */}

              <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold mb-5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  SaaS Student Dashboard
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  Student Management
                </h1>

                <p className="text-slate-500 mt-5 text-lg leading-relaxed">
                  Monitor attendance, evaluation progress, performance analytics,
                  and manage all student activities from one modern dashboard.
                </p>
              </div>

              {/* RIGHT STATS */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full xl:w-auto">

                {/* TOTAL */}

                <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-[28px] px-6 py-5 shadow-2xl shadow-orange-200 min-w-[210px]">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        Total Students
                      </p>

                      <h2 className="text-4xl font-black mt-2">
                        {students.length}
                      </h2>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Users size={28} />
                    </div>
                  </div>
                </div>

                {/* EVALUATED */}

                <div className="bg-white z-1 border border-orange-100 rounded-[28px] px-6 py-5 shadow-lg min-w-[210px]">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-slate-500 text-sm font-medium">
                        Evaluated
                      </p>

                      <h2 className="text-4xl font-black text-green-600 mt-2">
                        {evaluatedCount}
                      </h2>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                      <CheckCircle2
                        size={28}
                        className="text-green-600"
                      />
                    </div>
                  </div>
                </div>

                {/* PENDING */}

                <div className="bg-white z-2 border border-orange-100 rounded-[28px] px-6 py-5 shadow-lg min-w-[210px]">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-slate-500 text-sm font-medium">
                        Pending
                      </p>

                      <h2 className="text-4xl font-black text-yellow-500 mt-2">
                        {pendingCount}
                      </h2>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center">
                      <Clock3
                        size={28}
                        className="text-yellow-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* SEARCH + FILTER */}
        {/* ====================================================== */}

        <div className="bg-white border border-orange-100 rounded-[30px] shadow-lg p-5 mb-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            {/* SEARCH */}

            <div className="relative w-full lg:max-w-xl">

              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Search students by name or email..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                w-full
                bg-orange-50/50
                border
                border-orange-100
                rounded-2xl
                pl-14
                pr-5
                py-4
                outline-none
                focus:ring-4
                focus:ring-orange-100
                focus:border-orange-400
                text-slate-700
                placeholder:text-slate-400
                transition-all
              "
              />
            </div>

            {/* SMALL INFO */}

            <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3">

              <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />

              <p className="text-sm font-semibold text-slate-700">
                {filteredStudents.length} Students Available
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* LOADING */}
        {/* ====================================================== */}

        {loading ? (
          <div className="bg-white border border-orange-100 rounded-[32px] shadow-xl p-16 text-center">

            <div className="w-16 h-16 border-[5px] border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />

            <h2 className="text-2xl font-black text-slate-800">
              Loading Students...
            </h2>

            <p className="text-slate-500 mt-2">
              Fetching latest student data
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white border border-orange-100 rounded-[32px] shadow-xl p-16 text-center">

            <div className="mx-auto w-28 h-28 rounded-[30px] bg-orange-100 flex items-center justify-center mb-7">
              <Users
                size={50}
                className="text-orange-500"
              />
            </div>

            <h2 className="text-3xl font-black text-slate-900">
              No Students Found
            </h2>

            <p className="text-slate-500 mt-4 text-lg">
              Try searching with another student name or email.
            </p>
          </div>
        ) : (

          /* ====================================================== */
          /* TABLE */
          /* ====================================================== */

          <div className="overflow-hidden rounded-[32px] border border-orange-100 bg-white shadow-2xl">

            {/* TABLE HEADER */}

              <div className="w-full overflow-x-auto">

                <table className="w-full table-fixed text-sm">

                <thead className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">

                  <tr>

                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Student
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Email
                    </th>

                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider">
                      Avg Score
                    </th>

                    {/* <th className="px-6 py-5 text-center text-sm font-bold uppercase tracking-wider">
                    Attendance
                  </th> */}

                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider">
                      Status
                    </th>

                    <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredStudents.map(
                    (student: any, index: number) => (
                      <tr
                        key={student.id}
                        className={`
                        border-b border-orange-100
                        hover:bg-orange-50/50
                        transition-all
                        duration-300
                        ${index % 2 === 0
                            ? "bg-white"
                            : "bg-orange-50/20"
                          }
                      `}
                      >

                        {/* STUDENT */}

                        <td className="px-4 py-3">

                          <div className="flex items-center gap-4 min-w-0">

                            <div className="
                            flex-shrink-0
                            w-12
                            h-12
                            min-w-[48px]
                            rounded-2xl
                            bg-gradient-to-br
                            from-orange-500
                            to-amber-500
                            flex
                            items-center
                            justify-center
                            text-white
                            font-black
                            text-base
                            shadow-lg
                            text-center
                          ">
                              {(student.name || "S")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">

                              <h2 className="font-black text-slate-900 text-lg truncate max-w-[160px]">
                                {student.name || "Student"}
                              </h2>

                              {/* <p className="text-sm text-slate-500 mt-1">
                              Student ID: {student.id?.slice(0, 8)}
                            </p> */}
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}

                        <td className="px-4 py-3 max-w-[260px] overflow-hidden">

                          <div className="flex items-center gap-2 text-slate-600 min-w-0">

                            <Mail
                              size={16}
                              className="text-orange-500"
                            />

                            <span className="font-medium truncate block max-w-[200px]">
                              {student.email}
                            </span>
                          </div>
                        </td>

                        {/* SCORE */}

                        <td className="px-4 py-3 text-center">

                          <div className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-2xl shadow-lg min-w-0">

                            <span className="text-xl font-black">
                              {student.avgScore}%
                            </span>
                          </div>
                        </td>

                        {/* ATTENDANCE */}

                        {/* <td className="px-6 py-5">

                        <div className="min-w-[180px]">

                          <div className="flex justify-between mb-2 text-sm">

                            <span className="text-slate-500">
                              Attendance
                            </span>

                            <span className="font-bold text-slate-700">
                              {student.attendance}%
                            </span>
                          </div>

                          <div className="w-full h-3 bg-orange-100 rounded-full overflow-hidden">

                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${student.attendance}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td> */}

                        {/* STATUS */}

                        <td className="px-4 py-3 text-center">

                          <div
                            className={`
                            inline-flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-full
                            text-sm
                            font-bold
                            ${student.status === "Evaluated"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                              }
                          `}
                          >
                            {student.status === "Evaluated" ? (
                              <>
                                <CheckCircle2 size={16} />
                                Evaluated
                              </>
                            ) : (
                              <>
                                <Clock3 size={16} />
                                Pending
                              </>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-3">

                          <div className="flex items-center justify-center">

                            <button
                              onClick={() =>
                                handleDelete(student.id)
                              }
                              className="
                              flex
                              items-center
                              gap-2
                              bg-red-500
                              hover:bg-red-600
                              text-white
                              px-3
                              py-2
                              rounded-2xl
                              font-bold
                              shadow-md
                              transition-all
                              duration-200
                            "
                            >
                              <Trash2 size={17} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      {/* ====================================================== */}
      {/* TOAST NOTIFICATION */}
      {/* ====================================================== */}


      {toast.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          {/* BACKDROP */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

          {/* TOAST CARD */}
          <div className="relative bg-white border border-orange-200 shadow-2xl rounded-2xl px-6 py-5 w-[320px] text-center animate-fadeIn">

            {/* ICON */}
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${toast.type === "success"
                ? "bg-orange-100 text-orange-500"
                : "bg-red-100 text-red-500"
              }`}>
              {toast.type === "success" ? "✔" : "✖"}
            </div>

            {/* MESSAGE */}
            <p className="text-sm font-semibold text-slate-700">
              {toast.message}
            </p>

            {/* ACCENT BAR */}
            <div className="mt-3 h-1 w-full bg-orange-500 rounded-full"></div>
          </div>
        </div>
      )}

    </div>

  );

}