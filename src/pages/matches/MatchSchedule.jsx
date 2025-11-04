import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  getMatchStatusColor,
  getMatchStatusLabel,
  formatMatchTime,
  formatMatchDate,
  BRACKET_TYPES,
} from "@/lib/matchHelpers";

export default function MatchSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("all");

  useEffect(() => {
    fetchData();

    // Real-time subscription for live updates
    const channel = supabase
      .channel(`matches_${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `tournament_id=eq.${id}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(
          `
          *,
          team1:teams!matches_team1_id_fkey(id, name, age_division),
          team2:teams!matches_team2_id_fkey(id, name, age_division),
          field:tournament_fields(field_number, field_name)
        `
        )
        .eq("tournament_id", id)
        .order("scheduled_time", { ascending: true, nullsFirst: false })
        .order("round_number", { ascending: true });

      if (matchesError) throw matchesError;
      setMatches(matchesData || []);

      const { data: fieldsData, error: fieldsError } = await supabase
        .from("tournament_fields")
        .select("*")
        .eq("tournament_id", id)
        .order("field_number", { ascending: true });

      if (fieldsError) throw fieldsError;
      setFields(fieldsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    );
  }

  const isDirector = profile?.role === "tournament_director";
  const canScore = [
    "volunteer",
    "scoring_team",
    "tournament_director",
  ].includes(profile?.role);

  // Group matches by date
  const matchesByDate = matches.reduce((acc, match) => {
    if (!match.scheduled_time) {
      acc["unscheduled"] = acc["unscheduled"] || [];
      acc["unscheduled"].push(match);
    } else {
      const date = formatMatchDate(match.scheduled_time);
      acc[date] = acc[date] || [];
      acc[date].push(match);
    }
    return acc;
  }, {});

  const dates = Object.keys(matchesByDate).filter((d) => d !== "unscheduled");

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    const round = match.round_name || `Round ${match.round_number}`;
    acc[round] = acc[round] || [];
    acc[round].push(match);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/tournaments/${id}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tournament
      </Button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Match Schedule</h1>
          <p className="text-muted-foreground">{tournament?.name}</p>
        </div>
        {isDirector && (
          <Button asChild>
            <Link to={`/tournaments/${id}/schedule/create`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Schedule
            </Link>
          </Button>
        )}
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">No matches scheduled yet</p>
            <p className="text-muted-foreground mb-4">
              {isDirector
                ? "Create a schedule to start planning matches"
                : "Check back soon for the tournament schedule"}
            </p>
            {isDirector && (
              <Button asChild>
                <Link to={`/tournaments/${id}/schedule/create`}>
                  Create Schedule
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="by-date" className="space-y-4">
          <TabsList>
            <TabsTrigger value="by-date">By Date</TabsTrigger>
            <TabsTrigger value="by-round">By Round</TabsTrigger>
            <TabsTrigger value="by-field">By Field</TabsTrigger>
          </TabsList>

          {/* By Date View */}
          <TabsContent value="by-date" className="space-y-4">
            {matchesByDate["unscheduled"] && (
              <Card>
                <CardHeader>
                  <CardTitle>Unscheduled Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <MatchList
                    matches={matchesByDate["unscheduled"]}
                    canScore={canScore}
                  />
                </CardContent>
              </Card>
            )}

            {dates.map((date) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {date}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MatchList
                    matches={matchesByDate[date]}
                    canScore={canScore}
                    showTime
                  />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* By Round View */}
          <TabsContent value="by-round" className="space-y-4">
            {Object.entries(matchesByRound).map(([round, roundMatches]) => (
              <Card key={round}>
                <CardHeader>
                  <CardTitle>{round}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MatchList
                    matches={roundMatches}
                    canScore={canScore}
                    showTime
                  />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* By Field View */}
          <TabsContent value="by-field" className="space-y-4">
            {fields.map((field) => {
              const fieldMatches = matches.filter(
                (m) => m.field_id === field.id
              );
              if (fieldMatches.length === 0) return null;

              return (
                <Card key={field.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {field.field_name || `Field ${field.field_number}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MatchList
                      matches={fieldMatches}
                      canScore={canScore}
                      showTime
                    />
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function MatchList({ matches, canScore, showTime }) {
  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <div
          key={match.id}
          className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {showTime && match.scheduled_time && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatMatchTime(match.scheduled_time)}
                  </div>
                )}
                <Badge variant="outline" className="text-xs">
                  {match.round_name || `Round ${match.round_number}`}
                </Badge>
                {match.field && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {match.field.field_name ||
                      `Field ${match.field.field_number}`}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="text-right md:text-left">
                  <p className="font-semibold text-lg">
                    {match.team1?.name || "TBD"}
                  </p>
                </div>

                <div className="text-center">
                  {match.status === "completed" ? (
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                      <span
                        className={
                          match.winner_id === match.team1_id
                            ? "text-green-600"
                            : ""
                        }
                      >
                        {match.team1_score || 0}
                      </span>
                      <span className="text-muted-foreground">-</span>
                      <span
                        className={
                          match.winner_id === match.team2_id
                            ? "text-green-600"
                            : ""
                        }
                      >
                        {match.team2_score || 0}
                      </span>
                    </div>
                  ) : (
                    <Badge
                      className={`${getMatchStatusColor(
                        match.status
                      )} text-white`}
                    >
                      {getMatchStatusLabel(match.status)}
                    </Badge>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-lg">
                    {match.team2?.name || "TBD"}
                  </p>
                </div>
              </div>
            </div>

            {canScore &&
              match.status !== "completed" &&
              match.team1 &&
              match.team2 && (
                <Link to={`/matches/${match.id}/score`}>
                  <Button size="sm" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Score
                  </Button>
                </Link>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
