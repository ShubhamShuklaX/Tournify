// src/pages/coaching/Students.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch students from Supabase
  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      let query = supabase
        .from("children")
        .select("*", { count: "exact" })
        .order("id", { ascending: true })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      if (search.trim() !== "") {
        query = query.ilike("full_name", `%${search}%`); // search by name
      }

      const { data, count, error } = await query;

      if (error) {
        console.error(error);
        setStudents([]);
        setTotalPages(1);
      } else {
        setStudents(data);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      setLoading(false);
    }

    fetchStudents();
  }, [page, search]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Students</h1>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset to page 1 when searching
          }}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
      onClick={() => navigate("/coaching/students/add")}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Add Student
    </button>

      {/* Students Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Name</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Email</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Phone</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Program</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Batch</th>
              <th className="text-center px-4 py-2 text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Loading students...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((s, index) => (
                <tr
                  key={s.id}
                  className={`transition hover:shadow-lg ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <td className="px-4 py-3 text-sm">{s.full_name}</td>
                  <td className="px-4 py-3 text-sm">{s.email}</td>
                  <td className="px-4 py-3 text-sm">{s.phone}</td>
                  <td className="px-4 py-3 text-sm">{s.program}</td>
                  <td className="px-4 py-3 text-sm">{s.batch}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/coaching/student/${s.id}`)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className={`px-3 py-1 rounded border ${
            page === 1 ? "bg-gray-200 cursor-not-allowed" : "bg-white hover:bg-gray-100"
          }`}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded border ${
              page === i + 1 ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className={`px-3 py-1 rounded border ${
            page === totalPages ? "bg-gray-200 cursor-not-allowed" : "bg-white hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
