import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, Trophy, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatMatchDateTime } from "@/lib/matchHelpers";

export default function LiveScoring() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [scores, setScores] = useState({
    team1_score: 0,
    team2_score: 0,
  });

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          *,
          team1:teams!matches_team1_id_fkey(id, name, age_division),
          team2:teams!matches_team2_id_fkey(id, name, age_division),
          field:tournament_fields(field_number, field_name),
          tournament:tournaments(name)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      setMatch(data);
      setScores({
        team1_score: data.team1_score || 0,
        team2_score: data.team2_score || 0,
      });
    } catch (error) {
      console.error("Error fetching match:", error);
      toast.error("Failed to load match");
    } finally {
      setLoading(false);
    }
  };

  const updateScore = (team, increment) => {
    setScores((prev) => ({
      ...prev,
      [`team${team}_score`]: Math.max(0, prev[`team${team}_score`] + increment),
    }));
  };

  const handleStartMatch = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "in_progress" })
        .eq("id", id);

      if (error) throw error;

      toast.success("Match started!");
      fetchMatch();
    } catch (error) {
      console.error("Error starting match:", error);
      toast.error("Failed to start match");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateScore = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("matches")
        .update({
          team1_score: scores.team1_score,
          team2_score: scores.team2_score,
          status: "in_progress",
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Score updated!");
      fetchMatch();
    } catch (error) {
      console.error("Error updating score:", error);
      toast.error("Failed to update score");
    } finally {
      setUpdating(false);
    }
  };

  const handleEndMatch = async () => {
    if (scores.team1_score === scores.team2_score) {
      toast.error(
        "Cannot end match with a tie. Please add a tiebreaker or set a winner."
      );
      return;
    }

    setUpdating(true);
    try {
      const winnerId =
        scores.team1_score > scores.team2_score
          ? match.team1_id
          : match.team2_id;

      const { error } = await supabase
        .from("matches")
        .update({
          team1_score: scores.team1_score,
          team2_score: scores.team2_score,
          winner_id: winnerId,
          status: "completed",
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Match completed!");
      navigate(`/tournaments/${match.tournament_id}/schedule`);
    } catch (error) {
      console.error("Error ending match:", error);
      toast.error("Failed to end match");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match || !match.team1 || !match.team2) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-xl mb-4">Match not found or incomplete</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit = match.status !== "completed";
  const isLive = match.status === "in_progress";

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/tournaments/${match.tournament_id}/schedule`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Schedule
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">
                {match.tournament?.name}
              </CardTitle>
              <p className="text-muted-foreground">
                {match.round_name || `Round ${match.round_number}`}
              </p>
            </div>
            {isLive && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="font-medium">LIVE</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {match.scheduled_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatMatchDateTime(match.scheduled_time)}</span>
              </div>
            )}
            {match.field && (
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span>
                  {match.field.field_name ||
                    `Field ${match.field.field_number}`}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Team 1 */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold mb-2">{match.team1.name}</h3>
              <p className="text-sm text-muted-foreground">
                {match.team1.age_division}
              </p>
            </div>
            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {scores.team1_score}
              </div>
              {match.status === "completed" &&
                match.winner_id === match.team1_id && (
                  <div className="text-green-600 font-semibold">WINNER</div>
                )}
            </div>
            {canEdit && (
              <div className="flex gap-2 justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => updateScore(1, -1)}
                  disabled={scores.team1_score === 0}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => updateScore(1, 1)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* VS / Actions */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full space-y-4">
            <div className="text-4xl font-bold text-muted-foreground">VS</div>

            {match.status === "scheduled" && (
              <Button
                onClick={handleStartMatch}
                disabled={updating}
                size="lg"
                className="w-full"
              >
                Start Match
              </Button>
            )}

            {match.status === "in_progress" && (
              <>
                <Button
                  onClick={handleUpdateScore}
                  disabled={updating}
                  size="lg"
                  className="w-full"
                >
                  Update Score
                </Button>
                <Button
                  onClick={handleEndMatch}
                  disabled={
                    updating || scores.team1_score === scores.team2_score
                  }
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  End Match
                </Button>
              </>
            )}

            {match.status === "completed" && (
              <div className="text-center">
                <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                <p className="font-semibold text-green-600">Match Completed</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team 2 */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold mb-2">{match.team2.name}</h3>
              <p className="text-sm text-muted-foreground">
                {match.team2.age_division}
              </p>
            </div>
            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-red-600 mb-2">
                {scores.team2_score}
              </div>
              {match.status === "completed" &&
                match.winner_id === match.team2_id && (
                  <div className="text-green-600 font-semibold">WINNER</div>
                )}
            </div>
            {canEdit && (
              <div className="flex gap-2 justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => updateScore(2, -1)}
                  disabled={scores.team2_score === 0}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => updateScore(2, 1)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      {canEdit && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Instructions</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Use the + and - buttons to adjust scores</li>
              <li>Click "Update Score" to save changes during the match</li>
              <li>
                Click "End Match" when the game is finished (scores must be
                different)
              </li>
              <li>
                The team with the higher score will be marked as the winner
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
