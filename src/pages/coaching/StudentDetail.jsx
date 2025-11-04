// src/pages/coaching/StudentDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!id) return;

    // Fake data
    const fakeStudents = Array.from({ length: 53 }).map((_, i) => ({
      id: i + 1,
      full_name: `Student ${i + 1}`,
      email: `student${i + 1}@example.com`,
      phone: `+91 90000${1000 + i}`,
      enrollment_date: `2025-01-${(i % 28) + 1}`,
      additional_data: {
        program: `Program ${((i % 5) + 1)}`,
        batch: `Batch ${((i % 3) + 1)}`,
        guardian: `Guardian ${i + 1}`,
        city: `City ${((i % 10) + 1)}`,
      },
    }));

    const found = fakeStudents.find((s) => s.id === parseInt(id));
    setStudent(found);
    setFormData(found); // Initialize form data
  }, [id]);

  if (!student)
    return (
      <div className="p-6 text-gray-500 text-center">Loading student details...</div>
    );

  // Handle form input changes
  const handleChange = (e, section) => {
    const { name, value } = e.target;
    if (section === "additional") {
      setFormData({
        ...formData,
        additional_data: {
          ...formData.additional_data,
          [name]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Save changes
  const handleSave = () => {
    setStudent(formData);
    setEditing(false);
    alert("Student data updated!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back Button */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          &larr; Back
        </button>
        <h1 className="text-xl font-semibold text-gray-700">
          Student Details: {student.full_name}
        </h1>
      </div>

      {/* Main Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {/* Header with Avatar */}
        <div className="flex items-center gap-5 justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 shadow-md">
              {student.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.full_name}</h2>
              <p className="text-gray-500 text-sm mt-1">
                Enrolled on: <span className="font-medium text-gray-700">{student.enrollment_date}</span>
              </p>
            </div>
          </div>

          {/* Edit / Save Button */}
          <div>
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border hover:shadow-md transition">
            <h3 className="text-gray-600 font-semibold mb-1">Email</h3>
            {editing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              />
            ) : (
              <p className="text-gray-900">{student.email}</p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border hover:shadow-md transition">
            <h3 className="text-gray-600 font-semibold mb-1">Phone</h3>
            {editing ? (
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              />
            ) : (
              <p className="text-gray-900">{student.phone}</p>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <h3 className="text-gray-700 font-semibold mb-3 text-lg">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(student.additional_data).map(([key, value], index) => (
              <div
                key={key}
                className={`p-4 rounded-xl border ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:shadow-md transition`}
              >
                <p className="text-gray-500 text-sm capitalize">{key}</p>
                {editing ? (
                  <input
                    type="text"
                    name={key}
                    value={formData.additional_data[key]}
                    onChange={(e) => handleChange(e, "additional")}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 mt-1"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
