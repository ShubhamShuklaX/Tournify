import React, { useState, useEffect } from "react";
import { getChildren } from "@/lib/childrenApi";
import {getCoaches } from "@/lib/coachApi";
import { saveAssessment } from "@/lib/assessmentApi";

export default function Assessments() {
  const [form, setForm] = useState({
    child_id: "",
    assessor_id: "",
    rules_knowledge: 0,
    fouls_contact: 0,
    fair_mindedness: 0,
    positive_attitude: 0,
    communication: 0,
    notes: "",
  });

  const [children, setChildren] = useState([]);
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    (async () => {
      const [childData, coachData] = await Promise.all([getChildren(), getCoaches()]);
      setChildren(childData);
      setCoaches(coachData);
    })();
  }, []);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleSave = async () => {
    const { success, error } = await saveAssessment(form);
    if (success) alert("✅ Assessment saved!");
    else alert(`❌ Error: ${error.message}`);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LSAS Assessments</h1>
        <p className="text-gray-500">Enter and review assessment scores.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          {/* ✅ Child Dropdown */}
          <div>
            <label className="text-sm text-gray-600">Child</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={form.child_id}
              onChange={(e) => handleChange("child_id", e.target.value)}
            >
              <option value="">Select child…</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Coach Dropdown */}
          <div>
            <label className="text-sm text-gray-600">Assessor (Coach)</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={form.assessor_id}
              onChange={(e) => handleChange("assessor_id", e.target.value)}
            >
              <option value="">Select coach…</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* LSAS Fields */}
          {[
            ["rules_knowledge", "Rules Knowledge & Use"],
            ["fouls_contact", "Fouls & Body Contact"],
            ["fair_mindedness", "Fair-Mindedness"],
            ["positive_attitude", "Positive Attitude & Self-Control"],
            ["communication", "Communication"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm text-gray-600">{label}</label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={form[key]}
                onChange={(e) => handleChange(key, parseInt(e.target.value))}
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Notes</label>
            <textarea
              className="w-full mt-1 p-2 border rounded"
              rows="3"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Optional comments…"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-5 px-4 py-2 rounded-md bg-indigo-600 text-white"
        >
          Save Assessment
        </button>
      </div>
    </div>
  );
}
