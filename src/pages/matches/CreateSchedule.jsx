import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  generateRoundRobinSchedule,
  generateEliminationBracket,
  distributeMatchesAcrossTime,
} from "@/lib/matchHelpers";

export default function CreateSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    bracket_type: "round_robin",
    start_date: "",
    start_time: "09:00",
    match_duration: 90,
    break_duration: 10,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();

      if (tournamentError) throw tournamentError;
      setTournament(tournamentData);

      // Set default start date to tournament start date
      setScheduleData((prev) => ({
        ...prev,
        start_date: tournamentData.start_date?.split("T")[0] || "",
      }));

      const { data: registrationsData, error: registrationsError } =
        await supabase
          .from("tournament_registrations")
          .select(
            `
          team_id,
          team:teams(*)
        `
          )
          .eq("tournament_id", id)
          .eq("status", "approved");

      if (registrationsError) throw registrationsError;
      setTeams(registrationsData.map((r) => r.team));

      const { data: fieldsData, error: fieldsError } = await supabase
        .from("tournament_fields")
        .select("*")
        .eq("tournament_id", id)
        .order("field_number", { ascending: true });

      if (fieldsError) throw fieldsError;
      setFields(fieldsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load tournament data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    if (teams.length < 2) {
      toast.error("At least 2 approved teams are required");
      return;
    }

    if (fields.length === 0) {
      toast.error("At least 1 field is required. Please add fields first.");
      return;
    }

    if (!scheduleData.start_date || !scheduleData.start_time) {
      toast.error("Please select start date and time");
      return;
    }

    setGenerating(true);

    try {
      let matches = [];

      // Generate matches based on bracket type
      if (scheduleData.bracket_type === "round_robin") {
        matches = generateRoundRobinSchedule(teams, fields.length);
      } else if (scheduleData.bracket_type === "elimination") {
        matches = generateEliminationBracket(teams);
      } else {
        toast.error("This bracket type is not yet implemented");
        setGenerating(false);
        return;
      }

      // Combine date and time
      const startDateTime = new Date(
        `${scheduleData.start_date}T${scheduleData.start_time}`
      );

      // Distribute matches across time slots
      matches = distributeMatchesAcrossTime(
        matches,
        startDateTime,
        parseInt(scheduleData.match_duration),
        parseInt(scheduleData.break_duration)
      );

      // Assign field IDs
      matches = matches.map((match, index) => {
        const fieldIndex = index % fields.length;
        return {
          ...match,
          tournament_id: id,
          field_id: fields[fieldIndex].id,
          status: match.status || "scheduled",
        };
      });

      // Insert matches
      const { error } = await supabase.from("matches").insert(matches);

      if (error) throw error;

      toast.success(`Schedule created with ${matches.length} matches!`);
      navigate(`/tournaments/${id}/schedule`);
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error("Failed to create schedule: " + error.message);
    } finally {
      setGenerating(false);
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

  const estimatedMatches =
    scheduleData.bracket_type === "round_robin"
      ? (teams.length * (teams.length - 1)) / 2
      : teams.length - 1;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
            <Calendar className="h-6 w-6" />
            Create Match Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tournament Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{tournament?.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Approved Teams:</span>{" "}
                <span className="font-medium">{teams.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Available Fields:</span>{" "}
                <span className="font-medium">{fields.length}</span>
              </div>
            </div>
          </div>

          {teams.length < 2 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Not enough teams</p>
                <p className="text-sm text-red-700">
                  You need at least 2 approved teams to create a schedule.
                </p>
              </div>
            </div>
          )}

          {fields.length === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">No fields configured</p>
                <p className="text-sm text-red-700">
                  Please add at least one field before creating a schedule.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate(`/tournaments/${id}/fields`)}
                >
                  Manage Fields
                </Button>
              </div>
            </div>
          )}

          {/* Schedule Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold">Schedule Configuration</h3>

            <div>
              <Label htmlFor="bracket_type">Tournament Format *</Label>
              <Select
                value={scheduleData.bracket_type}
                onValueChange={(value) =>
                  setScheduleData((prev) => ({ ...prev, bracket_type: value }))
                }
              >
                <SelectTrigger id="bracket_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="elimination">
                    Single Elimination
                  </SelectItem>
                  <SelectItem value="pool_play" disabled>
                    Pool Play (Coming Soon)
                  </SelectItem>
                  <SelectItem value="swiss" disabled>
                    Swiss System (Coming Soon)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {scheduleData.bracket_type === "round_robin" &&
                  "Every team plays every other team once"}
                {scheduleData.bracket_type === "elimination" &&
                  "Single elimination bracket tournament"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={scheduleData.start_date}
                  onChange={(e) =>
                    setScheduleData((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={scheduleData.start_time}
                  onChange={(e) =>
                    setScheduleData((prev) => ({
                      ...prev,
                      start_time: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="match_duration">Match Duration (minutes)</Label>
                <Input
                  id="match_duration"
                  type="number"
                  min="30"
                  max="180"
                  value={scheduleData.match_duration}
                  onChange={(e) =>
                    setScheduleData((prev) => ({
                      ...prev,
                      match_duration: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="break_duration">
                  Break Between Matches (minutes)
                </Label>
                <Input
                  id="break_duration"
                  type="number"
                  min="0"
                  max="60"
                  value={scheduleData.break_duration}
                  onChange={(e) =>
                    setScheduleData((prev) => ({
                      ...prev,
                      break_duration: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Estimated Info */}
          {teams.length >= 2 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">
                Schedule Preview
              </h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>
                  • Estimated matches: <strong>{estimatedMatches}</strong>
                </p>
                <p>
                  • Using <strong>{fields.length}</strong> field(s)
                </p>
                <p>
                  • Match duration:{" "}
                  <strong>{scheduleData.match_duration}</strong> minutes
                </p>
                <p>
                  • Total time: approximately{" "}
                  <strong>
                    {Math.ceil(
                      (estimatedMatches *
                        (parseInt(scheduleData.match_duration) +
                          parseInt(scheduleData.break_duration))) /
                        fields.length /
                        60
                    )}{" "}
                    hours
                  </strong>
                </p>
              </div>
            </div>
          )}

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
              onClick={handleGenerateSchedule}
              disabled={generating || teams.length < 2 || fields.length === 0}
              className="flex-1"
            >
              {generating ? "Generating..." : "Generate Schedule"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
