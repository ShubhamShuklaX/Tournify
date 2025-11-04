import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Settings,
  List,
  Target,
  Award,
  Image,
  Bell,
  HandHeart,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStatusColor,
  getStatusLabel,
  formatDateRange,
  isRegistrationOpen,
  canRegisterForTournament,
} from "@/lib/tournamentHelpers";

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userTeams, setUserTeams] = useState([]);

  useEffect(() => {
    fetchTournamentData();
    if (profile?.role === "team_manager" && profile?.is_approved) {
      fetchUserTeams();
    }
  }, [id, profile]);

  const fetchTournamentData = async () => {
    try {
      // Fetch tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select(
          `
          *,
          creator:profiles!tournaments_created_by_fkey(name, email)
        `
        )
        .eq("id", id)
        .single();

      if (tournamentError) throw tournamentError;
      setTournament(tournamentData);

      // Fetch registrations with team details
      const { data: registrationsData, error: registrationsError } =
        await supabase
          .from("tournament_registrations")
          .select(
            `
          *,
          team:teams(
            *,
            manager:profiles!teams_manager_id_fkey(name, email, phone)
          )
        `
          )
          .eq("tournament_id", id)
          .order("registered_at", { ascending: false });

      if (registrationsError) throw registrationsError;
      setRegistrations(registrationsData || []);

      // Fetch sponsors
      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from("sponsors")
        .select("*")
        .eq("tournament_id", id)
        .order("display_order", { ascending: true });

      if (!sponsorsError) {
        setSponsors(sponsorsData || []);
      }

      // Fetch recent announcements
      const { data: announcementsData, error: announcementsError } =
        await supabase
          .from("announcements")
          .select(
            `
          *,
          creator:profiles!announcements_created_by_fkey(name)
        `
          )
          .eq("tournament_id", id)
          .order("created_at", { ascending: false })
          .limit(5);

      if (!announcementsError) {
        setAnnouncements(announcementsData || []);
      }
    } catch (error) {
      console.error("Error fetching tournament:", error);
      toast.error("Failed to load tournament details");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("manager_id", user.id)
        .eq("is_active", true);

      if (error) throw error;
      setUserTeams(data || []);
    } catch (error) {
      console.error("Error fetching user teams:", error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success(
        `Tournament status updated to ${getStatusLabel(newStatus)}`
      );
      fetchTournamentData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update tournament status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-xl">Tournament not found</p>
            <Button onClick={() => navigate("/tournaments")} className="mt-4">
              Back to Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDirector =
    profile?.role === "tournament_director" &&
    profile?.is_approved &&
    tournament.created_by === user?.id;

  const canRegister =
    profile?.role === "team_manager" &&
    profile?.is_approved &&
    canRegisterForTournament(tournament);

  const approvedTeams = registrations.filter((r) => r.status === "approved");
  const pendingCount = registrations.filter(
    (r) => r.status === "pending"
  ).length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/tournaments")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tournaments
      </Button>

      {/* Tournament Header with Banner */}
      <Card className="mb-6 overflow-hidden">
        {tournament.banner_url && (
          <div className="w-full h-48 bg-gradient-to-r from-primary to-primary/60">
            <img
              src={tournament.banner_url}
              alt={tournament.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                <Trophy className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h1 className="text-3xl font-bold">{tournament.name}</h1>
                  <p className="text-muted-foreground mt-1">
                    {tournament.description || "No description provided"}
                  </p>
                  {tournament.creator && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Organized by:{" "}
                      <span className="font-medium">
                        {tournament.creator.name}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Badge
              className={`${getStatusColor(
                tournament.status
              )} text-white text-sm px-3 py-1`}
            >
              {getStatusLabel(tournament.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Dates</p>
                <p className="font-medium">
                  {formatDateRange(tournament.start_date, tournament.end_date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{tournament.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Teams</p>
                <p className="font-medium">
                  {approvedTeams.length}
                  {tournament.max_teams && ` / ${tournament.max_teams}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Format</p>
                <p className="font-medium capitalize">
                  {tournament.format?.replace("_", " ") || "Round Robin"}
                </p>
              </div>
            </div>
          </div>

          {tournament.age_divisions && tournament.age_divisions.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Age Divisions
              </p>
              <div className="flex flex-wrap gap-2">
                {tournament.age_divisions.map((division) => (
                  <Badge key={division} variant="outline">
                    {division}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {tournament.rules && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Rules</p>
              <p className="text-sm">{tournament.rules}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sponsors Section */}
      {sponsors.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandHeart className="h-5 w-5" />
              Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="flex flex-col items-center p-3 border rounded-lg hover:shadow-md transition-shadow"
                >
                  {sponsor.logo_url ? (
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="h-16 w-16 object-contain mb-2"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {sponsor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <p className="text-xs font-medium text-center">
                    {sponsor.name}
                  </p>
                  {sponsor.tier && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {sponsor.tier}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Latest Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-3 border-l-4 rounded ${
                    announcement.type === "emergency"
                      ? "border-red-500 bg-red-50"
                      : announcement.type === "celebration"
                      ? "border-green-500 bg-green-50"
                      : "border-primary bg-primary/5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {announcement.message}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(announcement.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {!profile?.is_approved && profile?.role !== "player" && (
          <Card className="w-full mb-6 border-yellow-500">
            <CardContent className="py-4">
              <p className="text-yellow-700">
                ⚠️ Your account is pending approval. You'll be able to access
                all features once approved by a tournament director.
              </p>
            </CardContent>
          </Card>
        )}

        {canRegister && userTeams.length > 0 && (
          <Button asChild>
            <Link to={`/tournaments/${id}/register`}>
              <Users className="mr-2 h-4 w-4" />
              Register Team
            </Link>
          </Button>
        )}

        {canRegister && userTeams.length === 0 && (
          <Button asChild variant="outline">
            <Link to="/teams/create">
              <Users className="mr-2 h-4 w-4" />
              Create Team to Register
            </Link>
          </Button>
        )}

        {isDirector && (
          <>
            <Button asChild variant="outline">
              <Link to={`/tournaments/${id}/approve`}>
                <Users className="mr-2 h-4 w-4" />
                Approve Teams {pendingCount > 0 && `(${pendingCount})`}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/tournaments/${id}/fields`}>
                <Settings className="mr-2 h-4 w-4" />
                Manage Fields
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/tournaments/${id}/schedule/create`}>
                <List className="mr-2 h-4 w-4" />
                Create Schedule
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/tournaments/${id}/sponsors`}>
                <HandHeart className="mr-2 h-4 w-4" />
                Manage Sponsors
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/tournaments/${id}/announcements`}>
                <Bell className="mr-2 h-4 w-4" />
                Announcements
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/tournaments/${id}/media`}>
                <Image className="mr-2 h-4 w-4" />
                Media Gallery
              </Link>
            </Button>
          </>
        )}

        <Button asChild variant="outline">
          <Link to={`/tournaments/${id}/schedule`}>
            <List className="mr-2 h-4 w-4" />
            View Schedule
          </Link>
        </Button>

        <Button asChild variant="outline">
          <Link to={`/tournaments/${id}/leaderboard`}>
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </Link>
        </Button>

        <Button asChild variant="outline">
          <Link to={`/tournaments/${id}/spirit-leaderboard`}>
            <Award className="mr-2 h-4 w-4" />
            Spirit Scores
          </Link>
        </Button>
      </div>

      {/* Status Management for Directors */}
      {isDirector && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tournament Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "draft",
                "registration_open",
                "registration_closed",
                "in_progress",
                "completed",
              ].map((status) => (
                <Button
                  key={status}
                  variant={tournament.status === status ? "default" : "outline"}
                  onClick={() => handleStatusChange(status)}
                  disabled={tournament.status === status}
                >
                  {getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registered Teams */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Teams ({registrations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No teams registered yet</p>
              {canRegister && (
                <Button asChild className="mt-4">
                  <Link to={`/tournaments/${id}/register`}>
                    Be the First to Register
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {registration.team?.logo_url && (
                        <img
                          src={registration.team.logo_url}
                          alt={registration.team.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{registration.team?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {registration.team?.age_division}
                          {registration.team?.city &&
                            ` • ${registration.team.city}`}
                        </p>
                        {registration.team?.manager && (
                          <p className="text-xs text-muted-foreground">
                            Manager: {registration.team.manager.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        registration.status === "approved"
                          ? "default"
                          : "outline"
                      }
                      className={
                        registration.status === "approved"
                          ? "bg-green-500 hover:bg-green-600"
                          : registration.status === "rejected"
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : ""
                      }
                    >
                      {registration.status}
                    </Badge>
                    {registration.status === "approved" &&
                      registration.approved_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            registration.approved_at
                          ).toLocaleDateString()}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
