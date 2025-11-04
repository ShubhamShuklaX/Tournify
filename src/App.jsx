// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import TournamentList from "./pages/tournaments/TournamentList";
import TeamList from "./pages/teams/TeamList";
import CreateTeam from "./pages/teams/CreateTeam";
import TeamDetail from "./pages/teams/TeamDetail";

// 🆕 Coaching imports
import CoachDashboard from "./pages/coaching/CoachDashboard";
import Sessions from "./pages/coaching/Sessions";
import Assessments from "./pages/coaching/Assessments";
import Attendance from "./pages/coaching/Attendance";
import StudentDetail from "./pages/coaching/StudentDetail";
import StudentsPage from "./pages/coaching/students";
import AddStudent from "./pages/coaching/AddStudents";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Tournament & Team Routes (Existing) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments"
            element={
              <ProtectedRoute>
                <TournamentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <TeamList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/create"
            element={
              <ProtectedRoute>
                <CreateTeam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/:id"
            element={
              <ProtectedRoute>
                <TeamDetail />
              </ProtectedRoute>
            }
          />

          {/* 🆕 Coaching Routes */}
          <Route
            path="/coaching"
            element={
              <ProtectedRoute>
                <CoachDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coaching/sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coaching/assessments"
            element={
              <ProtectedRoute>
                <Assessments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coaching/sessions/:id/attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />
          

        <Route 
          path="/coaching/students" 
          element={
          <ProtectedRoute>
            <StudentsPage />
          </ProtectedRoute>} />
        
        <Route 
          path="/coaching/student/:id" 
          element={
          <ProtectedRoute>
            <StudentDetail />
          </ProtectedRoute>} />

          <Route 
          path="/coaching/student/add" 
          element={
          <ProtectedRoute>
            <StudentDetail />
          </ProtectedRoute>} />
      

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>

        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
