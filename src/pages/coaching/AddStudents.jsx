import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // make sure you have this

export default function AddStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    gender: "",
    date_of_birth: "",
    community: "",
    school: "",
    sports: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.from("children").insert([form]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Student added successfully!");
      navigate("/coaching/students");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        &larr; Back
      </button>

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Add New Student</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full p-2 border rounded"
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            name="community"
            value={form.community}
            onChange={handleChange}
            placeholder="Community"
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            name="school"
            value={form.school}
            onChange={handleChange}
            placeholder="School"
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            name="sports"
            value={form.sports}
            onChange={handleChange}
            placeholder="Sports (comma separated)"
            className="w-full p-2 border rounded"
          />

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Student
          </button>
        </form>
      </div>
    </div>
  );
}
