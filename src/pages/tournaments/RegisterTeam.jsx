import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function RegisterTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRegistrations, setExistingRegistrations] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    try {
      // Fetch tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();

      if (tournamentError) throw tournamentError;
      setTournament(tournamentData);

      // Fetch user's teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .eq("manager_id", user.id);

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Fetch existing registrations
      const { data: registrationsData, error: registrationsError } =
        await supabase
          .from("tournament_registrations")
          .select("team_id")
          .eq("tournament_id", id);

      if (registrationsError) throw registrationsError;
      setExistingRegistrations(registrationsData.map((r) => r.team_id));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load registration data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTeamId) {
      toast.error("Please select a team");
      return;
    }

    if (existingRegistrations.includes(selectedTeamId)) {
      toast.error("This team is already registered for this tournament");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("tournament_registrations").insert({
        tournament_id: id,
        team_id: selectedTeamId,
        registered_by: user.id,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Team registration submitted! Awaiting approval.");
      navigate(`/tournaments/${id}`);
    } catch (error) {
      console.error("Error registering team:", error);
      toast.error("Failed to register team: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const availableTeams = teams.filter(
    (team) =>
      !existingRegistrations.includes(team.id) &&
      (!tournament.age_divisions ||
        tournament.age_divisions.length === 0 ||
        tournament.age_divisions.includes(team.age_division))
  );

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/tournaments/${id}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tournament
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6" />
            Register Team for {tournament?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">No teams available</p>
              <p className="text-muted-foreground mb-4">
                You need to create a team before registering
              </p>
              <Button onClick={() => navigate("/teams/create")}>
                Create Team
              </Button>
            </div>
          ) : availableTeams.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium mb-2">All teams registered</p>
              <p className="text-muted-foreground">
                All your eligible teams are already registered for this
                tournament
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="team">Select Team *</Label>
                <Select
                  value={selectedTeamId}
                  onValueChange={setSelectedTeamId}
                  required
                >
                  <SelectTrigger id="team">
                    <SelectValue placeholder="Choose a team to register" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.age_division})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Only teams matching the tournament's age divisions are shown
                </p>
              </div>

              {tournament.entry_fee && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Entry Fee
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    ₹{tournament.entry_fee.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Payment details will be provided after approval
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  Important Information
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Your registration will be pending approval</li>
                  <li>Tournament director will review your application</li>
                  <li>You'll be notified once approved or rejected</li>
                  {tournament.registration_deadline && (
                    <li>
                      Registration deadline:{" "}
                      {new Date(
                        tournament.registration_deadline
                      ).toLocaleDateString()}
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/tournaments/${id}`)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !selectedTeamId}
                  className="flex-1"
                >
                  {submitting ? "Submitting..." : "Register Team"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
