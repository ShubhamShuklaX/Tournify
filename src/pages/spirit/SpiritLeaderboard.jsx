import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, TrendingUp, Medal } from "lucide-react";
import { toast } from "sonner";
import {
  getSpiritRating,
  calculateAverageSpiritScore,
  SPIRIT_CATEGORIES,
} from "@/lib/spiritHelpers";

export default function SpiritLeaderboard() {
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

      // Fetch all spirit scores for this tournament
      const { data: spiritScores, error: spiritError } = await supabase
        .from("spirit_scores")
        .select(
          `
          *,
          opponent_team:teams!spirit_scores_opponent_team_id_fkey(id, name, age_division),
          match:matches!spirit_scores_match_id_fkey(tournament_id)
        `
        )
        .eq("match.tournament_id", id);

      if (spiritError) throw spiritError;

      // Group scores by opponent team and calculate averages
      const teamScores = {};

      spiritScores.forEach((score) => {
        const teamId = score.opponent_team_id;
        if (!teamScores[teamId]) {
          teamScores[teamId] = {
            team: score.opponent_team,
            scores: [],
            totalScores: {
              rules_knowledge: 0,
              fouls_body_contact: 0,
              fair_mindedness: 0,
              positive_attitude: 0,
              communication: 0,
            },
          };
        }
        teamScores[teamId].scores.push(score.total_score);

        // Accumulate category scores
        SPIRIT_CATEGORIES.forEach((cat) => {
          teamScores[teamId].totalScores[cat.key] += score[cat.key] || 0;
        });
      });

      // Calculate averages and create leaderboard
      const leaderboardData = Object.values(teamScores).map((teamData) => {
        const avgTotal = parseFloat(
          calculateAverageSpiritScore(
            teamData.scores.map((s) => ({ total_score: s }))
          )
        );
        const matchCount = teamData.scores.length;

        const avgCategories = {};
        SPIRIT_CATEGORIES.forEach((cat) => {
          avgCategories[cat.key] = (
            teamData.totalScores[cat.key] / matchCount
          ).toFixed(1);
        });

        return {
          team: teamData.team,
          average: avgTotal,
          matchCount,
          avgCategories,
          rating: getSpiritRating(Math.round(avgTotal)),
        };
      });

      // Sort by average score (descending)
      leaderboardData.sort((a, b) => b.average - a.average);

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load spirit leaderboard");
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
    <div className="container mx-auto p-6 max-w-6xl">
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
          <Award className="h-8 w-8" />
          Spirit of the Game Leaderboard
        </h1>
        <p className="text-muted-foreground">{tournament?.name}</p>
      </div>

      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">No spirit scores yet</p>
            <p className="text-muted-foreground">
              Spirit scores will appear here as teams submit their ratings
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
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
                  <div
                    className={`text-3xl font-bold mb-1 ${leaderboard[1].rating.color}`}
                  >
                    {leaderboard[1].average}
                  </div>
                  <Badge className={leaderboard[1].rating.bgColor}>
                    {leaderboard[1].rating.label}
                  </Badge>
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
                  <div
                    className={`text-4xl font-bold mb-2 ${leaderboard[0].rating.color}`}
                  >
                    {leaderboard[0].average}
                  </div>
                  <Badge className={leaderboard[0].rating.bgColor}>
                    {leaderboard[0].rating.label}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    👑 Spirit Champion
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
                  <div
                    className={`text-3xl font-bold mb-1 ${leaderboard[2].rating.color}`}
                  >
                    {leaderboard[2].average}
                  </div>
                  <Badge className={leaderboard[2].rating.bgColor}>
                    {leaderboard[2].rating.label}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.team.id}
                    className={`p-4 border rounded-lg hover:bg-accent/50 transition-colors ${
                      index < 3 ? "bg-accent/30" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold text-lg">
                          {index < 3 ? getMedalIcon(index) : index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {entry.team.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.team.age_division} • {entry.matchCount} match
                            {entry.matchCount !== 1 ? "es" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-3xl font-bold ${entry.rating.color}`}
                        >
                          {entry.average}
                        </div>
                        <Badge className={entry.rating.bgColor}>
                          {entry.rating.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="grid grid-cols-5 gap-2 pt-3 border-t">
                      {SPIRIT_CATEGORIES.map((cat) => (
                        <div key={cat.key} className="text-center">
                          <p className="text-xs text-muted-foreground mb-1 truncate">
                            {cat.label.split(" ")[0]}
                          </p>
                          <p className="font-semibold">
                            {entry.avgCategories[cat.key]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">
                Category Breakdown Legend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                {SPIRIT_CATEGORIES.map((cat) => (
                  <div key={cat.key}>
                    <p className="font-semibold">{cat.label.split(" ")[0]}</p>
                    <p className="text-muted-foreground">{cat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
