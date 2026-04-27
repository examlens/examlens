"use client";

export default function StudentDashboard() {
  return (
    <div>
      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>

      {/* TOP CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">My Score</p>
          <h2 className="text-2xl font-bold">87%</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Attendance</p>
          <h2 className="text-2xl font-bold">92%</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Exams Taken</p>
          <h2 className="text-2xl font-bold">2</h2>
        </div>
      </div>

      {/* LOWER SECTION */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* PERFORMANCE */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Performance</h2>

          <div className="mb-4">
            <p className="text-sm mb-1">Knowledge</p>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div className="bg-green-500 h-2 rounded w-[78%]"></div>
            </div>
          </div>

          <div>
            <p className="text-sm mb-1">Memory</p>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div className="bg-yellow-500 h-2 rounded w-[74%]"></div>
            </div>
          </div>
        </div>

        {/* UPCOMING EXAM */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Upcoming Exam</h2>

          <div className="bg-black text-white p-4 rounded-lg mb-4">
            Final - Mathematics
          </div>

          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg">
            Start Exam
          </button>
        </div>

      </div>
    </div>
  );
}