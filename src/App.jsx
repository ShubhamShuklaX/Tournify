// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/dashboard";

// Tournament Pages
import TournamentList from "./pages/tournaments/TournamentList";
import CreateTournament from "./pages/tournaments/CreateTournament";
import TournamentDetail from "./pages/tournaments/TournamentDetail";

// Team Pages
import TeamList from "./pages/teams/TeamList";
import CreateTeam from "./pages/teams/CreateTeam";
import TeamDetail from "./pages/teams/TeamDetail";

// Admin Pages
import UserApprovals from "@/pages/UserApprovals";
import SponsorManagement from "@/pages/SponsorManagement";
import AnnouncementsManagement from "@/pages/AnnouncementsManagement";
import MediaGallery from "@/pages/MediaGallery";

// Coaching Pages
import CoachDashboard from "./pages/coaching/CoachDashboard";
import Sessions from "./pages/coaching/Sessions";
import Assessments from "./pages/coaching/Assessments";
import Attendance from "./pages/coaching/Attendance";
import StudentDetail from "./pages/coaching/StudentDetail";
import StudentsPage from "./pages/coaching/students";
import AddStudent from "./pages/coaching/AddStudents";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check role access
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

// Main App Component
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes - Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Tournament Routes */}
          <Route
            path="/tournaments"
            element={
              <ProtectedRoute>
                <TournamentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments/:id"
            element={
              <ProtectedRoute>
                <TournamentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments/create"
            element={
              <ProtectedRoute allowedRoles={["tournament_director"]}>
                <CreateTournament />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments/:id/sponsors"
            element={
              <ProtectedRoute allowedRoles={["tournament_director"]}>
                <SponsorManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments/:id/announcements"
            element={
              <ProtectedRoute allowedRoles={["tournament_director"]}>
                <AnnouncementsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments/:id/media"
            element={
              <ProtectedRoute>
                <MediaGallery />
              </ProtectedRoute>
            }
          />

          {/* Team Routes */}
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <TeamList />
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
          <Route
            path="/teams/create"
            element={
              <ProtectedRoute allowedRoles={["team_manager"]}>
                <CreateTeam />
              </ProtectedRoute>
            }
          />

          {/* Coaching Routes */}
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
              </ProtectedRoute>
            }
          />
          <Route
            path="/coaching/student/:id"
            element={
              <ProtectedRoute>
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coaching/student/add"
            element={
              <ProtectedRoute>
                <AddStudent />
              </ProtectedRoute>
            }
          />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>

        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
