// src/pages/coaching/Sessions.jsx
import React from "react";

const fakeSessions = [
  { id: "s1", title: "Park Session 1", site: "Community Park", date: "Today 16:00–17:30", children: 22 },
  { id: "s2", title: "School Batch A", site: "Govt School", date: "Today 15:30–17:00", children: 18 },
  { id: "s3", title: "Community Batch B", site: "City Ground", date: "Tomorrow 07:30–09:00", children: 25 }
];

export default function Sessions() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-gray-500">View and manage upcoming sessions.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-lg">Upcoming</div>
          <button className="px-4 py-2 rounded-md bg-indigo-600 text-white">New Session</button>
        </div>

        <div className="grid gap-3">
          {fakeSessions.map(s => (
            <div key={s.id} className="p-4 border rounded-xl bg-white flex items-center justify-between">
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-gray-500">{s.site} • {s.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">{s.children} children</div>
                <a href={`/coaching/sessions/${s.id}/attendance`} className="px-3 py-2 rounded-md border hover:shadow-sm">
                  Start Attendance
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}