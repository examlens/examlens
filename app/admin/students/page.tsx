"use client";

import { useEffect, useState } from "react";

export default function StudentsPage() {
  const [students, setStudents] =
    useState<any[]>([]);

  const fetchStudents = async () => {
    try {
      const res = await fetch(
        "/api/admin/students"
      );

      const data = await res.json();

      setStudents(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (
    id: string
  ) => {
    const confirmDelete = confirm(
      "Remove this student?"
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
          body: JSON.stringify({ id }),
        }
      );

      if (res.ok) {
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      {/* TOP */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border mb-8 flex justify-between items-center">
        <input
          placeholder="🔍 Search students..."
          className="border px-4 py-3 rounded-xl w-80 outline-none"
        />

        <select className="border px-4 py-3 rounded-xl">
          <option>All Status</option>
        </select>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-3xl p-6 border shadow-sm hover:shadow-xl transition"
          >
            {/* AVATAR */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-3xl font-bold flex items-center justify-center mx-auto">
              {student.name?.charAt(0)}
            </div>

            {/* NAME */}
            <h2 className="text-center mt-5 text-xl font-bold">
              {student.name}
            </h2>

            <p className="text-center text-gray-500">
              {student.email}
            </p>

            <div className="border-t my-5" />

            {/* ATTENDANCE */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-orange-600">
                {student.attendance || 0}%
              </h1>

              <div className="mt-3 inline-flex px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm">
                ✓ Active Student
              </div>

              <p className="text-gray-500 mt-3">
                Attendance:{" "}
                {student.attendance || 0}%
              </p>
            </div>

            {/* DELETE */}
            <button
              onClick={() =>
                handleDelete(student.id)
              }
              className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold"
            >
              Remove Student
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}