// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";

// Tournament Pages
import TournamentList from "./pages/tournaments/TournamentList";
import CreateTournament from "./pages/tournaments/CreateTournament";
import TournamentDetail from "./pages/tournaments/TournamentDetail";
import RegisterTeam from "./pages/tournaments/RegisterTeam";
import ApproveTeams from "./pages/tournaments/ApproveTeams";
import ManageFields from "./pages/tournaments/ManageFields";

// Team Pages
import TeamList from "./pages/teams/TeamList";
import CreateTeam from "./pages/teams/CreateTeam";
import TeamDetail from "./pages/teams/TeamDetail";

// Match Pages
import MatchSchedule from "./pages/matches/MatchSchedule";
import CreateSchedule from "./pages/matches/CreateSchedule";
import LiveScoring from "./pages/matches/LiveScoring";

// Spirit Pages
import SpiritScoreForm from "./pages/spirit/SpiritScoreForm";
import SpiritLeaderboard from "./pages/spirit/SpiritLeaderboard";

// Leaderboard
import TournamentLeaderboard from "./pages/leaderboard/TournamentLeaderboard";

import UserApprovals from "@/pages/UserApprovals";
import SponsorManagement from "@/pages/SponsorManagement";
import AnnouncementsManagement from "@/pages/AnnouncementsManagement";
import MediaGallery from "@/pages/MediaGallery";
// 🆕 Coaching imports
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

  // Check if user needs approval (except players)
  if (profile?.role !== "player" && !profile?.is_approved) {
    return <Navigate to="/dashboard" />;
  }

  // Check role access
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

// Main App Routes
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes - All authenticated users */}
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

        {/* Tournament Director Only Routes */}
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

        {/* Admin Routes - Tournament Director Only */}
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute allowedRoles={["tournament_director"]}>
              <UserApprovals />
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

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
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
                <StudentDetail />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>

        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

// Alternative: If using a routes array approach
export const routesConfig = [
  // Public
  { path: "/login", element: Login, protected: false },
  { path: "/signup", element: Signup, protected: false },

  // Protected - All Users
  { path: "/dashboard", element: Dashboard, protected: true },
  { path: "/tournaments", element: TournamentList, protected: true },
  { path: "/tournaments/:id", element: TournamentDetail, protected: true },
  { path: "/tournaments/:id/media", element: MediaGallery, protected: true },
  { path: "/teams", element: TeamList, protected: true },
  { path: "/teams/:id", element: TeamDetail, protected: true },

  // Tournament Director Only
  {
    path: "/tournaments/create",
    element: CreateTournament,
    protected: true,
    roles: ["tournament_director"],
  },
  {
    path: "/tournaments/:id/sponsors",
    element: SponsorManagement,
    protected: true,
    roles: ["tournament_director"],
  },
  {
    path: "/tournaments/:id/announcements",
    element: AnnouncementsManagement,
    protected: true,
    roles: ["tournament_director"],
  },
  {
    path: "/admin/approvals",
    element: UserApprovals,
    protected: true,
    roles: ["tournament_director"],
  },

  // Team Manager Only
  {
    path: "/teams/create",
    element: CreateTeam,
    protected: true,
    roles: ["team_manager"],
  },
];

// Navigation Menu Items (for Sidebar/Header)
export const navigationItems = {
  all: [
    { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { label: "Tournaments", path: "/tournaments", icon: "Trophy" },
    { label: "Teams", path: "/teams", icon: "Users" },
  ],
  tournament_director: [
    { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { label: "Tournaments", path: "/tournaments", icon: "Trophy" },
    {
      label: "Create Tournament",
      path: "/tournaments/create",
      icon: "Plus",
    },
    { label: "User Approvals", path: "/admin/approvals", icon: "UserCheck" },
    { label: "Teams", path: "/teams", icon: "Users" },
  ],
  team_manager: [
    { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { label: "Tournaments", path: "/tournaments", icon: "Trophy" },
    { label: "My Teams", path: "/teams", icon: "Users" },
    { label: "Create Team", path: "/teams/create", icon: "Plus" },
  ],
  player: [
    { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { label: "Tournaments", path: "/tournaments", icon: "Trophy" },
    { label: "Teams", path: "/teams", icon: "Users" },
  ],
};

// Helper function to get navigation items by role
export function getNavigationByRole(role) {
  return navigationItems[role] || navigationItems.all;
}

// Breadcrumb helper
export function getBreadcrumbs(pathname, tournament, team) {
  const crumbs = [{ label: "Home", path: "/" }];

  if (pathname.includes("/tournaments")) {
    crumbs.push({ label: "Tournaments", path: "/tournaments" });

    if (tournament) {
      crumbs.push({
        label: tournament.name,
        path: `/tournaments/${tournament.id}`,
      });

      if (pathname.includes("/sponsors")) {
        crumbs.push({ label: "Sponsors", path: "" });
      } else if (pathname.includes("/announcements")) {
        crumbs.push({ label: "Announcements", path: "" });
      } else if (pathname.includes("/media")) {
        crumbs.push({ label: "Media Gallery", path: "" });
      }
    }
  } else if (pathname.includes("/teams")) {
    crumbs.push({ label: "Teams", path: "/teams" });

    if (team) {
      crumbs.push({ label: team.name, path: `/teams/${team.id}` });
    }
  } else if (pathname.includes("/admin/approvals")) {
    crumbs.push({ label: "Admin", path: "" });
    crumbs.push({ label: "User Approvals", path: "" });
  }

  return crumbs;
}
