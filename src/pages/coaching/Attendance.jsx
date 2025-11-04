// src/pages/coaching/Attendance.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";

const fakeChildren = [
  { id: "c1", name: "Aarav" },
  { id: "c2", name: "Isha" },
  { id: "c3", name: "Rahul" },
  { id: "c4", name: "Meera" }
];

export default function Attendance() {
  const { id } = useParams();
  const [present, setPresent] = useState({});

  function toggle(childId) {
    setPresent(p => ({ ...p, [childId]: !p[childId] }));
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-gray-500">Session ID: {id}</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <ul className="divide-y">
          {fakeChildren.map(ch => (
            <li key={ch.id} className="py-3 flex items-center justify-between">
              <div className="font-medium">{ch.name}</div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-5 h-5" checked={!!present[ch.id]} onChange={() => toggle(ch.id)} />
                <span className="text-sm text-gray-600">{present[ch.id] ? "Present" : "Absent"}</span>
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex gap-3">
          <button className="px-4 py-2 rounded-md bg-indigo-600 text-white">Save</button>
          <button className="px-4 py-2 rounded-md border">Mark All Present</button>
        </div>
      </div>
    </div>
  );
}