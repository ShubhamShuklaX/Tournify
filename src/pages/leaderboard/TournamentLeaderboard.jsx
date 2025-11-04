import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { calculateTeamStats } from "@/lib/matchHelpers";

export default function TournamentLeaderboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch all matches for the tournament
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", id);

      if (matchesError) throw matchesError;

      // Get all teams registered for this tournament
      const { data: registrations, error: registrationsError } = await supabase
        .from("tournament_registrations")
        .select(
          `
          team_id,
          team:teams(id, name, age_division)
        `
        )
        .eq("tournament_id", id)
        .eq("status", "approved");

      if (registrationsError) throw registrationsError;

      // Calculate stats for each team
      const leaderboardData = registrations.map((registration) => {
        const stats = calculateTeamStats(matches, registration.team_id);
        return {
          team: registration.team,
          ...stats,
          // Points calculation: 3 for win, 1 for tie, 0 for loss
          points: stats.wins * 3 + stats.ties * 1,
        };
      });

      // Sort by: points (desc), point diff (desc), points for (desc), wins (desc)
      leaderboardData.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
        if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
        return b.wins - a.wins;
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const getMedalIcon = (index) => {
    if (index === 0) return <Medal className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-700" />;
    return null;
  };

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

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="h-8 w-8" />
          Tournament Leaderboard
        </h1>
        <p className="text-muted-foreground">{tournament?.name}</p>
      </div>

      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">No standings yet</p>
            <p className="text-muted-foreground">
              Standings will appear here as matches are completed
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && leaderboard[0].played > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <Card className="mt-8">
                <CardContent className="pt-6 text-center">
                  <Medal className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-muted-foreground mb-1">
                    2nd Place
                  </p>
                  <p className="font-bold text-lg mb-1">
                    {leaderboard[1].team.name}
                  </p>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {leaderboard[1].points} pts
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {leaderboard[1].wins}-{leaderboard[1].losses}-
                    {leaderboard[1].ties}
                  </p>
                </CardContent>
              </Card>

              {/* 1st Place */}
              <Card className="border-2 border-yellow-500">
                <CardContent className="pt-6 text-center">
                  <Medal className="h-16 w-16 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm text-muted-foreground mb-1">
                    1st Place
                  </p>
                  <p className="font-bold text-xl mb-1">
                    {leaderboard[0].team.name}
                  </p>
                  <div className="text-4xl font-bold text-yellow-600 mb-2">
                    {leaderboard[0].points} pts
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {leaderboard[0].wins}-{leaderboard[0].losses}-
                    {leaderboard[0].ties}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    👑 Tournament Leader
                  </p>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card className="mt-8">
                <CardContent className="pt-6 text-center">
                  <Medal className="h-12 w-12 mx-auto mb-2 text-amber-700" />
                  <p className="text-sm text-muted-foreground mb-1">
                    3rd Place
                  </p>
                  <p className="font-bold text-lg mb-1">
                    {leaderboard[2].team.name}
                  </p>
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {leaderboard[2].points} pts
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {leaderboard[2].wins}-{leaderboard[2].losses}-
                    {leaderboard[2].ties}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Full Standings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Standings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent/50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Team
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        GP
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">W</th>
                      <th className="px-4 py-3 text-center font-semibold">L</th>
                      <th className="px-4 py-3 text-center font-semibold">T</th>
                      <th className="px-4 py-3 text-center font-semibold">
                        PF
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        PA
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Diff
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry.team.id}
                        className={`border-b hover:bg-accent/50 transition-colors ${
                          index < 3 ? "bg-accent/20" : ""
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {index < 3 ? (
                              getMedalIcon(index)
                            ) : (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 font-bold text-sm">
                                {index + 1}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold">{entry.team.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.team.age_division}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {entry.played}
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-green-600">
                          {entry.wins}
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-red-600">
                          {entry.losses}
                        </td>
                        <td className="px-4 py-4 text-center text-muted-foreground">
                          {entry.ties}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {entry.pointsFor}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {entry.pointsAgainst}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={
                              entry.pointDiff > 0
                                ? "text-green-600 font-semibold"
                                : entry.pointDiff < 0
                                ? "text-red-600 font-semibold"
                                : ""
                            }
                          >
                            {entry.pointDiff > 0 ? "+" : ""}
                            {entry.pointDiff}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant="default" className="font-bold">
                            {entry.points}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-semibold mb-2">Legend:</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold">GP:</span> Games Played
                  </div>
                  <div>
                    <span className="font-semibold">W:</span> Wins
                  </div>
                  <div>
                    <span className="font-semibold">L:</span> Losses
                  </div>
                  <div>
                    <span className="font-semibold">T:</span> Ties
                  </div>
                  <div>
                    <span className="font-semibold">PF:</span> Points For
                  </div>
                  <div>
                    <span className="font-semibold">PA:</span> Points Against
                  </div>
                  <div>
                    <span className="font-semibold">Diff:</span> Point
                    Differential
                  </div>
                  <div>
                    <span className="font-semibold">Pts:</span> Tournament
                    Points
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * Points: Win = 3 pts, Tie = 1 pt, Loss = 0 pts
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Matches
                    </p>
                    <p className="text-2xl font-bold">
                      {leaderboard.reduce((sum, team) => sum + team.played, 0) /
                        2}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Goals</p>
                    <p className="text-2xl font-bold">
                      {leaderboard.reduce(
                        (sum, team) => sum + team.pointsFor,
                        0
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Participating Teams
                    </p>
                    <p className="text-2xl font-bold">{leaderboard.length}</p>
                  </div>
                  <Medal className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
