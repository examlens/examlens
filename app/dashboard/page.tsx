"use client";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-5">
        <h1 className="text-xl font-bold mb-6">ExamLens</h1>

        <ul className="space-y-3">
          <li className="bg-orange-600 p-2 rounded">My Dashboard</li>
          <li>Take Exam</li>
          <li>My Results</li>
          <li>Upload Answer</li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">

        <h1 className="text-2xl font-bold mb-6">
          My Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          <div className="bg-white p-4 rounded shadow">
            <p>My Score</p>
            <h2 className="text-2xl font-bold">87%</h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Attendance</p>
            <h2 className="text-2xl font-bold">92%</h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Exams Taken</p>
            <h2 className="text-2xl font-bold">2</h2>
          </div>

        </div>

        {/* Performance */}
        <div className="grid grid-cols-2 gap-6">

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-3">Performance</h2>

            <p>Knowledge</p>
            <div className="bg-gray-200 h-2 rounded mb-2">
              <div className="bg-green-500 h-2 w-[78%]" />
            </div>

            <p>Memory</p>
            <div className="bg-gray-200 h-2 rounded mb-2">
              <div className="bg-yellow-500 h-2 w-[74%]" />
            </div>

          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-3">Upcoming Exam</h2>

            <div className="bg-black text-white p-4 rounded">
              Final - Mathematics
            </div>

            <button className="mt-4 bg-orange-600 text-white px-4 py-2 rounded">
              Start Exam
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}