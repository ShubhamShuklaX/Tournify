import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  Users,
  Trophy,
  GraduationCap,
  Home,
  FileText,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState([]);
  const [quickActions, setQuickActions] = useState([]);

  useEffect(() => {
    if (profile?.role) {
      loadRoleBasedContent();
    }
  }, [profile]);

  const loadRoleBasedContent = () => {
    const role = profile.role;
    let statsData = [];
    let actionsData = [];

    // === COACHING MODULE ROLES ===

    if (role === "programme_director") {
      statsData = [
        {
          title: "Total Programmes",
          value: "0",
          description: "Active programmes",
          icon: GraduationCap,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          title: "Programme Managers",
          value: "0",
          description: "Managing programmes",
          icon: Users,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Total Children",
          value: "0",
          description: "Across all programmes",
          icon: Users,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          title: "Active Schools",
          value: "0",
          description: "Participating schools",
          icon: Home,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
      ];
      actionsData = [
        {
          label: "Assign Programme Manager",
          icon: Users,
          link: "/coaching/assign-manager",
        },
        {
          label: "View All Programmes",
          icon: GraduationCap,
          link: "/coaching/programmes",
        },
        {
          label: "Generate Reports",
          icon: FileText,
          link: "/coaching/reports",
        },
      ];
    }

    if (role === "programme_manager") {
      statsData = [
        {
          title: "My Programmes",
          value: "0",
          description: "Assigned to me",
          icon: GraduationCap,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Total Children",
          value: "0",
          description: "In my programmes",
          icon: Users,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          title: "Active Sessions",
          value: "0",
          description: "This week",
          icon: CalendarDays,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          title: "Coaches",
          value: "0",
          description: "Under my management",
          icon: Users,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
      ];
      actionsData = [
        { label: "Manage Children", icon: Users, link: "/coaching/children" },
        {
          label: "View Sessions",
          icon: CalendarDays,
          link: "/coaching/sessions",
        },
        { label: "Coach Workload", icon: Users, link: "/coaching/coaches" },
      ];
    }

    if (role === "coach") {
      statsData = [
        {
          title: "My Children",
          value: "0",
          description: "Assigned to me",
          icon: Users,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          title: "Today's Sessions",
          value: "0",
          description: "Scheduled",
          icon: CalendarDays,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          title: "Attendance Rate",
          value: "0%",
          description: "This month",
          icon: CheckCircle,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Pending Visits",
          value: "0",
          description: "Home visits due",
          icon: Home,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
      ];
      actionsData = [
        {
          label: "Mark Attendance",
          icon: CheckCircle,
          link: "/coaching/attendance",
        },
        { label: "My Children", icon: Users, link: "/coaching/my-children" },
        {
          label: "Record Home Visit",
          icon: Home,
          link: "/coaching/home-visits/create",
        },
      ];
    }

    if (role === "data_team") {
      statsData = [
        {
          title: "Pending Validations",
          value: "0",
          description: "Awaiting review",
          icon: CheckCircle,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
        {
          title: "Reports Generated",
          value: "0",
          description: "This month",
          icon: FileText,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Data Quality",
          value: "0%",
          description: "Completion rate",
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
      ];
      actionsData = [
        {
          label: "Validate Data",
          icon: CheckCircle,
          link: "/coaching/data-validation",
        },
        {
          label: "Generate Reports",
          icon: FileText,
          link: "/coaching/reports",
        },
        {
          label: "Analyze Trends",
          icon: FileText,
          link: "/coaching/analytics",
        },
      ];
    }

    if (role === "site_coordinator") {
      statsData = [
        {
          title: "My Site Children",
          value: "0",
          description: "At my location",
          icon: Users,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          title: "Site Attendance",
          value: "0%",
          description: "This week",
          icon: CalendarDays,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          title: "Active Coaches",
          value: "0",
          description: "At my site",
          icon: Users,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
      ];
      actionsData = [
        {
          label: "Site Attendance",
          icon: CalendarDays,
          link: "/coaching/site-attendance",
        },
        { label: "Support Coaches", icon: Users, link: "/coaching/coaches" },
        {
          label: "Site Progress",
          icon: CheckCircle,
          link: "/coaching/site-progress",
        },
      ];
    }

    // === TOURNAMENT MODULE ROLES ===

    if (role === "tournament_director") {
      statsData = [
        {
          title: "Active Tournaments",
          value: "0",
          description: "Currently running",
          icon: Trophy,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          title: "Registered Teams",
          value: "0",
          description: "This season",
          icon: Users,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Pending Approvals",
          value: "0",
          description: "Awaiting review",
          icon: CalendarDays,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
        {
          title: "Upcoming Matches",
          value: "0",
          description: "Next 7 days",
          icon: Trophy,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
      ];
      actionsData = [
        {
          label: "Create Tournament",
          icon: Trophy,
          link: "/tournaments/create",
        },
        { label: "View Tournaments", icon: Trophy, link: "/tournaments" },
        { label: "Approve Teams", icon: Users, link: "/tournaments/approvals" },
      ];
    }

    if (role === "team_manager") {
      statsData = [
        {
          title: "My Teams",
          value: "0",
          description: "Registered",
          icon: Users,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Upcoming Matches",
          value: "0",
          description: "Next 7 days",
          icon: CalendarDays,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          title: "Spirit Score Avg",
          value: "0",
          description: "Current tournament",
          icon: Trophy,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
      ];
      actionsData = [
        {
          label: "Manage Teams",
          icon: Users,
          link: "/teams",
        },
        { label: "View Tournaments", icon: Trophy, link: "/tournaments" },
        {
          label: "Submit Spirit Score",
          icon: Trophy,
          link: "/tournaments/spirit-score",
        },
      ];
    }

    if (role === "player") {
      statsData = [
        {
          title: "My Matches",
          value: "0",
          description: "This tournament",
          icon: Trophy,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          title: "Team Ranking",
          value: "-",
          description: "Current standing",
          icon: Trophy,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
      ];
      actionsData = [
        { label: "My Schedule", icon: CalendarDays, link: "/player/schedule" },
        {
          label: "Leaderboard",
          icon: Trophy,
          link: "/tournaments/leaderboard",
        },
      ];
    }

    if (role === "volunteer") {
      statsData = [
        {
          title: "My Field",
          value: "-",
          description: "Assigned field",
          icon: Trophy,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          title: "Today's Matches",
          value: "0",
          description: "On my field",
          icon: CalendarDays,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
      ];
      actionsData = [
        { label: "Enter Scores", icon: Trophy, link: "/scoring/live" },
        {
          label: "My Schedule",
          icon: CalendarDays,
          link: "/volunteer/schedule",
        },
      ];
    }

    if (role === "scoring_team") {
      statsData = [
        {
          title: "Pending Validations",
          value: "0",
          description: "Scores to verify",
          icon: CheckCircle,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
        {
          title: "Validated Today",
          value: "0",
          description: "Scores approved",
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
      ];
      actionsData = [
        {
          label: "Validate Scores",
          icon: CheckCircle,
          link: "/scoring/validate",
        },
        {
          label: "View All Matches",
          icon: CalendarDays,
          link: "/tournaments/matches",
        },
      ];
    }

    if (role === "sponsor") {
      statsData = [
        {
          title: "Tournament Reach",
          value: "0",
          description: "Total participants",
          icon: Users,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Brand Visibility",
          value: "0",
          description: "Page views",
          icon: Trophy,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
      ];
      actionsData = [
        { label: "View Dashboard", icon: Trophy, link: "/sponsor/dashboard" },
        { label: "Analytics", icon: FileText, link: "/sponsor/analytics" },
      ];
    }

    if (role === "spectator") {
      statsData = [
        {
          title: "Live Tournaments",
          value: "0",
          description: "Currently ongoing",
          icon: Trophy,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          title: "Matches Today",
          value: "0",
          description: "Across all fields",
          icon: CalendarDays,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
      ];
      actionsData = [
        { label: "Live Scores", icon: Trophy, link: "/public/live-scores" },
        {
          label: "View Tournaments",
          icon: Trophy,
          link: "/public/tournaments",
        },
      ];
    }

    setStats(statsData);
    setQuickActions(actionsData);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const welcomeMessages = {
    programme_director: "You have full access to all coaching programmes.",
    programme_manager: "Manage your assigned programmes and track progress.",
    coach: "Track your sessions and children's progress.",
    data_team: "Validate data and generate insightful reports.",
    site_coordinator: "Monitor your site and support coaches.",
    tournament_director: "Full control over all tournament operations.",
    team_manager: "Manage your team and register for tournaments.",
    player: "View your schedule and team performance.",
    volunteer: "Enter match scores for your assigned field.",
    scoring_team: "Validate and ensure accurate tournament data.",
    sponsor: "Track your brand visibility and engagement.",
    spectator: "Follow live tournaments and match results.",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name?.split(" ")[0] || "User"}! 👋
          </h2>
          <p className="text-gray-600">
            {welcomeMessages[profile.role] || "Welcome to Y-Ultimate Platform"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for your role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} to={action.link}>
                      <Button
                        variant="outline"
                        className="w-full h-auto py-6 flex flex-col items-center justify-center space-y-2"
                      >
                        <Icon className="w-8 h-8 text-purple-600" />
                        <span className="font-medium">{action.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending User Approvals (for Tournament Director) */}
        {profile?.role === "tournament_director" && (
          <Card className="border-yellow-500 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Clock className="h-5 w-5" />
                Pending User Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.pendingUserApprovals > 0 ? (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-gray-600">
                    There are{" "}
                    <span className="font-semibold text-yellow-600">
                      {stats.pendingUserApprovals}
                    </span>{" "}
                    users awaiting approval.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Link to="/admin/approvals">
                      <CheckCircle className="h-4 w-4" />
                      Review Pending Approvals
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>All users are approved. No pending requests.</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {["programme_director", "programme_manager", "coach"].includes(
            profile.role
          ) && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Latest coaching activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No sessions yet</p>
                  <p className="text-sm mt-2">
                    Start tracking your coaching sessions
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {["tournament_director", "team_manager", "volunteer"].includes(
            profile.role
          ) && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Tournaments</CardTitle>
                <CardDescription>Latest tournament activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No tournaments yet</p>
                  <p className="text-sm mt-2">
                    Create or join a tournament to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
